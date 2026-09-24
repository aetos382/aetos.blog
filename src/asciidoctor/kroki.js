// Adapter for loading asciidoctor-kroki through the `extensions` option of astro-asciidoc.
// astro-asciidoc calls the default export with the configured options and registers the returned
// value as an Asciidoctor extension group.

import asciidoctorKroki from 'asciidoctor-kroki';

/**
 * @param {import('asciidoctor-kroki').KrokiContext} [context]
 */
export default function (context) {
	return (/** @type {import('@asciidoctor/core').Registry} */ registry) => {
		asciidoctorKroki.register(registry, context);

		// asciidoctor-kroki only logs a warning when it fails to fetch a diagram and leaves the
		// diagram source in place with the `kroki-error` role. Fail the build instead so that broken
		// diagrams are not published.
		registry.treeProcessor(function () {
			this.process((/** @type {import('@asciidoctor/core').Document} */ doc) => {
				const failed = doc.findBy({}, (block) => block.hasRole('kroki-error'));
				if (failed.length > 0) {
					throw new Error(
						`Failed to render ${failed.length} diagram(s) with Kroki in ${doc.getAttribute('docfile')}. ` +
							'Make sure the Kroki server is running (see compose.yaml).',
					);
				}
			});
		});
	};
}
