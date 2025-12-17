const badgeFlags = {
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

// Based on https://lanyard.alejo.io/badges
const badgeInfo = {
	STAFF: {
		label: "Discord Staff",
		icon: "https://discord.com/assets/f8077b233877047cf88725835b0d8291.svg",
	},
	PARTNER: {
		label: "Partnered Server Owner",
		icon: "https://discord.com/assets/3f974011d5f48332159132517a7abc41.svg",
	},
	HYPESQUAD: {
		label: "HypeSquad Events",
		icon: "https://discord.com/assets/0b5042313e6485b018b763481e35b64c.svg",
	},
	BUG_HUNTER_LEVEL_1: {
		label: "Bug Hunter (Level 1)",
		icon: "https://discord.com/assets/2f669d4b732d847526955a5857a24559.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_1: {
		label: "HypeSquad Bravery",
		icon: "https://discord.com/assets/3868616da5a23f53c15330a113d077b4.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_2: {
		label: "HypeSquad Brilliance",
		icon: "https://discord.com/assets/3673f3d794de8c774df83b2724647309.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_3: {
		label: "HypeSquad Balance",
		icon: "https://discord.com/assets/2e04f2c2356aa0425ea8b9c48c64267e.svg",
	},
	PREMIUM_EARLY_SUPPORTER: {
		label: "Early Supporter",
		icon: "https://discord.com/assets/e60c8227dbf8146c87515a1c383f6fbf.svg",
	},
	TEAM_PSEUDO_USER: {
		label: "Team User",
		icon: null, // No specific icon for this
	},
	SYSTEM: {
		label: "System",
		icon: null, // No specific icon for this
	},
	BUG_HUNTER_LEVEL_2: {
		label: "Bug Hunter (Level 2)",
		icon: "https://discord.com/assets/0a0738c8291f379632497ac0904f4acc.svg",
	},
	VERIFIED_BOT: {
		label: "Verified Bot",
		icon: null, // Not a user badge
	},
	VERIFIED_DEVELOPER: {
		label: "Early Verified Bot Developer",
		icon: "https://discord.com/assets/409a4746f337a3c306d6480b0f7a73a2.svg",
	},
	CERTIFIED_MODERATOR: {
		label: "Discord Certified Moderator",
		icon: "https://discord.com/assets/fb03f8475d68804825d020eaa5314775.svg",
	},
	ACTIVE_DEVELOPER: {
		label: "Active Developer",
		icon: "https://discord.com/assets/dd3c72e2768564032d16453c84776161.svg",
	},
};

export function decodeUserFlags(flags) {
	const badges = [];
	for (const flagName in badgeFlags) {
		if ((flags & badgeFlags[flagName]) === badgeFlags[flagName]) {
			const badge = badgeInfo[flagName];
			if (badge && badge.icon) {
				badges.push(badge);
			}
		}
	}
	return badges;
}

export async function fetchUserImages(data) {
	if (!data?.discord_user) {
		return {};
	}
	const { discord_user, activities, spotify } = data;

	const avatarExtension = discord_user.avatar?.startsWith("a_") ? "gif" : "webp";
	const defaultAvatarIndex =
		discord_user.discriminator === "0"
			? (Number(BigInt(discord_user.id) >> BigInt(22)) % 6) || 0
			: Number(discord_user.discriminator) % 5;

	const avatar = discord_user.avatar
		? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${avatarExtension}?size=256`
		: `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png?size=256`;

	const avatarDecoration = discord_user.avatar_decoration_data?.asset
		? `https://cdn.discordapp.com/avatar-decoration-presets/${discord_user.avatar_decoration_data.asset}.png?size=128&passthrough=true`
		: null;

	const clanBadge =
		discord_user.primary_guild?.identity_guild_id && discord_user.primary_guild.badge
			? `https://cdn.discordapp.com/clan-badges/${discord_user.primary_guild.identity_guild_id}/${discord_user.primary_guild.badge}.png?size=32`
			: null;

	const mainActivity = activities?.find((act) => act.type === 0);
	const assetLargeImage = mainActivity?.assets?.large_image
		? mainActivity.assets.large_image.startsWith("mp:external/")
			? `https://media.discordapp.net/${mainActivity.assets.large_image.replace("mp:", "")}`
			: `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.large_image}.webp`
		: null;

	const assetSmallImage = mainActivity?.assets?.small_image
		? mainActivity.assets.small_image.startsWith("mp:external/")
			? `https://media.discordapp.net/${mainActivity.assets.small_image.replace("mp:", "")}`
			: `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.small_image}.webp`
		: null;

	const spotifyAlbumArt = spotify?.album_art_url || null;

	return {
		avatar,
		avatarDecoration,
		clanBadge,
		assetLargeImage,
		assetSmallImage,
		spotifyAlbumArt,
	};
}
