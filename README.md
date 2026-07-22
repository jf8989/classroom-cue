# Classroom Cue

Classroom Cue is a small, privacy-friendly Chrome extension that puts a polished soundboard in whichever Chrome tab you are sharing in Google Meet. Make a win feel like a win, punctuate a joke, or gently bring the room back together—without switching tabs or uploading audio files.

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

All cues are synthesized directly in the active tab. When you share that same tab in Google Meet with **Share tab audio** enabled, your students hear the cues. The extension has no bundled audio assets, trackers, or network requests.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select this project folder.
5. Pin **Classroom Cue** from Chrome’s Extensions menu.

## Use it in Google Meet

1. Join a meeting at [meet.google.com](https://meet.google.com/).
2. Select **Present now** → **A tab**, choose the tab you intend to use, and turn on **Share tab audio**.
3. Keep that shared tab active. Click the Classroom Cue toolbar icon and select a sound.

The cue plays through the active tab's normal audio output. Chrome adds it to the tab audio you are already sharing with Meet. You can use Classroom Cue on regular websites such as slides, Miro, videos, and browser-based activities. Chrome blocks extensions from injecting sound into internal pages such as `chrome://`.

## Troubleshooting

If you update the local extension files, open `chrome://extensions` and click the reload icon for Classroom Cue before testing again. Then return to the tab you are sharing, open the popup, and play a cue. You should hear it locally and anyone receiving the tab’s shared audio should hear it too.

## Privacy

Classroom Cue does not collect data, make network requests, use analytics, or store recordings. Its `activeTab` permission lets it add a cue only to the tab you explicitly activate the soundboard from; it has no standing access to your browsing activity.

## Development

This is a dependency-free Manifest V3 extension:

```text
meet-soundboard/
├── icons/          # Extension icons
├── manifest.json   # Chrome extension manifest
├── popup.html      # Soundboard interface
├── popup.css       # UI styling
└── popup.js        # Popup-to-active-tab injection
└── tab-audio.js    # Synthesizes a cue in the active tab
```

## License

Released under the [MIT License](LICENSE).
