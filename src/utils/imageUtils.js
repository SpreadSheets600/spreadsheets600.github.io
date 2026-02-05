import { Badges, UnknownIconDark } from "./badges.js";

export const badgeFlags = {
    STAFF: 1 << 0,
    PARTNER: 1 << 1,
    HYPESQUAD: 1 << 2,
    BUG_HUNTER_LEVEL_1: 1 << 3,
    HYPESQUAD_ONLINE_HOUSE_1: 1 << 6, // Bravery
    HYPESQUAD_ONLINE_HOUSE_2: 1 << 7, // Brilliance
    HYPESQUAD_ONLINE_HOUSE_3: 1 << 8, // Balance
    PREMIUM_EARLY_SUPPORTER: 1 << 9,
    TEAM_PSEUDO_USER: 1 << 10,
    SYSTEM: 1 << 12,
    BUG_HUNTER_LEVEL_2: 1 << 14,
    VERIFIED_BOT: 1 << 16,
    VERIFIED_DEVELOPER: 1 << 17,
    CERTIFIED_MODERATOR: 1 << 18,
    ACTIVE_DEVELOPER: 1 << 22,
};

export const badgeInfo = {
    STAFF: {
        label: "Discord Staff",
    },
    PARTNER: {
        label: "Partnered Server Owner",
    },
    HYPESQUAD: {
        label: "HypeSquad Events",
    },
    BUG_HUNTER_LEVEL_1: {
        label: "Bug Hunter (Level 1)",
    },
    HYPESQUAD_ONLINE_HOUSE_1: {
        label: "HypeSquad Bravery",
    },
    HYPESQUAD_ONLINE_HOUSE_2: {
        label: "HypeSquad Brilliance",
    },
    HYPESQUAD_ONLINE_HOUSE_3: {
        label: "HypeSquad Balance",
    },
    PREMIUM_EARLY_SUPPORTER: {
        label: "Early Supporter",
    },
    TEAM_PSEUDO_USER: {
        label: "Team User",
    },
    SYSTEM: {
        label: "System",
    },
    BUG_HUNTER_LEVEL_2: {
        label: "Bug Hunter (Level 2)",
    },
    VERIFIED_BOT: {
        label: "Verified Bot",
    },
    VERIFIED_DEVELOPER: {
        label: "Early Verified Bot Developer",
    },
    CERTIFIED_MODERATOR: {
        label: "Discord Certified Moderator",
    },
    ACTIVE_DEVELOPER: {
        label: "Active Developer",
    },
};

const badgeIconMap = {
    STAFF: "Discord_Employee",
    PARTNER: "Partnered_Server_Owner",
    HYPESQUAD: "HypeSquad_Events",
    BUG_HUNTER_LEVEL_1: "Bug_Hunter_Level_1",
    HYPESQUAD_ONLINE_HOUSE_1: "House_Bravery",
    HYPESQUAD_ONLINE_HOUSE_2: "House_Brilliance",
    HYPESQUAD_ONLINE_HOUSE_3: "House_Balance",
    PREMIUM_EARLY_SUPPORTER: "Early_Supporter",
    BUG_HUNTER_LEVEL_2: "Bug_Hunter_Level_2",
    VERIFIED_DEVELOPER: "Early_Verified_Bot_Developer",
    CERTIFIED_MODERATOR: "Discord_Certified_Moderator",
    ACTIVE_DEVELOPER: "Active_Developer",
};

const SKIP_BADGES = new Set(["TEAM_PSEUDO_USER", "SYSTEM"]);
const fallbackBadgeIcon = UnknownIconDark
    ? `data:image/png;base64,${UnknownIconDark}`
    : null;

const dataUrlCache = new Map();

async function toDataUrl(url) {
    if (!url) return null;
    if (dataUrlCache.has(url)) return dataUrlCache.get(url);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch image");
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        dataUrlCache.set(url, dataUrl);
        return dataUrl;
    } catch (err) {
        return url;
    }
}

function resolveBadgeIcon(flagName) {
    const localKey = badgeIconMap[flagName];
    if (localKey && Badges?.[localKey]) {
        return `data:image/png;base64,${Badges[localKey]}`;
    }
    return fallbackBadgeIcon;
}

