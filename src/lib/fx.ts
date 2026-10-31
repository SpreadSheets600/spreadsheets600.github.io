/** Shared motion helpers: scroll reveals, count-ups, card spotlight, tooltips and toasts. */

export const prefersReducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function countUp(el: HTMLElement, to: number, options: { decimals?: number; duration?: number; prefix?: string; suffix?: string } = {}) {
	const { decimals = 0, duration = 1400, prefix = "", suffix = "" } = options;
	const format = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	const write = (value: number) => (el.textContent = `${prefix}${format.format(value)}${suffix}`);

	if (prefersReducedMotion() || !Number.isFinite(to)) {
		write(to);
		return;
	}

	const start = performance.now();
	const tick = (now: number) => {
		const progress = Math.min(1, (now - start) / duration);
		write(to * easeOutExpo(progress));
		if (progress < 1) requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}

let observer: IntersectionObserver | null = null;

const activate = (el: Element) => {
	el.classList.add("is-in");
	el.querySelectorAll<HTMLElement>("[data-count]").forEach(runCount);
	if (el instanceof HTMLElement && el.dataset.count !== undefined) runCount(el);
};

const runCount = (el: HTMLElement) => {
	if (el.dataset.counted) return;
	el.dataset.counted = "1";
	countUp(el, Number(el.dataset.count), {
		decimals: Number(el.dataset.decimals ?? 0),
		prefix: el.dataset.prefix ?? "",
		suffix: el.dataset.suffix ?? "",
	});
};

/**
 * Reveal `[data-reveal]` elements (and run their `[data-count]` numbers) when they scroll into
 * view. Call again after injecting markup. Nested bars/rings animate through CSS on `.is-in`.
 */
export function observeReveals(root: ParentNode = document) {
	const targets = Array.from(root.querySelectorAll("[data-reveal]:not(.is-in)"));
	if (root instanceof Element && root.matches("[data-reveal]:not(.is-in)")) targets.unshift(root);

	if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
		targets.forEach(activate);
		return;
	}

	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				activate(entry.target);
				observer?.unobserve(entry.target);
			}
		},
		{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
	);

	targets.forEach((target) => observer!.observe(target));
}

let toastTimer: number | undefined;

export function toast(message: string) {
	let el = document.getElementById("s600-toast");
	if (!el) {
		el = document.createElement("div");
		el.id = "s600-toast";
		el.setAttribute("role", "status");
		el.className = "s600-toast";
		document.body.appendChild(el);
	}
	el.textContent = message;
	el.classList.add("is-on");
	window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => el!.classList.remove("is-on"), 1800);
}

/** Click any `[data-copy]` element to copy its value. */
const bindCopy = () => {
	document.addEventListener("click", async (event) => {
		const target = (event.target as Element | null)?.closest<HTMLElement>("[data-copy]");
		if (!target) return;
		try {
			await navigator.clipboard.writeText(target.dataset.copy ?? "");
			toast(`Copied ${target.dataset.copy}`);
		} catch {
			toast("Copy failed");
		}
	});
};

/** One floating tooltip shared by everything with `[data-tip]`. */
const bindTooltip = () => {
	const tip = document.createElement("div");
	tip.className = "s600-tip";
	tip.setAttribute("role", "tooltip");
	document.body.appendChild(tip);

	let active: HTMLElement | null = null;

	const place = (x: number, y: number) => {
		const pad = 10;
		const rect = tip.getBoundingClientRect();
		const left = Math.min(Math.max(pad, x - rect.width / 2), window.innerWidth - rect.width - pad);
		const top = y - rect.height - 14 < pad ? y + 18 : y - rect.height - 14;
		tip.style.transform = `translate(${left}px, ${top}px)`;
	};

	const show = (el: HTMLElement, x: number, y: number) => {
		if (active !== el) {
			active = el;
			tip.textContent = el.dataset.tip ?? "";
		}
		tip.classList.add("is-on");
		place(x, y);
	};

	const hide = () => {
		active = null;
		tip.classList.remove("is-on");
	};

	document.addEventListener("pointermove", (event) => {
		const el = (event.target as Element | null)?.closest<HTMLElement>("[data-tip]");
		if (el) show(el, event.clientX, event.clientY);
		else if (active) hide();
	});
	document.addEventListener("pointerleave", hide);
	window.addEventListener("scroll", hide, { passive: true });
	document.addEventListener("focusin", (event) => {
		const el = (event.target as Element | null)?.closest<HTMLElement>("[data-tip]");
		if (!el) return;
		const rect = el.getBoundingClientRect();
		show(el, rect.left + rect.width / 2, rect.top);
	});
	document.addEventListener("focusout", hide);
};

/** Cursor-following glow on cards: sets --mx/--my that the CSS reads. */
const bindSpotlight = () => {
	let frame = 0;
	document.addEventListener(
		"pointermove",
		(event) => {
			const card = (event.target as Element | null)?.closest<HTMLElement>(".card-shell, .card-shell-lg");
			if (!card || frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const rect = card.getBoundingClientRect();
				card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
				card.style.setProperty("--my", `${event.clientY - rect.top}px`);
			});
		},
		{ passive: true },
	);
};

let initialised = false;

export function initFx() {
	if (initialised) return;
	initialised = true;
	bindSpotlight();
	bindTooltip();
	bindCopy();
	observeReveals();
}
