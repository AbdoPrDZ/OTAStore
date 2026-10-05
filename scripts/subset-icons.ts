/// <reference types="node" />
import { promises as fsp, readdirSync } from "fs";
import { dirname, join } from "path";
import subsetFont from "subset-font";

/**
 * Icon font subsetting script
 * - scans src/**\/*.{ts,tsx} for icon names used from a react-native-vector-icons set
 *   (any string literal that is a key in the set's glyphmap)
 * - subsets the full .ttf down to only the glyphs actually referenced
 * - writes the subset font straight into the APK's assets/fonts
 * - writes a glyph manifest to scripts/, deliberately outside the assets source
 *   dir so it is never packaged into the APK
 *
 * The subset keeps the original family name so Android resolves the font exactly
 * as before; no source code needs to change.
 */

const ROOT = process.cwd();
const ICON_SET = process.env.ICON_SET || "MaterialCommunityIcons";
const SRC_DIR = join(ROOT, "src");
const GLYPH_MAP_PATH = join(
  ROOT,
  "node_modules",
  "react-native-vector-icons",
  "glyphmaps",
  `${ICON_SET}.json`
);
const FULL_FONT_PATH = join(
  ROOT,
  "node_modules",
  "react-native-vector-icons",
  "Fonts",
  `${ICON_SET}.ttf`
);
const OUT_DIR =
  process.env.ICON_FONTS_DIR ||
  join(ROOT, "android", "app", "src", "main", "assets", "fonts");
// Kept outside the assets source dir so it never gets packaged into the APK.
const OUT_MANIFEST_PATH =
  process.env.ICON_GLYPH_MANIFEST_PATH ||
  join(ROOT, "scripts", `${ICON_SET}.glyphs.json`);
const OUT_FONT_PATH = join(OUT_DIR, `${ICON_SET}.ttf`);

const LITERAL_RE = /['"`]([a-z0-9][a-z0-9-]*)['"`]/g;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function collectLiterals(source: string, into: Set<string>): void {
  let match: RegExpExecArray | null;
  LITERAL_RE.lastIndex = 0;
  while ((match = LITERAL_RE.exec(source)) !== null) {
    into.add(match[1]);
  }
}

async function subsetIcons(): Promise<void> {
  const glyphMap: Record<string, number> = JSON.parse(
    await fsp.readFile(GLYPH_MAP_PATH, "utf8")
  );

  const literals = new Set<string>();
  for (const file of listSourceFiles(SRC_DIR)) {
    collectLiterals(await fsp.readFile(file, "utf8"), literals);
  }

  const used = Object.keys(glyphMap)
    .filter((name) => literals.has(name))
    .sort();

  if (used.length === 0) {
    console.error(`No ${ICON_SET} glyphs referenced in ${SRC_DIR}`);
    process.exit(1);
  }

  const text = used.map((name) => String.fromCodePoint(glyphMap[name])).join("");
  const original = await fsp.readFile(FULL_FONT_PATH);

  const subset = await subsetFont(original, text, {
    targetFormat: "truetype",
    preserveNameIds: [1, 2, 3, 4, 6, 16, 17],
    noHinting: true,
  });

  await fsp.mkdir(OUT_DIR, { recursive: true });
  await fsp.mkdir(dirname(OUT_MANIFEST_PATH), { recursive: true });
  await fsp.writeFile(OUT_FONT_PATH, subset);
  await fsp.writeFile(OUT_MANIFEST_PATH, JSON.stringify(used, null, 2) + "\n");

  const beforeKb = original.length / 1024;
  const afterKb = subset.length / 1024;
  console.log(
    `Subset ${ICON_SET}: ${used.length} glyphs, ${beforeKb.toFixed(0)} KB -> ${afterKb.toFixed(1)} KB -> ${OUT_FONT_PATH}`
  );
}

export { subsetIcons };

if (require.main === module) {
  subsetIcons();
}
