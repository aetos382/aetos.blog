// Syntax highlighter that colorizes source blocks with Shiki at build time.
// Register the returned instance through the `highlighters` option of astro-asciidoc and select it
// with the `source-highlighter: shiki` document attribute.

import { SyntaxHighlighterBase } from 'astro-asciidoc';
import { bundledLanguages, createHighlighter } from 'shiki';

const NAME = 'shiki';

// Languages that Shiki renders as plain text without loading a grammar.
const PLAIN_LANGUAGES = new Set(['text', 'txt', 'plain', 'plaintext']);

class ShikiSyntaxHighlighter extends SyntaxHighlighterBase {
	/** @type {import('shiki').Highlighter} */
	#highlighter;

	/** @type {string} */
	#theme;

	/**
	 * @param {import('shiki').Highlighter} highlighter
	 * @param {string} theme
	 */
	constructor(highlighter, theme) {
		super(NAME);
		this.#highlighter = highlighter;
		this.#theme = theme;
	}

	handlesHighlighting() {
		return true;
	}

	/**
	 * Asciidoctor calls this synchronously, so every grammar has to be loaded beforehand.
	 *
	 * @param {any} node
	 * @param {string} source
	 * @param {string | undefined} lang
	 */
	highlight(node, source, lang) {
		let language = lang ?? 'text';
		if (!PLAIN_LANGUAGES.has(language) && !this.#highlighter.getLoadedLanguages().includes(language)) {
			node.logger.warn(`shiki: unknown language '${language}', rendering as plain text`);
			language = 'text';
		}
		const html = this.#highlighter.codeToHtml(source, { lang: language, theme: this.#theme });
		// Asciidoctor wraps the result in its own <pre><code> in format(), so keep only the lines.
		return html.slice(html.indexOf('<code>') + '<code>'.length, html.lastIndexOf('</code>'));
	}

	/**
	 * @param {any} node
	 * @param {string | undefined} lang
	 * @param {any} opts
	 */
	format(node, lang, opts) {
		const { bg, fg } = this.#highlighter.getTheme(this.#theme);
		return super.format(node, lang, {
			...opts,
			transform: (/** @type {Record<string, string>} */ pre, /** @type {Record<string, string>} */ code) => {
				pre.style = `background-color:${bg};color:${fg}`;
				if (lang) {
					code.class = `language-${lang}`;
				}
			},
		});
	}
}

/**
 * Loads every bundled grammar up front because Asciidoctor highlights synchronously.
 *
 * @param {{ theme?: import('shiki').BundledTheme }} [options]
 */
export default async function shiki({ theme = 'github-dark' } = {}) {
	const highlighter = await createHighlighter({
		themes: [theme],
		langs: Object.keys(bundledLanguages),
	});
	return new ShikiSyntaxHighlighter(highlighter, theme);
}
