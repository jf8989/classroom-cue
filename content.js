// This script runs in Chrome's isolated extension world. The page-world script
// handles the microphone mix; DOM events are the safe bridge between the worlds.
function readMixStatus() {
  let micMixActive = false;
  const receiveStatus = (event) => { micMixActive = Boolean(event.detail?.micMixActive); };
  window.addEventListener('classroom-cue-status', receiveStatus, { once: true });
  window.dispatchEvent(new Event('classroom-cue-get-status'));
  return micMixActive;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PLAY_CUE') {
    window.dispatchEvent(new CustomEvent('classroom-cue-play', { detail: { sound: message.sound } }));
    sendResponse({ ok: true, micMixActive: readMixStatus() });
  }
  if (message?.type === 'GET_CUE_STATUS') {
    sendResponse({ micMixActive: readMixStatus() });
  }
});
