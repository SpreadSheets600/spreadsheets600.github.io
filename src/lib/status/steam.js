let refreshTimer = null;

function getEl(container, id) {
    return container?.querySelector(`#${id}`) ?? document.getElementById(id);
}

function getStatusInfo(state) {
    const states = {
        0: { label: "Offline", color: "#9ca3af" },
        1: { label: "Online", color: "#34d399" },
        2: { label: "Busy", color: "#f87171" },
        3: { label: "Away", color: "#fbbf24" },
        4: { label: "Snooze", color: "#a78bfa" },
        5: { label: "Looking to Trade", color: "#38bdf8" },
        6: { label: "Looking to Play", color: "#60a5fa" },
    };
    return states[state] || states[0];
}

function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 0) return "just now";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function updateUI(data, els) {
    const profile = data?.profile || {};
    const stats = data?.stats || {};
    const recent = Array.isArray(data?.recentGames) ? data.recentGames : [];

    if (els.profileLink && profile.profileUrl) {
        els.profileLink.href = profile.profileUrl;
        els.profileLink.classList.remove("hidden");
    }

    if (els.avatar && profile.avatar) {
        els.avatar.src = profile.avatar;
    }

    if (els.name) els.name.textContent = profile.name || "Unknown";

    const statusInfo = getStatusInfo(profile.status);
    if (els.statusIndicator) {
        els.statusIndicator.style.backgroundColor = statusInfo.color;
    }
    if (els.statusPill) {
        els.statusPill.textContent = statusInfo.label;
        els.statusPill.style.borderColor = `${statusInfo.color}66`;
        els.statusPill.style.backgroundColor = `${statusInfo.color}22`;
        els.statusPill.style.color = statusInfo.color;
    }

    if (els.lastSeen) {
        if (profile.status === 0 && profile.lastLogoff) {
            els.lastSeen.textContent = `Last seen ${formatRelativeTime(profile.lastLogoff * 1000)}`;
        } else if (profile.status === 0) {
            els.lastSeen.textContent = "Offline";
        } else {
            els.lastSeen.textContent = "Online now";
        }
    }

    const hasCurrent = Boolean(profile.currentGame);
    if (hasCurrent) {
        if (els.currently) els.currently.classList.remove("hidden");
        if (els.currentlyImage && profile.currentGame.header) {
            els.currentlyImage.src = profile.currentGame.header;
        }
        if (els.currentlyName) {
            els.currentlyName.textContent =
                profile.currentGame.name || "In-game";
        }

        if (els.playingNowCard) els.playingNowCard.classList.remove("hidden");
        if (els.playingNowImage && profile.currentGame.header) {
            els.playingNowImage.src = profile.currentGame.header;
        }
        if (els.playingNowName) {
            els.playingNowName.textContent =
                profile.currentGame.name || "In-game";
        }
    } else {
        if (els.currently) els.currently.classList.add("hidden");
        if (els.playingNowCard) els.playingNowCard.classList.add("hidden");
    }

    if (els.totalGames) els.totalGames.textContent = `${stats.totalGames ?? 0}`;
    if (els.totalHours) els.totalHours.textContent = `${stats.totalHours ?? 0}`;

    if (els.recentList) {
        if (recent.length === 0) {
            els.recentList.innerHTML = "";
            if (els.noActivity) els.noActivity.classList.remove("hidden");
            return;
        }

        if (els.noActivity) els.noActivity.classList.add("hidden");

        const items = recent.slice(0, 2).map((game) => {
            const playtime2w = Math.round((game.playtime_2weeks || 0) / 60);
            const playtimeTotal = Math.round((game.playtime_forever || 0) / 60);
            const playtimeLabel = [
                playtimeTotal ? `Playtime :  ${playtimeTotal}h` : null,
            ]
                .filter(Boolean)
                .join(" • ");

            return `
        <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <img src="${game.header}" alt="${game.name}" class="w-16 h-10 rounded-lg object-cover" />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-white truncate">${game.name}</p>
            <p class="text-xs text-white/60 truncate">${playtimeLabel || "No recent playtime"}</p>
          </div>
        </div>
      `;
        });

        els.recentList.innerHTML = items.join("");
    }
}

export async function init(container) {
    if (!container) return;
    if (container.dataset.steamInit === "1") return;
    container.dataset.steamInit = "1";

    const els = {
        loading: getEl(container, "steam-loading"),
        error: getEl(container, "steam-error"),
        errorMessage: getEl(container, "steam-error-message"),
        retryBtn: getEl(container, "steam-retry-btn"),
        content: getEl(container, "steam-content"),

        profileLink: getEl(container, "steam-profile-link"),
        avatar: getEl(container, "steam-avatar"),
        statusIndicator: getEl(container, "steam-status-indicator"),
        statusPill: getEl(container, "steam-status-pill"),
        name: getEl(container, "steam-name"),
        lastSeen: getEl(container, "steam-last-seen"),

        currently:
            getEl(container, "steam-currently-playing") ||
            getEl(container, "steam-playing-container"),
        currentlyImage:
            getEl(container, "steam-currently-image") ||
            getEl(container, "steam-playing-image"),
        currentlyName:
            getEl(container, "steam-currently-name") ||
            getEl(container, "steam-playing-name"),

        playingNowCard: getEl(container, "steam-playing-now-card"),
        playingNowImage: getEl(container, "steam-playing-now-image"),
        playingNowName: getEl(container, "steam-playing-now-name"),

        totalGames: getEl(container, "steam-total-games"),
        totalHours: getEl(container, "steam-total-hours"),

        recentList:
            getEl(container, "steam-recent-list") ||
            getEl(container, "steam-recent-games-list"),
        noActivity: getEl(container, "steam-no-activity"),
    };

    const steamId = container?.dataset?.steamId;
    const vanity = container?.dataset?.vanity;
    const endpoint = container?.dataset?.endpoint || "/api/steam-status";

    const fetchAndUpdate = async () => {
        if (els.loading) els.loading.classList.remove("hidden");
        if (els.error) els.error.classList.add("hidden");
        if (els.content) els.content.classList.add("hidden");

        try {
            const url = new URL(endpoint, window.location.origin);
            if (steamId) url.searchParams.set("steamId", steamId);
            if (vanity) url.searchParams.set("vanity", vanity);

            const res = await fetch(url.toString(), {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) {
                let message = `Steam API error (${res.status})`;
                try {
                    const errData = await res.json();
                    if (errData?.error) message = errData.error;
                    if (errData?.upstreamStatus) {
                        message += ` (Upstream ${errData.upstreamStatus})`;
                    }
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }
            const data = await res.json();
            if (data?.error) throw new Error(data.error);

            updateUI(data, els);
            if (els.loading) els.loading.classList.add("hidden");
            if (els.content) els.content.classList.remove("hidden");
        } catch (err) {
            if (els.loading) els.loading.classList.add("hidden");
            if (els.error) els.error.classList.remove("hidden");
            if (els.errorMessage)
                els.errorMessage.textContent =
                    err?.message || "Steam status unavailable.";
        }
    };

    els.retryBtn?.addEventListener("click", fetchAndUpdate);
    await fetchAndUpdate();

    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchAndUpdate, 120000);
}
