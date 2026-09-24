/**
 * Prefixes a site-relative path with the base path the site is served from (`base` in
 * `astro.config.mjs`), for example `blog/` → `/astro-site/blog/`.
 */
export function withBase(path: string): string {
	return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
