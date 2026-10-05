/// <reference types="node" />
import "dotenv/config";
import { execSync } from "child_process";
import * as tar from "tar";
import fs from "fs-extra";
import crypto from "crypto";
import { join } from "path";
import { subsetIcons } from "./subset-icons";

export async function getFileInfo(filePath: string): Promise<{ checksum: string, size: number } | null> {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const size = fs.statSync(filePath).size;
  const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

  return { checksum, size };
}

/**
 * Release-only bundle script
 * - builds the JS bundle with the same --assets-dest the APK build uses, so both
 *   emit identical asset registrations
 * - writes a minimal manifest.json next to the bundle in a temp folder
 * - stages the icon fonts under fonts/ so the bundle can ship new glyphs
 * - stages images under assets/ so the bundle can ship new artwork
 * - archives bundle + manifest + fonts + assets into release/{name}-{version}.tar.gz
 * - leaves the `release` folder containing only .tar.gz files
 *
 * Both directories are copied verbatim; the engine stages them next to the
 * bundle. Fonts are registered with React Native at boot, while images are read
 * through `file://` URIs built from the active bundle directory. Keep the
 * `require()`d copies in the APK as the fallback for devices that have not
 * received an update yet.
 */

async function main() {
  const ROOT = process.cwd();

  const pkgPath = join(ROOT, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    console.error("package.json not found in project root");
    process.exit(1);
  }

  const pkg = await fs.readJson(pkgPath);
  const appName = pkg.name;
  const version = pkg.version;
  const runtimeVersion = pkg.runtimeVersion;
  const buildName = `${appName}-${runtimeVersion}-${version}`;

  if (!appName) {
    console.error("App name not specified in package.json");
    process.exit(1);
  }

  if (!version) {
    console.error("Version not specified in package.json");
    process.exit(1);
  }

  if (!runtimeVersion) {
    console.error("Runtime version not specified in package.json");
    process.exit(1);
  }

  const bundleFileName = (process.env.BUILD_BUNDLE_NAME || "@version.android.bundle").trim()
												 .replaceAll("@version", `${runtimeVersion}-${version}`)
                         .replaceAll("@date", new Date().toISOString());

  const tmpDir = process.env.BUILD_TMP_DIR || join(ROOT, "tmp");
  const tmpBuildDir = join(tmpDir, buildName);

  const releaseDir = process.env.RELEASE_DIR || join(ROOT, "release");

  // Source of the subset icon fonts. Must match what build-android.ts writes, so
  // an OTA bundle and the APK embedded in it ship the same glyphs.
  const fontsSourceDir =
    process.env.ICON_FONTS_DIR ||
    join(ROOT, "android", "app", "src", "main", "assets", "fonts");
  const fontsStageDir = join(tmpBuildDir, "fonts");

  // Images shipped with the bundle, staged under assets/ and addressed at runtime
  // through file:// URIs.
  const assetsSourceDir = process.env.BUNDLE_ASSETS_DIR || join(ROOT, "src", "assets");
  const assetsStageDir = join(tmpBuildDir, "assets");

  // Same destination build-android.ts uses. Without it Metro skips asset
  // serialization and the bundle registers images by a path that never exists,
  // so a swapped bundle renders no images at all. React Native resolves
  // `require()`d images from the APK's compiled resources and offers no hook to
  // override that, so images stay in the APK and the JS must be byte-for-byte
  // consistent with what the APK build produces.
  const resDir = process.env.ANDROID_RES_DIR || join(ROOT, "android", "app", "src", "main", "res");

  // ensure clean tmp dir
  if (await fs.pathExists(tmpBuildDir)) {
    await fs.remove(tmpBuildDir);
  }
  await fs.ensureDir(tmpBuildDir);

  const bundleOut = join(tmpBuildDir, bundleFileName);

  console.log(`Building bundle v${version} -> ${bundleOut}`);

  const cmd = [
    "npx react-native bundle",
    "--platform android",
    "--dev false",
    "--entry-file index.js",
    `--bundle-output "${bundleOut}"`,
    `--assets-dest "${resDir}"`,
  ].join(" ");

  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e: any) {
    console.error("react-native bundle failed:", e?.message || e);
    process.exit(2);
  }

  const { checksum, size } = (await getFileInfo(bundleOut))!

  // Subset before staging, so the fonts inside the archive match the glyphs the
  // current sources actually reference.
  await subsetIcons();

  const fonts: Array<{ name: string; checksum: string; size: number }> = [];

  if (await fs.pathExists(fontsSourceDir)) {
    await fs.ensureDir(fontsStageDir);

    const fontFiles = (await fs.readdir(fontsSourceDir))
      .filter(name => /\.(ttf|otf)$/i.test(name))
      .sort();

    for (const name of fontFiles) {
      const info = await getFileInfo(join(fontsSourceDir, name));

      if (!info) {
        continue;
      }

      await fs.copy(join(fontsSourceDir, name), join(fontsStageDir, name));
      fonts.push({ name, ...info });
    }
  }

  if (fonts.length === 0) {
    console.warn(
      "No fonts found in " + fontsSourceDir + "; the bundle will not be able to change glyphs"
    );
  }

  // Images travel with the bundle too. React Native resolves a required image
  // through resources.getIdentifier() against the APK only, so these are staged
  // under assets/ and addressed at runtime with a file:// URI built from the
  // active bundle directory.
  const assets: Array<{ name: string; checksum: string; size: number }> = [];

  if (await fs.pathExists(assetsSourceDir)) {
    await fs.copy(assetsSourceDir, assetsStageDir);

    const assetFiles = (await fs.readdir(assetsStageDir, { withFileTypes: true }))
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
      .sort();

    for (const name of assetFiles) {
      const info = await getFileInfo(join(assetsStageDir, name));

      if (info) {
        assets.push({ name, ...info });
      }
    }
  } else {
    console.warn(
      "No assets found in " + assetsSourceDir + "; images will come from the APK only"
    );
  }

  const manifest = {
    version,
    runtimeVersion,
    bundle: bundleFileName,
    checksum,
    size,
    createdAt: new Date().toISOString(),
    fonts,
    assets,
  };

  const manifestPath = join(tmpBuildDir, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  // ensure release dir
  await fs.ensureDir(releaseDir);

  const archiveName = `${buildName}.tar.gz`;
  const archivePath = join(releaseDir, archiveName);

  console.log(`Creating archive ${archivePath} (bundle + manifest + fonts + assets)`);

  try {
    // Entries sit at the root of the tar: the bundle filename, manifest.json,
    // fonts/ and assets/. The engine copies both directories into the staging dir.
    // It registers fonts/ with React Native at boot so the bundle's glyphs win
    // over the APK copy; JavaScript reaches assets/ through file:// URIs.
    await tar.create(
      {
        gzip: true,
        file: archivePath,
        cwd: tmpBuildDir,
      },
      [bundleFileName, "manifest.json", "fonts", "assets"]
    );
  } catch (e: any) {
    console.error("Failed to create archive:", e?.message || e);
    process.exit(3);
  }

  // clean tmp
  try {
    await fs.remove(tmpBuildDir);
  } catch {
    // non-fatal
  }

  console.log("Release bundle created:", archivePath);
  console.log(`Fonts in archive: ${fonts.map(font => font.name).join(", ") || "none"}`);
  console.log(`Assets in archive: ${assets.map(asset => asset.name).join(", ") || "none"}`);
}

main();