// This script runs in Chrome's isolated extension world. The page-world script
// handles the microphone mix; a DOM event is the safe bridge between the worlds.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PLAY_CUE') {
    window.dispatchEvent(new CustomEvent('classroom-cue-play', { detail: { sound: message.sound } }));
    sendResponse({ ok: true });
  }
});
