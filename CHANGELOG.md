# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-10-05

### Changed

- **Default server points at the hosted OTACenter.** `DEFAULT_BASE_URL` in `src/api/client.ts` now
  defaults to `https://abdopr-otacenter.duckdns.org` instead of a local development address, so a fresh
  build reaches the public center without editing the source. `runtimeVersion` stays `1.0.0` (no native
  change), so existing installs can still receive this as an over-the-air bundle.

## [1.0.0] - 2026-10-05

### Added

- **Public & private store.** The store lists the center's public catalogue without an account, and —
  after signing in with a directory account — the apps bound to the user's domains. A single list with
  All / Public / Private filters, search, pagination and pull-to-refresh.
- **App detail with Install / Update / Open.** The primary action is driven by the installed version
  (`PackageManager` + `QUERY_ALL_PACKAGES`): *Install* when absent, *Update* when the store is newer,
  *Open* when up to date. Includes screenshots, versions, description, rating summary and a preview of
  recent reviews.
- **In-app download & install.** A native `ApkInstaller` module downloads the `.apk` in-process (with the
  bearer token for private apps, timeouts and an APK signature check), records progress, and hands it to
  Android's package installer via a `FileProvider`; it falls back to opening the download in the browser.
  Detects the "install unknown apps" permission and links to the system setting.
- **Reviews & ratings.** `rating_avg` / `rating_count` on cards and detail, a dedicated **Reviews**
  screen listing every review with pagination, and a form for a signed-in user to write or edit their own
  review (one per user per app). The app detail shows the user's own review status.
- **My apps & updates.** A drawer screen listing installed store apps with **Update** / **Open** actions,
  split into "Updates available" and "Up to date".
- **Self OTA updates** via `ota-client` (`OTAProvider`), with the API base URL and key from the manifest.
- **Navigation & shell** — a left navigation drawer, a top bar with a search field, and a Profile screen
  (name + photo), Settings (theme switch, language dropdown) and About.
- **Design system** — a dark/light theme with brand tokens and a hand-built Material UI kit
  (`AppButton`, `AppCard`, `AppInput`, `AppDropdown`, …).
- **Internationalisation** — English, French and Arabic, with right-to-left support.

### Notes

- Android-first: install and OTA updates are Android features; on iOS the store browses and install
  falls back to the browser.
- Requires a reachable OTACenter instance; the base URL is configured in `src/api/client.ts`.
