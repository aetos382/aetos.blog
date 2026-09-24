// Optimizes an image for the body of a blog post and writes it to the post's images directory.
//
// Usage: node optimize-image.mjs <input> <slug> <name> [--max-width <px>]
//
// The image is shrunk to `--max-width` (never enlarged), re-encoded in the same format, and
// stripped of metadata such as EXIF (the orientation is applied to the pixels first). The output is
// `src/content/blog/<slug>/images/<name>.<ext>`, where `<ext>` follows the input format. Existing
// files are never overwritten. Prints the result as JSON.

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

// The body column is 720px wide (src/styles/global.css); 2x covers high-DPI screens.
const DEFAULT_MAX_WIDTH = 1440;

/** @type {Record<string, { ext: string, encode: (image: sharp.Sharp) => sharp.Sharp }>} */
const FORMATS = {
	jpeg: { ext: '.jpg', encode: (image) => image.jpeg({ quality: 82, mozjpeg: true }) },
	// Palette quantization keeps text in screenshots sharp while shrinking them a lot.
	png: { ext: '.png', encode: (image) => image.png({ palette: true, compressionLevel: 9, effort: 10 }) },
	webp: { ext: '.webp', encode: (image) => image.webp({ quality: 82, effort: 6 }) },
	avif: { ext: '.avif', encode: (image) => image.avif({ quality: 60 }) },
};

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: { 'max-width': { type: 'string' } },
});
if (positionals.length !== 3) {
	throw new Error('Usage: node optimize-image.mjs <input> <slug> <name> [--max-width <px>]');
}
const [input, slug, name] = positionals;
const maxWidth = Number(values['max-width'] ?? DEFAULT_MAX_WIDTH);
if (!Number.isInteger(maxWidth) || maxWidth <= 0) {
	throw new Error(`--max-width must be a positive integer: ${values['max-width']}`);
}

const postDir = path.join('src/content/blog', slug);
await fs.access(path.join(postDir, 'index.adoc')).catch(() => {
	throw new Error(`No such post: ${postDir}/index.adoc`);
});

const inputBuffer = await fs.readFile(input);
const before = await sharp(inputBuffer).metadata();
const format = FORMATS[before.format ?? ''];
if (!format) {
	throw new Error(`Unsupported format: ${before.format} (supported: ${Object.keys(FORMATS).join(', ')})`);
}

const baseName = path.basename(name, path.extname(name));
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(baseName)) {
	throw new Error(`The name must be lowercase kebab-case: ${baseName}`);
}
const imagesDir = path.join(postDir, 'images');
const output = path.join(imagesDir, baseName + format.ext);

const image = sharp(inputBuffer).rotate().resize({ width: maxWidth, withoutEnlargement: true });
const { data, info } = await format.encode(image).toBuffer({ resolveWithObject: true });

await fs.mkdir(imagesDir, { recursive: true });
// 'wx' fails if the file already exists.
await fs.writeFile(output, data, { flag: 'wx' });
// The placeholder is only there to keep an empty images directory in Git.
await fs.rm(path.join(imagesDir, '.gitkeep'), { force: true });

console.log(JSON.stringify({
	output,
	macro: `image::${path.basename(output)}[]`,
	before: { format: before.format, width: before.width, height: before.height, bytes: inputBuffer.length },
	after: { format: info.format, width: info.width, height: info.height, bytes: data.length },
}, null, 2));
