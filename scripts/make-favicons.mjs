#!/usr/bin/env node
/**
 * Generates the site favicon set from the same Newsreader face the header
 * wordmark uses, so the tab mark and the wordmark are the same letterform.
 *
 * The "B" is baked into a <path> rather than left as <text>: SVG favicons are
 * rendered with the *viewer's* installed fonts, and nobody has Newsreader
 * installed, so a <text> version would silently fall back to Georgia.
 *
 * Usage: npm run favicons
 * Requires `sharp` and `fontkitten`. Both arrive transitively with Astro, but they
 * are declared in devDependencies so an Astro bump cannot silently break this.
 */
import { create } from 'fontkitten';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const out = (name) => fileURLToPath(new URL(`public/${name}`, root));

const PAPER = '#f2f1ec'; // --bg-main (light)
const MOSS = '#5f6e2b'; // --accent (light)
const BOX = 64; // favicon viewBox, in px
const CAP = 40; // target height of the letter within the box
const WEIGHT = 60; // synthetic weight, in glyph units, added to the letterform
const RADIUS = 12; // corner radius of the tile

const font = create(
    readFileSync(fileURLToPath(new URL('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2', root)))
);
const glyph = font.glyphsForString('B')[0];
const { minX, minY, maxX, maxY } = glyph.bbox;

// Glyph space is y-up with the baseline at 0, so the transform flips y while
// scaling the cap height to CAP and centring the letter on its own bounding box.
const scale = CAP / (maxY - minY);
const tx = (BOX - (maxX - minX) * scale) / 2 - minX * scale;
const ty = (BOX - (maxY - minY) * scale) / 2 + maxY * scale;
const round = (n) => Number(n.toFixed(4));

// Newsreader's hairlines land under half a pixel at 16px and wash out, so the
// outline is stroked in its own fill colour to thicken the letter uniformly.
// The variable font's wght axis would be the proper fix, but fontkitten cannot
// instance variations — getVariation() returns a font with no glyph outlines.
const letter =
    `<path transform="translate(${round(tx)} ${round(ty)}) scale(${round(scale)} ${round(-scale)})" ` +
    `fill="${PAPER}" stroke="${PAPER}" stroke-width="${WEIGHT}" stroke-linejoin="round" ` +
    `d="${glyph.path.toSVG()}"/>`;

/** @param {number} radius 0 for a full-bleed square, RADIUS for the rounded tile. */
const svg = (radius) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">\n` +
    `    <rect width="${BOX}" height="${BOX}"${radius ? ` rx="${radius}"` : ''} fill="${MOSS}"/>\n` +
    `    ${letter}\n` +
    `</svg>\n`;

writeFileSync(out('favicon.svg'), svg(RADIUS));

const pngBuffer = (source, size) => sharp(Buffer.from(source), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const png = async (source, size, name) => writeFileSync(out(name), await pngBuffer(source, size));

/**
 * Assembles a PNG-format .ico. sharp cannot write ICO, but the container is only a
 * 6-byte header plus one 16-byte directory entry per image, and every browser since
 * IE11 reads PNG-compressed entries — so the PNGs sharp already produces embed
 * verbatim. /favicon.ico is still requested unconditionally by browsers, feed readers
 * and link scrapers regardless of what the <link> tags say.
 *
 * @param {{ size: number, data: Buffer }[]} images
 */
function ico(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(1, 2); // type: 1 = icon
    header.writeUInt16LE(images.length, 4);

    let offset = header.length + images.length * 16;
    const entries = images.map(({ size, data }) => {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size, 0); // width; 0 would mean 256
        entry.writeUInt8(size, 1); // height
        entry.writeUInt16LE(1, 4); // colour planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += data.length;
        return entry;
    });

    return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

await Promise.all([
    png(svg(RADIUS), 96, 'favicon-96.png'),
    // iOS masks the home-screen icon itself; a pre-rounded source would leave
    // transparent corners that render as black behind the mask.
    png(svg(0), 180, 'apple-touch-icon.png'),
    Promise.all([16, 32, 48].map(async (size) => ({ size, data: await pngBuffer(svg(RADIUS), size) }))).then((images) =>
        writeFileSync(out('favicon.ico'), ico(images))
    )
]);

console.log('Wrote favicon.svg, favicon.ico, favicon-96.png, apple-touch-icon.png');
