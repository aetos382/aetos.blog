// Adapter for loading asciidoctor-kroki through the `extensions` option of astro-asciidoc.
// astro-asciidoc calls the default export with the configured options and registers the returned
// value as an Asciidoctor extension group.

import asciidoctorKroki from 'asciidoctor-kroki';

const SVG_DATA_URI_PREFIX = 'data:image/svg+xml;base64,';

/**
 * Prefixes every `id` in the SVG and every `#id` reference to it (CSS selectors, `url(#id)`,
 * `href="#id"`).
 *
 * Diagrams are embedded as inline SVG, so their ids share the page's namespace. Kroki renders
 * every Mermaid diagram with the fixed id `container` and scopes its styles and markers with it,
 * so diagrams on the same page would otherwise pick up each other's styles.
 *
 * @param {string} svg
 * @param {string} prefix
 */
function prefixSvgIds(svg, prefix) {
	const ids = new Set(Array.from(svg.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
	if (ids.size === 0) {
		return svg;
	}
	return svg
		.replace(/(\s)id="([^"]+)"/g, (_match, space, id) => `${space}id="${prefix}${id}"`)
		.replace(/#([\w-]+)/g, (match, id) => (ids.has(id) ? `#${prefix}${id}` : match));
}

/**
 * @param {import('asciidoctor-kroki').KrokiContext} [context]
 */
export default function (context) {
	return (/** @type {import('@asciidoctor/core').Registry} */ registry) => {
		asciidoctorKroki.register(registry, context);

		registry.treeProcessor(function () {
			this.process((/** @type {import('@asciidoctor/core').Document} */ doc) => {
				// asciidoctor-kroki only logs a warning when it fails to fetch a diagram and leaves the
				// diagram source in place with the `kroki-error` role. Fail the build instead so that
				// broken diagrams are not published.
				const failed = doc.findBy({}, (block) => block.hasRole('kroki-error'));
				if (failed.length > 0) {
					throw new Error(
						`Failed to render ${failed.length} diagram(s) with Kroki in ${doc.getAttribute('docfile')}. ` +
							`Make sure the Kroki server is reachable at ${doc.getAttribute('kroki-server-url')} ` +
							'(set KROKI_SERVER_URL to change it).',
					);
				}

				const diagrams = doc.findBy({ context: 'image' }, (block) => block.hasRole('kroki'));
				diagrams.forEach((block, index) => {
					const target = block.getAttribute('target');
					if (typeof target !== 'string' || !target.startsWith(SVG_DATA_URI_PREFIX)) {
						return;
					}
					const svg = Buffer.from(target.slice(SVG_DATA_URI_PREFIX.length), 'base64').toString('utf8');
					const prefixed = prefixSvgIds(svg, `kroki-${index + 1}-`);
					block.setAttribute('target', SVG_DATA_URI_PREFIX + Buffer.from(prefixed, 'utf8').toString('base64'));
				});
			});
		});
	};
}
