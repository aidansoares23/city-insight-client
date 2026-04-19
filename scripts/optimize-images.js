/**
 * One-time script: converts all JPEGs in public/city-photos/ to WebP.
 *
 * Usage:
 *   npm run optimize-images
 *
 * Each .jpg / .jpeg is converted to a sibling .webp at ≤1200px wide, 80%
 * quality. Original files are left in place (safe to delete after verifying).
 */

import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PHOTOS_DIR = join(__dirname, "../public/city-photos");
const MAX_WIDTH = 1200;
const QUALITY = 80;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if ([".jpg", ".jpeg"].includes(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

const jpgs = await walk(PHOTOS_DIR);
console.log(`Found ${jpgs.length} JPEG(s) to convert.\n`);

let converted = 0;
let skipped = 0;

for (const src of jpgs) {
  const dir = src.replace(/[^/\\]+$/, "");
  const name = basename(src, extname(src));
  const dest = join(dir, `${name}.webp`);

  try {
    const srcStat = await stat(src);
    let destStat = null;
    try { destStat = await stat(dest); } catch { /* doesn't exist yet */ }

    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs) {
      console.log(`  skip  ${dest.split("city-photos/")[1]} (already up to date)`);
      skipped++;
      continue;
    }

    await sharp(src)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dest);

    const before = Math.round(srcStat.size / 1024);
    const afterStat = await stat(dest);
    const after = Math.round(afterStat.size / 1024);
    const pct = Math.round((1 - after / before) * 100);
    console.log(`  ✓  ${dest.split("city-photos/")[1]}  (${before}KB → ${after}KB, -${pct}%)`);
    converted++;
  } catch (err) {
    console.error(`  ✗  ${src}: ${err.message}`);
  }
}

console.log(`\nDone. Converted: ${converted}, skipped: ${skipped}.`);