export function decodeUserFlags(flags) {
    const badges = [];
    for (const flagName in badgeFlags) {
        if ((flags & badgeFlags[flagName]) === badgeFlags[flagName]) {
            if (SKIP_BADGES.has(flagName)) continue;
            const badge = badgeInfo[flagName];
            const icon = resolveBadgeIcon(flagName);
            if (badge && icon) {
                badges.push({ ...badge, icon });
            }
        }
    }
    return badges;
}

export function getActivityAssets(activity) {
    if (!activity?.assets) {
        return { large: null, small: null };
    }

    const toUrl = (image) => {
        if (!image) return null;
        if (image.startsWith("mp:external/")) {
            return `https://media.discordapp.net/${image.replace("mp:", "")}`;
        }
        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }
        if (!activity.application_id) return null;
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.webp`;
    };

    return {
        large: toUrl(activity.assets.large_image),
        small: toUrl(activity.assets.small_image),
    };
}

export async function fetchUserImages(data) {
    if (!data?.discord_user) {
        return {};
    }

    const { discord_user, activities = [], spotify } = data;
    const badges = decodeUserFlags(discord_user.public_flags || 0);

    const avatarExtension = discord_user.avatar?.startsWith("a_")
        ? "gif"
        : "webp";

    const defaultAvatarIndex =
        discord_user.discriminator === "0"
            ? Number(BigInt(discord_user.id) >> BigInt(22)) % 6 || 0
            : Number(discord_user.discriminator) % 5;

    const avatarUrl = discord_user.avatar
        ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${avatarExtension}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png?size=256`;
    const avatar = await toDataUrl(avatarUrl);

    const decorationUrl = discord_user.avatar_decoration_data?.asset
        ? `https://cdn.discordapp.com/avatar-decoration-presets/${discord_user.avatar_decoration_data.asset}.png?size=128&passthrough=true`
        : null;
    const avatarDecoration = decorationUrl
        ? await toDataUrl(decorationUrl)
        : null;

    const clanBadgeUrl =
        discord_user.primary_guild?.identity_guild_id &&
        discord_user.primary_guild.badge
            ? `https://cdn.discordapp.com/clan-badges/${discord_user.primary_guild.identity_guild_id}/${discord_user.primary_guild.badge}.png?size=32`
            : null;
    const clanBadge = clanBadgeUrl ? await toDataUrl(clanBadgeUrl) : null;

    const mainActivity = activities.find((act) => act.type === 0);
    const activityAssetsById = {};
    const getActivityKey = (activity, index) =>
        activity?.id || `${activity.application_id || "activity"}-${index}`;

    for (const [index, activity] of activities.entries()) {
        if (!activity?.assets) continue;
        const key = getActivityKey(activity, index);
        const assets = getActivityAssets(activity);
        activityAssetsById[key] = {
            large: assets.large ? await toDataUrl(assets.large) : null,
            small: assets.small ? await toDataUrl(assets.small) : null,
        };
    }

    const mainKey = mainActivity
        ? getActivityKey(mainActivity, activities.indexOf(mainActivity))
        : null;
    const assetLargeImage = mainKey ? activityAssetsById[mainKey]?.large || null : null;
    const assetSmallImage = mainKey ? activityAssetsById[mainKey]?.small || null : null;

    const statusActivity = activities.find((act) => act.type === 4);
    let userEmoji = null;
    if (statusActivity?.emoji?.id) {
        const statusExt = statusActivity.emoji.animated ? "gif" : "webp";
        const emojiUrl = `https://cdn.discordapp.com/emojis/${statusActivity.emoji.id}.${statusExt}?size=32`;
        userEmoji = await toDataUrl(emojiUrl);
    }

    const spotifyAlbumArt = spotify?.album_art_url
        ? await toDataUrl(spotify.album_art_url)
        : null;

    return {
        avatar,
        badges,
        clanBadge,
        avatarDecoration,
        assetLargeImage,
        assetSmallImage,
        activityAssets: activityAssetsById,
        userEmoji,
        spotifyAlbumArt,
    };
}
