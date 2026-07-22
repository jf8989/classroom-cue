const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-sound]')];

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`;
}

async function playInActiveTab(sound) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab');

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['tab-audio.js'],
    world: 'MAIN',
    injectImmediately: true
  });

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    world: 'MAIN',
    args: [sound],
    func: (cue) => window.__classroomCuePlay(cue)
  });
}

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const sound = button.dataset.sound;
    button.classList.add('playing');
    setTimeout(() => button.classList.remove('playing'), 220);
    try {
      await playInActiveTab(sound);
      setStatus(`Playing ${button.querySelector('b').textContent} in this tab.`, 'ready');
    } catch (error) {
      console.error(error);
      setStatus('Chrome cannot add sound to this page. Use a normal website tab.', 'error');
    }
  });
});
