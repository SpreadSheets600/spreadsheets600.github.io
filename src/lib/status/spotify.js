import { fetchUserImages } from "../../utils/imageUtils.js";
import { subscribeToLanyard, refreshLanyard } from "./lanyard.js";

function getEl(container, id) {
  return container?.querySelector(`#${id}`) ?? document.getElementById(id);
}

function formatTime(ms) {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function init(container, userId) {
  if (!container) return;
  if (container.dataset.spotifyInit === "1") return;
  container.dataset.spotifyInit = "1";

  const USER_ID = userId || container?.dataset?.userId || "727012870683885578";
  let presence = null;
  let progressInterval = null;
  let unsubscribe = null;

  const els = {
    loading: getEl(container, "spotify-loading"),
    error: getEl(container, "spotify-error"),
    content: getEl(container, "spotify-content"),
    retryBtn: getEl(container, "spotify-retry-btn"),

    desktopPlaying: getEl(container, "spotify-desktop-playing"),
    desktopIdle: getEl(container, "spotify-desktop-idle"),
    desktopCover: getEl(container, "spotify-desktop-cover"),
    desktopNoCover: getEl(container, "spotify-desktop-no-cover"),
    desktopTrack: getEl(container, "spotify-desktop-track"),
    desktopArtist: getEl(container, "spotify-desktop-artist"),
    desktopProgressContainer: getEl(container, "spotify-desktop-progress-container"),
    desktopProgressBar: getEl(container, "spotify-desktop-progress-bar"),
    desktopCurrentTime: getEl(container, "spotify-desktop-current-time"),
    desktopTotalTime: getEl(container, "spotify-desktop-total-time"),
    desktopRecentLabel: getEl(container, "spotify-desktop-recent-label"),
    desktopStatusText: getEl(container, "spotify-desktop-status-text"),

    mobilePlaying: getEl(container, "spotify-mobile-playing"),
    mobileIdle: getEl(container, "spotify-mobile-idle"),
    mobileCover: getEl(container, "spotify-mobile-cover"),
    mobileNoCover: getEl(container, "spotify-mobile-no-cover"),
    mobileTrack: getEl(container, "spotify-mobile-track"),
    mobileArtist: getEl(container, "spotify-mobile-artist"),
    mobileProgressContainer: getEl(container, "spotify-mobile-progress-container"),
    mobileProgressBar: getEl(container, "spotify-mobile-progress-bar"),
    mobileCurrentTime: getEl(container, "spotify-mobile-current-time"),
    mobileTotalTime: getEl(container, "spotify-mobile-total-time"),
    mobileRecentLabel: getEl(container, "spotify-mobile-recent-label"),
    mobileStatusText: getEl(container, "spotify-mobile-status-text"),
  };

  const showLoading = () => {
    if (els.loading) els.loading.classList.remove("hidden");
    if (els.error) els.error.classList.add("hidden");
    if (els.content) els.content.classList.add("hidden");
  };

  const showError = () => {
    if (els.loading) els.loading.classList.add("hidden");
    if (els.error) els.error.classList.remove("hidden");
    if (els.content) els.content.classList.add("hidden");
  };

  const showIdle = (message = "Not currently playing anything.") => {
    if (els.desktopPlaying) els.desktopPlaying.classList.add("hidden");
    if (els.desktopIdle) els.desktopIdle.classList.remove("hidden");
    if (els.mobilePlaying) els.mobilePlaying.classList.add("hidden");
    if (els.mobileIdle) els.mobileIdle.classList.remove("hidden");

    if (els.desktopStatusText) els.desktopStatusText.textContent = message;
    if (els.mobileStatusText) els.mobileStatusText.textContent = message;

    if (els.desktopProgressContainer) els.desktopProgressContainer.classList.add("hidden");
    if (els.mobileProgressContainer) els.mobileProgressContainer.classList.add("hidden");

    clearInterval(progressInterval);
  };

  const startProgressTimer = (start, duration) => {
    clearInterval(progressInterval);

    const update = () => {
      const now = Date.now();
      let progress = now - start;
      if (progress > duration) progress = duration;

      const percent = (progress / duration) * 100;

      if (els.desktopProgressBar) els.desktopProgressBar.style.width = `${percent}%`;
      if (els.mobileProgressBar) els.mobileProgressBar.style.width = `${percent}%`;

      if (els.desktopCurrentTime) els.desktopCurrentTime.textContent = formatTime(progress);
      if (els.mobileCurrentTime) els.mobileCurrentTime.textContent = formatTime(progress);

      if (els.desktopTotalTime) els.desktopTotalTime.textContent = formatTime(duration);
      if (els.mobileTotalTime) els.mobileTotalTime.textContent = formatTime(duration);
    };

    update();
    progressInterval = setInterval(update, 1000);
  };

  const updateUI = async () => {
    if (!presence) return;
    const spotify = presence.spotify;

    if (!spotify) {
      showIdle();
      return;
    }

    const images = await fetchUserImages(presence);

    if (els.desktopPlaying) els.desktopPlaying.classList.remove("hidden");
    if (els.desktopIdle) els.desktopIdle.classList.add("hidden");
    if (els.mobilePlaying) els.mobilePlaying.classList.remove("hidden");
    if (els.mobileIdle) els.mobileIdle.classList.add("hidden");

    const track = spotify.song;
    const artist = spotify.artist;
    const cover = images.spotifyAlbumArt || spotify.album_art_url;
    const duration = spotify.timestamps.end - spotify.timestamps.start;
    const start = spotify.timestamps.start;

    if (els.desktopTrack) els.desktopTrack.textContent = track;
    if (els.desktopArtist) els.desktopArtist.textContent = artist;
    if (els.mobileTrack) els.mobileTrack.textContent = track;
    if (els.mobileArtist) els.mobileArtist.textContent = artist;

    if (els.desktopCover) {
      if (cover) {
        els.desktopCover.src = cover;
        els.desktopCover.classList.remove("hidden");
        els.desktopNoCover?.classList.add("hidden");
      } else {
        els.desktopCover.src = "";
        els.desktopCover.classList.add("hidden");
        els.desktopNoCover?.classList.remove("hidden");
      }
    }

    if (els.mobileCover) {
      if (cover) {
        els.mobileCover.src = cover;
        els.mobileCover.classList.remove("hidden");
        if (els.mobileNoCover) els.mobileNoCover.classList.add("hidden");
      } else {
        els.mobileCover.src = "";
        els.mobileCover.classList.add("hidden");
        if (els.mobileNoCover) els.mobileNoCover.classList.remove("hidden");
      }
    }

    startProgressTimer(start, duration);

    if (els.desktopProgressContainer) els.desktopProgressContainer.classList.remove("hidden");
    if (els.mobileProgressContainer) els.mobileProgressContainer.classList.remove("hidden");
    if (els.desktopRecentLabel) els.desktopRecentLabel.classList.add("hidden");
    if (els.mobileRecentLabel) els.mobileRecentLabel.classList.add("hidden");
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
    onError: showError,
  });
}
