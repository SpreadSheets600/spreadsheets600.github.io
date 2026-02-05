import { init } from "./anilist.js";

const containers = document.querySelectorAll("[data-anilist]");
containers.forEach((container) => init(container));
