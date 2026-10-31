/** Tiny HTML templating with escaping by default; everything from the API is untrusted text. */

class Raw {
	constructor(readonly value: string) {}
}

export const raw = (value: string) => new Raw(value);

export const esc = (value: unknown): string =>
	String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);

const render = (value: unknown): string => {
	if (value === null || value === undefined || value === false) return "";
	if (value instanceof Raw) return value.value;
	if (Array.isArray(value)) return value.map(render).join("");
	return esc(value);
};

/** `html\`<p>${userText}</p>\`` escapes interpolations; wrap pre-built markup in raw() or nest html``. */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Raw {
	let out = "";
	strings.forEach((part, index) => {
		out += part;
		if (index < values.length) out += render(values[index]);
	});
	return new Raw(out);
}

export const toHtml = (value: Raw | string): string => (value instanceof Raw ? value.value : esc(value));

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const fmt = (value: number | null | undefined) => numberFormat.format(Math.round(value ?? 0));
export const compact = (value: number | null | undefined) => compactFormat.format(value ?? 0);

export function timeAgo(input: number | string | Date | null | undefined): string {
	if (input === null || input === undefined) return "never";
	// Unix seconds (AniList, Steam) are normalised to ms.
	const ms = typeof input === "number" ? (input < 1e12 ? input * 1000 : input) : new Date(input).getTime();
	if (!Number.isFinite(ms)) return "unknown";

	const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
	if (seconds < 45) return "just now";
	const units: [number, string][] = [
		[60, "m"],
		[3600, "h"],
		[86400, "d"],
		[2592000, "mo"],
		[31536000, "y"],
	];
	let label = `${seconds}s`;
	for (const [size, name] of units) {
		if (seconds >= size) label = `${Math.floor(seconds / size)}${name}`;
	}
	return `${label} ago`;
}

export function duration(seconds: number): string {
	const total = Math.max(0, Math.round(seconds));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	if (h === 0) return `${m}m`;
	return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function clock(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const longDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

export const shortDay = (iso: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
