/**
 * The path colour's no-flash boot (see lib/path-theme.ts): a tiny inline
 * script for the root layout's <head> that sets <html data-path> from
 * localStorage before first paint. Kept apart from path-theme.ts, which is a
 * client module, so the server layout can import the plain string.
 *
 * On /onboarding a ?side= in the link outranks the stored path, as EnterFlow does.
 */

export const PATH_KEY = "axiom_path";

export const PATH_BOOT = `try{var q=location.pathname==="/onboarding"&&new URLSearchParams(location.search).get("side");var p=q||localStorage.getItem("${PATH_KEY}");if(p==="startup"||p==="chapter")document.documentElement.dataset.path=p}catch(e){}`;
