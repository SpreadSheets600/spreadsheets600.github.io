import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, request } = context;

	// Protect admin routes
	if (url.pathname.startsWith("/admin")) {
		const session = await getSession(request);

		// We allow the request to proceed to the page, where we will render a login button if no session exists.
        // If we redirect here, we'd need a dedicated login page.
        // Instead, we'll let the page handle the UI state.
	}

	return next();
});
