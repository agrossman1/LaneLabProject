# LaneLab React Native shell

This Expo shell is intentionally separate from the existing Capacitor Android app. It is the migration workspace for the React Native plan; the current `android/` project remains the release build until feature parity is reached.

From this directory, install dependencies and run `npm start` when Expo tooling is available.

Migration uses the existing web app's Export Data JSON. The adapter in `src/migration.cjs` normalizes profile, games, and Arsenal records without modifying the existing Capacitor storage.

Cloud builds use EAS profiles in `eas.json`:

```text
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform all --profile production
```

These commands require an Expo account and the appropriate Google Play/Apple Developer credentials. They do not alter the existing `android/` Gradle project.
