import { fetchUserImages, getActivityAssets } from "../../utils/imageUtils.js";
import { subscribeToLanyard, refreshLanyard } from "./lanyard.js";

function getEl(container, id) {
    return container?.querySelector(`#${id}`) ?? document.getElementById(id);
}

function getStatusColorHex(status) {
    const colorMap = {
        online: "#43b581",
        idle: "#faa61a",
        dnd: "#f04747",
        offline: "#747f8d",
    };
    return colorMap[status] || "#747f8d";
}

function getStatusLabel(status) {
    const labels = {
        online: "Online",
        idle: "Idle",
        dnd: "Do Not Disturb",
        offline: "Offline",
    };
    return labels[status] || "Offline";
}

function getActivityIconClass(type) {
    const icons = {
        0: "ph-game-controller",
        1: "ph-broadcast",
        2: "ph-music-note",
        3: "ph-television",
        5: "ph-trophy",
    };
    return icons[type] || "ph-circle";
}

function updateTimes(container) {
    const timers =
        container?.querySelectorAll(".activity-timer") ??
        document.querySelectorAll(".activity-timer");
    const now = Date.now();
    timers.forEach((timer) => {
        const start = parseInt(timer.getAttribute("data-start"));
        if (!isNaN(start)) {
            const diff = now - start;
            const hours = Math.floor(diff / (1000 * 60 * 60))
                .toString()
                .padStart(2, "0");
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
                .toString()
                .padStart(2, "0");
            const seconds = Math.floor((diff / 1000) % 60)
                .toString()
                .padStart(2, "0");
            timer.textContent = `${hours}:${minutes}:${seconds}${timer.dataset?.format === "short" ? "" : " elapsed"}`;
        }
    });
}

