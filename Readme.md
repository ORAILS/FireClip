# [FireClip](https://fireclip.net)

![img](src/frontend/www/icons/png/128x128.png)

A privacy focused clipboard manager with real-time synchronisation across devices and platforms.

## Downloading the App

You can download a copy from [release.fireclip.net/download](https://release.fireclip.net/download) (Only MacOS for now), or from the releases page.

The plan is to have a basic and **PRO** tier in the future, all registered users before the **PRO** tier is created will get it for free.

## About auto-updates

As written above, the app supports auto updates and will automatically download the latest version and restart, unless disabled in the settings.

An update notice will also be added in the future, as well as support for optional and mandatory updates. The update server works by serving the last version from the GitHub releases at [release.fireclip.net/download/latest](https://release.fireclip.net/download/latest).

You can verify the hash of the files to validate the code you are running is the code from the GitHub.

## Supported platforms

1. MacOS
2. Windows
3. Linux
4. Browser (planned)
5. IOS (PWA)(planned)
6. Android (PWA)(planned)

MacOS, Windows and Linux platforms will share the codebase from this repo and will be built with Electron.

## Features

1. Focused on user prpivacy (messages are end to end encrypted using symetric encription, your key is generated based on the password)
2. Support for text, images, links and formated text (implemented)
3. Optional Real-time cross-device sync
4. Configurable shortcuts
5. Cross-platform support

### Licencing

`"Source Available"`, all rights being reserved by ORAILS and/or Daniel Railean.

### More

- [Disclaimer](./disclaimer.md)

### Troubleshooting

<details>
<summary>The APP keeps asking for accesibility settings even if those were granted</summary>
<br>
To fix the app permissions need a reset and then they need to be granted again.
Try the following in the exact order:

1. close the APP
2. open the terminal and run: `tccutil reset All com.orails.fireclip` → it should output something like `Successfully reset All approval status for com.orails.fireclip`
3. open the APP → it should ask for 'Accessibility' access again
4. grant the Accessibility access in settings
5. close the APP
6. open the APP again → it shouldn't ask for access this time
7. it works now

read more about this bug on [stackexchange.com](https://apple.stackexchange.com/questions/257580/accessibility-settings-asking-everytime)
</details>
