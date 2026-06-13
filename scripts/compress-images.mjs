import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "assets", "images");

const SOURCES = [
  {
    slug: "hero",
    files: ["David DiGiovanni_435 Bryant Ave_View 03.jpg"],
    sizes: [{ name: "hero", width: 2400 }],
  },
  {
    slug: "bryant-ave",
    files: [
      "David DiGiovanni_435 Bryant Ave_View 02.jpg",
      "David DiGiovanni_435 Bryant Ave_View 03.jpg",
      "David DiGiovanni_435 Bryant Ave_View 04.jpg",
      "David DiGiovanni_435 Bryant Ave_View 05 - Copy.jpg",
    ],
  },
  {
    slug: "pacific-street",
    files: ["1058 Pacific Street Rendering.jpg"],
  },
  {
    slug: "354-e-street",
    files: [
      "354 E Street - Aerial Integration.jpg",
      "354 E Street_2.jpg",
    ],
  },
  {
    slug: "om-meadow",
    files: [
      "file_1777723668913.jpg.jpeg",
      "file_1777722421326.jpg.jpeg",
    ],
  },
  {
    slug: "waterfront-masterplan",
    files: [
      "1000153946.jpg.jpeg",
      "IMG_20260517_112339.jpg.jpeg",
    ],
  },
  {
    slug: "eco-community",
    files: [
      "1000153947.jpg.jpeg",
      "file_1776608562110.jpg.jpeg",
    ],
  },
  {
    slug: "kitchen",
    files: ["Kitchen.jpg"],
  },
  {
    slug: "forest-cabin",
    files: ["01.png"],
  },
  {
    slug: "corporate-atrium",
    files: ["04 (1).jpg"],
  },
  {
    slug: "warehouse",
    files: [
      "New Albany Exterior Rendering1.JPG",
      "South_View_01.jpg",
    ],
  },
  {
    slug: "bedroom",
    files: ["0001.jpg"],
  },
  {
    slug: "dining-room",
    files: ["View 04.jpeg"],
  },
  {
    slug: "library",
    files: ["file_1780973712168.jpg"],
  },
  {
    slug: "living-room",
    files: ["file_1780974035100.jpg"],
  },
  {
    slug: "rooftop-bar",
    files: ["IMG_6821 - Copy.JPG"],
  },
  {
    slug: "suburban-home",
    files: ["View_01.jpg"],
  },
  {
    slug: "concrete-residence",
    files: ["Exterior 001 - Copy.jpg"],
  },
  {
    slug: "office-floorplan",
    files: ["LEVEL 09.jpg"],
  },
  {
    slug: "industrial-campus",
    files: ["IMG_6823.JPG"],
  },
];

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function compressOne(sourcePath, destDir, baseName, width, quality) {
  const webpPath = path.join(destDir, `${baseName}.webp`);
  const jpegPath = path.join(destDir, `${baseName}.jpg`);

  await sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(webpPath);

  await sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: quality - 5, mozjpeg: true })
    .toFile(jpegPath);

  const webpStat = await fs.stat(webpPath);
  const jpegStat = await fs.stat(jpegPath);
  return { webpPath, jpegPath, webpSize: webpStat.size, jpegSize: jpegStat.size };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  let totalWebp = 0;
  let totalJpeg = 0;
  let count = 0;

  for (const group of SOURCES) {
    const destDir = path.join(OUT, group.slug);
    await fs.mkdir(destDir, { recursive: true });

    for (const file of group.files) {
      const sourcePath = path.join(ROOT, file);
      try {
        await fs.access(sourcePath);
      } catch {
        console.warn(`Skipping missing file: ${file}`);
        continue;
      }

      const baseName =
        group.slug === "hero"
          ? "hero"
          : slugify(path.basename(file));

      if (group.sizes) {
        for (const size of group.sizes) {
          const result = await compressOne(
            sourcePath,
            destDir,
            size.name,
            size.width,
            85
          );
          totalWebp += result.webpSize;
          totalJpeg += result.jpegSize;
          count += 1;
          console.log(
            `✓ ${group.slug}/${size.name} (${Math.round(result.webpSize / 1024)}KB webp)`
          );
        }
        continue;
      }

      const full = await compressOne(sourcePath, destDir, baseName, 1920, 82);
      const thumb = await compressOne(
        sourcePath,
        destDir,
        `${baseName}-thumb`,
        720,
        78
      );
      totalWebp += full.webpSize + thumb.webpSize;
      totalJpeg += full.jpegSize + thumb.jpegSize;
      count += 2;
      console.log(
        `✓ ${group.slug}/${baseName} (${Math.round(full.webpSize / 1024)}KB + thumb ${Math.round(thumb.webpSize / 1024)}KB)`
      );
    }
  }

  console.log(
    `\nDone: ${count} variants, ~${Math.round(totalWebp / 1024 / 1024)}MB webp + ~${Math.round(totalJpeg / 1024 / 1024)}MB jpeg total`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
