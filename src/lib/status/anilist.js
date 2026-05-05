function getEl(container, id) {
    return container?.querySelector(`#${id}`) ?? document.getElementById(id);
}

async function fetchAniList(query, variables) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`AniList API error (${response.status})`);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function fetchStats(username) {
    const userResponse = await fetchAniList(`query ($name: String) { User(name: $name) { id } }`, { name: username });
    if (!userResponse.data?.User?.id) {
        throw new Error("User not found");
    }

    const userId = userResponse.data.User.id;

    const query = `
        query ($name: String, $userId: Int) {
            User(name: $name) {
                id
                name
                avatar { large }
                siteUrl
                statistics {
                    anime { count minutesWatched episodesWatched meanScore }
                    manga { count chaptersRead volumesRead meanScore }
                }
            }
            latestAnime: Page(perPage: 1) {
                activities(userId: $userId, sort: ID_DESC, type_in: ANIME_LIST) {
                    ... on ListActivity {
                        status
                        media {
                            type
                            format
                            title { english romaji }
                            coverImage { large }
                            siteUrl
                        }
                    }
                }
            }
            latestManga: Page(perPage: 1) {
                activities(userId: $userId, sort: ID_DESC, type_in: MANGA_LIST) {
                    ... on ListActivity {
                        status
                        media {
                            type
                            format
                            title { english romaji }
                            coverImage { large }
                            siteUrl
                        }
                    }
                }
            }
        }
    `;

    const response = await fetchAniList(query, { name: username, userId });
    return response.data;
}

function updateUI(data, container) {
    if (!data?.User) {
        throw new Error("User not found");
    }

    getEl(container, "anilist-username").textContent = data.User.name;
    getEl(container, "anilist-profile-link").href = data.User.siteUrl;

    getEl(container, "anilist-anime-count").textContent =
        data.User.statistics.anime.count || 0;
    getEl(container, "anilist-episodes-count").textContent =
        data.User.statistics.anime.episodesWatched || 0;
    getEl(container, "anilist-anime-score").textContent =
        data.User.statistics.anime.meanScore || 0;
    getEl(container, "anilist-watch-time").textContent =
        Math.round((data.User.statistics.anime.minutesWatched || 0) / 60 / 24) +
        " Days";

    getEl(container, "anilist-manga-count").textContent =
        data.User.statistics.manga.count || 0;
    getEl(container, "anilist-volumes-count").textContent =
        data.User.statistics.manga.volumesRead || 0;
    getEl(container, "anilist-chapters-count").textContent =
        data.User.statistics.manga.chaptersRead || 0;
    getEl(container, "anilist-manga-score").textContent =
        data.User.statistics.manga.meanScore || 0;

    const animeActivity = data.latestAnime?.activities?.[0];
    const animeContainer = getEl(container, "anilist-latest-anime");
    if (animeActivity) {
        const animeTitle =
            animeActivity.media.title.english ||
            animeActivity.media.title.romaji ||
            "-";
        const animeStatus = animeActivity.status || "Watched";
        animeContainer.innerHTML = `
      <a href="${animeActivity.media.siteUrl}" target="_blank" rel="noopener noreferrer" class="block group">
        <div class="aspect-[2/3] w-full mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl border border-white/10">
          <img src="${animeActivity.media.coverImage.large}" alt="${animeTitle}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
        </div>
        <div class="font-semibold text-white text-sm sm:text-base truncate">${animeTitle}</div>
        <div class="text-xs text-white/60 mt-1">${animeStatus} • ${animeActivity.media.format}</div>
      </a>
    `;
    } else {
        animeContainer.innerHTML =
            '<div class="text-sm text-white/60">No Recent Anime Activity</div>';
    }

    const mangaActivity = data.latestManga?.activities?.[0];
    const mangaContainer = getEl(container, "anilist-latest-manga");
    if (mangaActivity) {
        const mangaTitle =
            mangaActivity.media.title.english ||
            mangaActivity.media.title.romaji ||
            "-";
        const mangaStatus = mangaActivity.status || "Read";
        mangaContainer.innerHTML = `
      <a href="${mangaActivity.media.siteUrl}" target="_blank" rel="noopener noreferrer" class="block group">
        <div class="aspect-[2/3] w-full mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl border border-white/10">
          <img src="${mangaActivity.media.coverImage.large}" alt="${mangaTitle}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
        </div>
        <div class="font-semibold text-white text-sm sm:text-base truncate">${mangaTitle}</div>
        <div class="text-xs text-white/60 mt-1">${mangaStatus} • ${mangaActivity.media.format}</div>
      </a>
    `;
    } else {
        mangaContainer.innerHTML =
            '<div class="text-sm text-white/60">No Recent Manga Activity</div>';
    }
}

export async function init(container, username) {
    if (!container) return;
    if (container.dataset.anilistInit === "1") return;
    container.dataset.anilistInit = "1";

    const name = username || container?.dataset?.username || "SpreadSheeets";
    const loading = getEl(container, "anilist-loading");
    const content = getEl(container, "anilist-content");
    const error = getEl(container, "anilist-error");

    try {
        const data = await fetchStats(name);
        updateUI(data, container);
        if (loading) loading.classList.add("hidden");
        if (content) content.classList.remove("hidden");
    } catch (err) {
        if (loading) loading.classList.add("hidden");
        if (error) error.classList.remove("hidden");
    }
}
