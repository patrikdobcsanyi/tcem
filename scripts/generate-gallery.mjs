import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const galleryDir = path.join(rootDir, "assets", "gallery");
const outputFile = path.join(rootDir, "js", "gallery-data.js");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const defaultCategories = ["interclub", "junioren", "events", "anlage", "padel", "sportstueble"];

const normalizeCategory = (name) => name
  .toLowerCase()
  .replaceAll("ä", "ae")
  .replaceAll("ö", "oe")
  .replaceAll("ü", "ue")
  .replaceAll("ß", "ss")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const toCaption = (filename) => {
  const parsed = path.parse(filename).name;
  return parsed
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

await mkdir(galleryDir, { recursive: true });
await mkdir(path.dirname(outputFile), { recursive: true });

await Promise.all(defaultCategories.map((category) => mkdir(path.join(galleryDir, category), { recursive: true })));

const categoryFolders = await readdir(galleryDir, { withFileTypes: true });
const images = [];

for (const folder of categoryFolders) {
  if (!folder.isDirectory()) {
    continue;
  }

  const category = normalizeCategory(folder.name);
  const folderPath = path.join(galleryDir, folder.name);
  const files = await readdir(folderPath, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !imageExtensions.has(path.extname(file.name).toLowerCase())) {
      continue;
    }

    const caption = toCaption(file.name);
    images.push({
      category,
      src: `assets/gallery/${folder.name}/${file.name}`,
      caption,
      alt: `${caption} beim TC Eschen-Mauren`,
    });
  }
}

images.sort((first, second) => {
  if (first.category !== second.category) {
    return first.category.localeCompare(second.category, "de");
  }

  return first.caption.localeCompare(second.caption, "de");
});

const fileContents = `window.galleryImages = ${JSON.stringify(images, null, 2)};\n`;
await writeFile(outputFile, fileContents, "utf8");

console.log(`Generated ${path.relative(rootDir, outputFile)} with ${images.length} image${images.length === 1 ? "" : "s"}.`);
