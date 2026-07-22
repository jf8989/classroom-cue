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
  setStatus('Ready to cue your class.', 'ready');
}

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!meetTab) return;
    const sound = button.dataset.sound;
    button.classList.add('playing');
    setTimeout(() => button.classList.remove('playing'), 220);
    try {
      await chrome.tabs.sendMessage(meetTab.id, { type: 'PLAY_CUE', sound });
      setStatus(`Playing ${button.querySelector('b').textContent} for your class.`, 'ready');
    } catch {
      setStatus('Refresh the Google Meet tab, then try again.', 'error');
    }
  });
});

getMeetTab().catch(() => setStatus('Could not check the active tab.', 'error'));
