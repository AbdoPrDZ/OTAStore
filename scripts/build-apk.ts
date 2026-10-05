/// <reference types="node" />
import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs-extra";
import { join } from "path";
import { subsetIcons } from "./subset-icons";

/**
 * Release-only APK build script
 * - reads app name + version from package.json
 * - builds the Android app with `assembleRelease`
 * - copies the generated APK into release/{appName}-{version}.apk
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
  const version = pkg.runtimeVersion;

  if (!appName) {
    console.error("App name not specified in package.json");
    process.exit(1);
  }

  if (!version) {
    console.error("Version not specified in package.json");
    process.exit(1);
  }

  await subsetIcons();

  const apkName = `${appName}-${version}.apk`;
  const releaseDir = process.env.RELEASE_DIR || join(ROOT, "release");
  const androidDir = process.env.ANDROID_DIR || join(ROOT, "android");

  const apkOutDir = join(androidDir, "app", "build", "outputs", "apk", "release");
  const apkOut = join(apkOutDir, "app-release.apk");

  console.log(`Building release APK v${version} -> ${apkName}`);

  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  const archs = "arm64-v8a,armeabi-v7a";
  const cmd = `${gradlew} assembleRelease -PreactNativeArchitectures=${archs}`;

  try {
    execSync(cmd, { cwd: androidDir, stdio: "inherit" });
  } catch (e: any) {
    console.error("gradle assembleRelease failed:", e?.message || e);
    process.exit(2);
  }

  if (!(await fs.pathExists(apkOut))) {
    console.error("Expected APK not found:", apkOut);
    process.exit(3);
  }

  await fs.ensureDir(releaseDir);
  const apkPath = join(releaseDir, apkName);
  await fs.copy(apkOut, apkPath);

  console.log("Release APK created:", apkPath);
}

main();