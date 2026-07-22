const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-sound]')];
const clips = {
  applause: 'assets/sounds/applause.mp3',
  cheer: 'assets/sounds/cheer.mp3',
  fanfare: 'assets/sounds/fanfare.mp3',
  trombone: 'assets/sounds/sad-trombone.mp3',
  boing: 'assets/sounds/boing.mp3',
  rimshot: 'assets/sounds/rimshot.mp3',
  quack: 'assets/sounds/duck-quack.mp3',
  bell: 'assets/sounds/school-bell.mp3',
  whoosh: 'assets/sounds/whoosh.mp3',
  drumroll: 'assets/sounds/drumroll.mp3',
  mystery: 'assets/sounds/mystery-rise.mp3'
};

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
    args: [chrome.runtime.getURL(clips[sound])],
    func: (soundUrl) => window.__classroomCuePlay(soundUrl)
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
