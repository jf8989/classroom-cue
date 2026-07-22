const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-sound]')];
let meetTab;

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`;
}

async function getMeetTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.url?.startsWith('https://meet.google.com/')) {
    setStatus('Open your Google Meet tab, then choose a cue.', 'error');
    buttons.forEach((button) => { button.disabled = true; });
    return;
  }
  meetTab = activeTab;
  const cueStatus = await chrome.tabs.sendMessage(meetTab.id, { type: 'GET_CUE_STATUS' });
  if (cueStatus?.micMixActive) {
    setStatus('Ready — your microphone mix is active.', 'ready');
  } else {
    setStatus('Refresh Meet and rejoin once to activate the microphone mix.', 'error');
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!meetTab) return;
    const sound = button.dataset.sound;
    button.classList.add('playing');
    setTimeout(() => button.classList.remove('playing'), 220);
    try {
      const cueResult = await chrome.tabs.sendMessage(meetTab.id, { type: 'PLAY_CUE', sound });
      if (cueResult?.micMixActive) {
        setStatus(`Playing ${button.querySelector('b').textContent} for your class.`, 'ready');
      } else {
        setStatus('Preview requested — refresh Meet and rejoin to send cues to students.', 'error');
      }
    } catch {
      setStatus('Refresh the Google Meet tab, then try again.', 'error');
    }
  });
});

getMeetTab().catch(() => setStatus('Could not check the active tab.', 'error'));