export function init(container, userId) {
    if (!container) return;
    if (container.dataset.discordInit === "1") return;
    container.dataset.discordInit = "1";

    const USER_ID =
        userId || container?.dataset?.userId || "727012870683885578";
    let presence = null;
    let timersInterval = null;
    let unsubscribe = null;

    const els = {
        loading: getEl(container, "discord-loading"),
        error: getEl(container, "discord-error"),
        content: getEl(container, "discord-content"),
        retryBtn: getEl(container, "discord-retry-btn"),
        statusPill: getEl(container, "discord-status-pill"),

        avatar: getEl(container, "discord-avatar"),
        avatarDecoration: getEl(container, "discord-avatar-decoration"),
        statusIndicator: getEl(container, "discord-status-indicator"),
        name: getEl(container, "discord-name"),
        username: getEl(container, "discord-username"),
        clanTag: getEl(container, "discord-clan-tag"),
        clanBadge: getEl(container, "discord-clan-badge"),
        clanText: getEl(container, "discord-clan-text"),
        badges: getEl(container, "discord-badges"),

        customStatus: getEl(container, "discord-custom-status"),
        customEmojiImg: getEl(container, "discord-custom-emoji-img"),
        customEmoji: getEl(container, "discord-custom-emoji"),
        customText: getEl(container, "discord-custom-text"),

        activitiesList: getEl(container, "discord-activities-list"),
        noActivity: getEl(container, "discord-no-activity"),
    };

    const showLoading = () => {
        if (els.loading) els.loading.classList.remove("hidden");
        if (els.error) els.error.classList.add("hidden");
        if (els.content) els.content.classList.add("hidden");
        if (els.statusPill) els.statusPill.classList.add("hidden");
    };

    const showError = () => {
        if (els.loading) els.loading.classList.add("hidden");
        if (els.error) els.error.classList.remove("hidden");
        if (els.content) els.content.classList.add("hidden");
    };

    const updateUI = async () => {
        if (!presence) return;

        const images = await fetchUserImages(presence);

        if (els.avatar && images.avatar) {
            els.avatar.src = images.avatar;
            const statusColor = getStatusColorHex(presence.discord_status);
            els.avatar.style.border = `2px solid ${statusColor}`;
        }

        if (els.avatarDecoration) {
            if (images.avatarDecoration) {
                els.avatarDecoration.src = images.avatarDecoration;
                els.avatarDecoration.classList.remove("hidden");
            } else {
                els.avatarDecoration.classList.add("hidden");
            }
        }

        if (els.statusIndicator) {
            const statusColor = getStatusColorHex(presence.discord_status);
            els.statusIndicator.style.backgroundColor = statusColor;
        }

        if (els.statusPill) {
            const statusColor = getStatusColorHex(presence.discord_status);
            const statusLabel = getStatusLabel(presence.discord_status);
            els.statusPill.textContent = statusLabel;
            els.statusPill.style.borderColor = `${statusColor}66`;
            els.statusPill.style.backgroundColor = `${statusColor}22`;
            els.statusPill.style.color = statusColor;
            els.statusPill.classList.remove("hidden");
        }

        if (els.name) els.name.textContent = presence.discord_user.display_name;
        if (els.username)
            els.username.textContent = presence.discord_user.username;

        if (els.clanTag) {
            if (presence.discord_user.primary_guild?.tag) {
                els.clanTag.classList.remove("hidden");
                if (els.clanText)
                    els.clanText.textContent =
                        presence.discord_user.primary_guild.tag;
                if (images.clanBadge && els.clanBadge) {
                    els.clanBadge.src = images.clanBadge;
                    els.clanBadge.classList.remove("hidden");
                } else if (els.clanBadge) {
                    els.clanBadge.classList.add("hidden");
                }
            } else {
                els.clanTag.classList.add("hidden");
            }
        }

        if (els.badges) {
            els.badges.innerHTML = "";
            const badges = images.badges || [];
            if (badges.length === 0) {
                els.badges.classList.add("hidden");
            } else {
                els.badges.classList.remove("hidden");
                badges.forEach((b) => {
                    const img = document.createElement("img");
                    img.src = b.icon;
                    img.alt = b.label;
                    img.title = b.label;
                    img.loading = "lazy";
                    img.decoding = "async";
                    img.className = "h-5 w-5 object-contain";
                    els.badges.appendChild(img);
                });
            }
        }

        const activities = presence.activities || [];
        const customStatus = activities.find((a) => a.type === 4);
        const otherActivities = activities.filter(
            (a) => a.type !== 4 && a.name !== "Spotify",
        );

        if (els.customStatus) {
            if (customStatus && (customStatus.state || customStatus.emoji)) {
                els.customStatus.classList.remove("hidden");
                if (
                    customStatus.emoji?.id &&
                    images.userEmoji &&
                    els.customEmojiImg
                ) {
                    els.customEmojiImg.src = images.userEmoji;
                    els.customEmojiImg.classList.remove("hidden");
                    if (els.customEmoji)
                        els.customEmoji.classList.add("hidden");
                } else if (customStatus.emoji?.name && els.customEmoji) {
                    els.customEmoji.textContent = customStatus.emoji.name;
                    els.customEmoji.classList.remove("hidden");
                    if (els.customEmojiImg)
                        els.customEmojiImg.classList.add("hidden");
                } else {
                    if (els.customEmoji)
                        els.customEmoji.classList.add("hidden");
                    if (els.customEmojiImg)
                        els.customEmojiImg.classList.add("hidden");
                }

                if (els.customText)
                    els.customText.textContent = customStatus.state || "";
            } else {
                els.customStatus.classList.add("hidden");
            }
        }

        if (otherActivities.length > 0) {
            if (els.noActivity) els.noActivity.classList.add("hidden");
            if (els.activitiesList) {
                els.activitiesList.innerHTML = otherActivities
                    .map((activity) => {
                        const mainActivity = activities.find(
                            (a) => a.type === 0,
                        );
                        const isMain = mainActivity?.id === activity.id;

                        const activityAssets = getActivityAssets(activity);
                        const activityKey =
                            activity.id ||
                            `${activity.application_id || "activity"}-${activities.indexOf(activity)}`;
                        const activityImages =
                            images.activityAssets?.[activityKey];
                        const largeImage =
                            activityImages?.large ||
                            activityAssets.large ||
                            (images.assetLargeImage && isMain
                                ? images.assetLargeImage
                                : null);
                        const smallImage =
                            activityImages?.small ||
                            activityAssets.small ||
                            (images.assetSmallImage && isMain
                                ? images.assetSmallImage
                                : null);

                        let iconHtml = "";
                        if (largeImage) {
                            iconHtml = `<img src="${largeImage}" class="w-16 h-16 rounded-xl object-cover border border-white/10" alt="${activity.name}" />`;
                        } else {
                            const iconClass = getActivityIconClass(
                                activity.type,
                            );
                            iconHtml = `<div class="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"><i class="ph ${iconClass} text-blue-400 text-3xl"></i></div>`;
                        }

                        let smallImageHtml = "";
                        if (smallImage) {
                            smallImageHtml = `<img src="${smallImage}" class="w-6 h-6 rounded-full absolute -bottom-2 -right-2 border-2 border-black" />`;
                        }

                        let elapsedHtml = "";
                        if (activity.timestamps?.start) {
                            const startTime = activity.timestamps.start;
                            elapsedHtml = `<span class="activity-timer text-[11px] text-white/70 border border-white/10 bg-white/5 px-2.5 py-1 rounded-full" data-start="${startTime}" data-format="short">00:00:00</span>`;
                        }

                        return `
              <div class="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                <div class="flex-shrink-0 relative">
                  ${iconHtml}
                  ${smallImageHtml}
                </div>
                <div class="min-w-0 space-y-1 flex-1">
                  <p class="text-white font-semibold truncate">${activity.name}</p>
                  ${activity.details ? `<p class="text-white/70 text-sm truncate">${activity.details}</p>` : ""}
                  ${activity.state ? `<p class="text-white/50 text-sm truncate">${activity.state}</p>` : ""}
                </div>
                ${elapsedHtml}
              </div>
            `;
                    })
                    .join("");
                updateTimes(container);
            }
        } else {
            if (els.activitiesList) els.activitiesList.innerHTML = "";
            if (els.noActivity) els.noActivity.classList.remove("hidden");
        }
    };

    const handlePresence = async (data) => {
        presence = data;
        await updateUI();
        if (els.error) els.error.classList.add("hidden");
        if (els.loading) els.loading.classList.add("hidden");
        if (els.content) els.content.classList.remove("hidden");
    };

    els.retryBtn?.addEventListener("click", () => {
        showLoading();
        refreshLanyard(USER_ID).catch(showError);
    });

    showLoading();
    if (unsubscribe) unsubscribe();
    unsubscribe = subscribeToLanyard(USER_ID, {
        onPresence: handlePresence,
        onError: (err) => {
            console.error(err);
            showError();
        },
    });

    if (timersInterval) clearInterval(timersInterval);
    timersInterval = setInterval(() => updateTimes(container), 1000);
}
