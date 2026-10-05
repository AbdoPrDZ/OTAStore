<h1 align="center">OTAStore</h1>

<p align="center">
  <b>A React Native app store for your self-hosted OTA center.</b><br>
  Browse public &amp; private catalogs, install or update apps in one tap, leave reviews, and keep the
  store itself current over the air.
</p>

---

## What it is

OTAStore is a bare **React Native (Android-first)** client for [OTACenter](../OTACenter). It signs in
with the same directory account as the dashboard, shows the apps shared with the user's domains as a
private store, and offers a public store to anyone — no account required. Installing an app downloads
its `.apk` in-process and hands it to the system installer; the store's own JavaScript updates over the
air through [ota-client](https://github.com/AbdoPrDZ/react-ota-client).

## Features

- **Public store** — the center's public catalogue (search, pagination), no login needed.
- **Private store** — after login, the apps bound to the user's domains, scoped per account.
- **Install / Update / Open** — the button adapts to the installed version (detected via
  `PackageManager`), so an up-to-date app opens instead of re-installing.
- **In-app download & install** — the APK is downloaded in-process (with the bearer token for private
  apps), then handed to Android's package installer; it falls back to the browser when needed.
- **Ratings & reviews** — the average rating shows on cards and the detail; a dedicated screen lists all
  reviews and lets a signed-in user write or edit their own.
- **Self OTA updates** — the store ships with `ota-client`, so new JS bundles arrive without a new APK.
- **Modern UI** — a left navigation drawer, single-column list, light/dark themes, and a Material UI kit.
- **i18n** — English, French and Arabic with right-to-left support.

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | React Native 0.87, React 19, TypeScript |
| Navigation | React Navigation (native-stack + drawer), Reanimated |
| State / data | React Context + a small typed REST client (`fetch`) |
| Storage | AsyncStorage |
| UI | Hand-built theme tokens + primitives, `react-native-vector-icons` |
| OTA | `ota-client` (`react-native-worklets`, `react-native-reanimated`) |
| i18n | `i18next` + `react-i18next` + `react-native-localize` |
| Media | `react-native-image-picker` (profile photo) |

## Getting started

### Requirements

- Node.js **20+** (developed on 22)
- JDK **17**
- Android SDK (compileSdk/targetSdk from `android/build.gradle`), a running emulator or device
- A reachable **OTACenter** instance

### Install

```sh
npm install
```

### Configure the server

The app reads its API base URL from `src/api/client.ts` (`DEFAULT_BASE_URL`). Point it at your
OTACenter, e.g. `http://10.0.2.2:8000` (Android emulator → host) or your LAN IP for a physical device.

For the store's **own** OTA updates, set the `ota_client_api_*` meta-data in
`android/app/src/main/AndroidManifest.xml` (base URL, API version, the API key of a published version
for this app's package, `dz.abdopr.apps.otastore`).

### Run

```sh
npm start          # Metro
npm run android    # build & install on the emulator/device
```

On a physical device over USB you can also use `npm run reverse` to forward Metro and the dev server.

### Checks

```sh
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # jest
```

## Project layout

```
src/
  api/          typed REST client, store/auth/review endpoints
  components/   UI kit (AppButton, AppCard, …), drawer, top bar, rows
  context/      Auth (Sanctum), Config (server), Theme
  hooks/        install flow, install state
  i18n/         en / fr / ar + RTL
  screens/      Store, MyAppsUpdates, AppDetail, AppReviews, Profile, Settings, About, Login, Splash
  theme/        colors (dark/light), spacing, radius, typography
  utils/        storage, installer (native APK module), format, version
android/        native project (MainApplication, the ApkInstaller module, manifest)
```

## Related repositories

- **OTACenter** — the backend (apps, versions, bundles, domains, reviews, activity log).
- **react-ota-client** — the OTA engine + CLI used for over-the-air JS updates.

## Notes

- Android only for install and OTA (the engine and the package installer are Android features); on iOS
  the store still browses but installs fall back to the browser.
- Installing apps requires the user to allow "install unknown apps" once; the app detects this and links
  straight to the setting.

## License

[GPL-3.0-or-later](LICENSE) — full text in [`LICENSE`](LICENSE).
