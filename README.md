# LaneLab

Browser prototype for LaneLab Bowling Tracker.

## Release verification

From the project root, run:

```bash
npm run release:check
```

This runs the complete regression suite, prepares and synchronizes Capacitor assets, and verifies the Android debug Gradle build. If Gradle reports that Java is missing, set `JAVA_HOME` to Android Studio's bundled JDK and run the command again.

## Repeatable development workflow

Use this sequence for every change:

1. **Edit** the browser source and feature modules in the project root.
2. **Test** the change locally. On Windows PowerShell, use `npm.cmd` if script execution blocks `npm`:
   ```powershell
   npm.cmd test
   ```
3. **Synchronize Capacitor** so the latest web source is copied into Android:
   ```powershell
   npm.cmd run cap:sync
   ```
4. **Open Android Studio** with:
   ```powershell
   npm.cmd run cap:open:android
   ```
5. **Build and run** the `app` configuration on an emulator or physical Android device. Check the changed behavior on-device.
6. **Commit and push** only after the tests and device check pass:
   ```powershell
   git status
   git add .
   git commit -m "Describe the change"
   git push origin main
   ```

For a complete pre-release check, use `npm.cmd run release:check`; it runs the
test suite, Capacitor sync, and an Android debug build in one command.

## Android release signing

Release signing is configured locally through `android/keystore.properties`. Copy
`android/keystore.properties.example`, fill in the values, and keep both that
file and the keystore outside Git. Back up the keystore and passwords securely;
the same signing key is required for future updates. Without the local signing
file, debug builds still work and release builds remain unsigned.

## GitHub Pages
This folder is ready to publish with GitHub Pages.

Upload:
- index.html
- .nojekyll

Then enable GitHub Pages from the repository's main branch and root folder.

Note: The native Google ML Kit scanner is not included in this browser-only build.

Mobile controls use `touch-action: manipulation` so rapid taps do not trigger
double-tap zoom anywhere in the app. Normal page scrolling and pinch-to-zoom
remain available.

## Browser data

The GitHub Pages build stores the bowler profile, game history, and arsenal in
the current browser's local storage. New saved games include their date, hand,
selected ball, score, and available game statistics. Existing score-only data
continues to load and is labeled with an unavailable date rather than an
invented one.

Personal Stats includes date filters, a personal high, and milestone medals at
100, 150, 200, 250, and 300. Arsenal ball details calculate only from saved
games where that ball was selected.
## Native app preparation

LaneLab can be packaged for iOS and Android with Capacitor while keeping the
GitHub Pages build unchanged. The current configuration uses the repository
root (`index.html`) as the web directory and assigns the app ID
`com.lanelab.app`. `assets/lanelab-icon.svg` and `assets/lanelab-splash.svg`
are the source artwork for native icon/splash resource generation.

```bash
npm install
npm run cap:add:android   # requires Android Studio/SDK; run once
npm run cap:add:ios       # requires macOS and Xcode; run once
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

Keep native platform folders out of feature logic. Browser behavior remains
the source of truth; native plugins should be added behind `src/platform/`
adapters when a device-only feature is introduced.
