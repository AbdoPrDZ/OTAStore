
/// <reference types="node" />
import "dotenv/config";
import { execSync } from "child_process";
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
 * Android bundle script
 * - runs react-native bundle writing the JS bundle into
 *   android/app/src/main/assets and resources into android/app/src/main/res
 * - writes a minimal manifest.json next to the bundle with checksum/size
 */

async function main() {
	const ROOT = process.cwd();

	const pkgPath = join(ROOT, "package.json");
	if (!(await fs.pathExists(pkgPath))) {
		console.error("package.json not found in project root");
		process.exit(1);
	}

  const pkg = await fs.readJson(pkgPath);
  const version = pkg.version;
  const runtimeVersion = pkg.runtimeVersion;

  if (!version) {
    console.error("Version not specified in package.json");
    process.exit(1);
  }

  if (!runtimeVersion) {
    console.error("Runtime version not specified in package.json");
    process.exit(1);
  }

  await subsetIcons();

  const bundleFileName = (process.env.BUILD_BUNDLE_NAME || "index.android.bundle").trim()
												 .replaceAll("@version", `${runtimeVersion}-${version}`)
												 .replaceAll("@date", new Date().toISOString());

	const assetsDir = process.env.ANDROID_ASSETS_DIR || join(ROOT, "android", "app", "src", "main", "assets");
	const resDir = process.env.ANDROID_RES_DIR || join(ROOT, "android", "app", "src", "main", "res");

	// ensure dirs
	await fs.ensureDir(assetsDir);
	await fs.ensureDir(resDir);

	const bundleOut = join(assetsDir, bundleFileName);

	console.log(`Building Android bundle v${version} -> ${bundleOut}`);

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

	const info = await getFileInfo(bundleOut);
	if (!info) {
		console.error("bundle was not created at expected path:", bundleOut);
		process.exit(3);
	}

	const { checksum, size } = info;

	const manifest = {
		version,
    runtimeVersion,
		bundle: bundleFileName,
		checksum,
		size,
		createdAt: new Date().toISOString(),
	};

	const manifestPath = join(assetsDir, "manifest.json");
	await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

	console.log("Wrote manifest:", manifestPath);
	console.log("Android bundle + resources written to:", assetsDir, resDir);
}

main();
