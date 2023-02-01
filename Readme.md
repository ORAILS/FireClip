# [FireClip](https://fireclip.net)

![img](src/frontend/www/raw.svg)

A privacy focused (zero-knowledge) clipboard manager with real-time synchronisation.

***Currently no synchronisation is enabled, nor the information is saved locally, so closing the app will erase all the history. Work is being done to enable syncronisation and ship the data to the server. Once the syncronisation functionality will be added, the app will automatically download the update and restart, unless disabled in settings, in which case, the app will update on restart.***

## Downloading the App

The app is free and will remain to be free for the first 100 to 500 users (to be decided once user registration is enabled).

Until then, feel free to download a copy from [release.fireclip.net/download](https://release.fireclip.net/download) (Only MacOS for now).

## About auto-updates

As written above app supports auto updates and will automatically download the latest version and restart, unless disabled in the settings (Click on the name). An update notice will also be added in the future, as well as support for optional and mandatory updates. The update server works by serving the last version from the GitHub releases at [release.fireclip.net/download/latest](https://release.fireclip.net/download/latest). You can verify the hash of the files to validate.

## Supported platforms

1. MacOS
2. Windows (build needs to be made)
3. Linux (build needs to be made)
4. Browser (planned)
5. IOS (PWA)(planned)
6. Android (PWA)(planned)

MacOS, Windows and Linux platforms will share the codebase from this repo and will be built with Electron.

## Main features

1. Focus on user privacy (being a zero knowledge system) (implemented)
2. Encrypted user data (implemented)
3. Support for text, images, links and formated text (implemented)
4. Optional Real-time sync (in progress)
5. Configurable shortcuts (in progress)
6. Cross-platform support (in progress/ builds will be made)

### Licencing

The app is not Open Source as a licencing model was not yet decided, so until further notice, the app should be treated as `"Source Available"`, all rights being reserved by ORAILS and/or Daniel Railean.

### More

- [Disclaimer](./disclaimer.md)
