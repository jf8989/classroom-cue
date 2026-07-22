# Classroom Cue

Classroom Cue is a small, privacy-friendly Chrome extension that puts a polished soundboard in your Google Meet classroom. Make a win feel like a win, punctuate a joke, or gently bring the room back together—without switching tabs or uploading audio files.

![Classroom Cue icon](icons/icon-128.png)

## Included cues

- Applause
- Cheer
- Fanfare
- Wah-wah (the classic bad-joke trombone)
- Boing
- Rimshot
- Class bell
- Whoosh
- Drumroll

All cues are synthesized directly in the Google Meet page and mixed with the microphone stream that Meet sends to the call. The extension has no bundled audio assets, trackers, or network requests.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select this project folder.
5. Pin **Classroom Cue** from Chrome’s Extensions menu.
6. Refresh any Google Meet tab that was already open, then join your call.

## Use it in Google Meet

1. Join a meeting at [meet.google.com](https://meet.google.com/).
2. Present any tab, window, or screen as usual—tab sharing is not required for the cues.
3. Click the Classroom Cue toolbar icon and select a sound.

The sounds are mixed into the microphone feed Meet sends to participants, so your students hear them even while you present a different tab or your screen. If Chrome ever blocks an initial sound after opening Meet, refresh the Meet tab and try the cue again.

## Privacy

Classroom Cue runs only on `meet.google.com`. It does not collect data, make network requests, use analytics, or store recordings. The `tabs` permission is used only to check whether your active tab is a Google Meet tab before enabling the soundboard.

## Development

This is a dependency-free Manifest V3 extension:

```text
meet-soundboard/
├── content.js      # Extension-world popup-to-page bridge
├── icons/          # Extension icons
├── main-world.js   # Mixes microphone and synthesized classroom cues
├── manifest.json   # Chrome extension manifest
├── popup.html      # Soundboard interface
├── popup.css       # UI styling
└── popup.js        # Popup-to-Meet messaging
```

## License

Released under the [MIT License](LICENSE).
