const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-sound]')];
const volumeSlider = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const clips = {
  applause: 'assets/sounds/applause.wav',
  cheer: 'assets/sounds/cheer.wav',
  fanfare: 'assets/sounds/fanfare.wav',
  trombone: 'assets/sounds/sad-trombone.wav',
  boing: 'assets/sounds/boing.wav',
  rimshot: 'assets/sounds/rimshot.wav',
  quack: 'assets/sounds/duck-quack.wav',
  bell: 'assets/sounds/school-bell.wav',
  whoosh: 'assets/sounds/whoosh.wav',
  drumroll: 'assets/sounds/drumroll.wav',
  mystery: 'assets/sounds/mystery-rise.wav'
};

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`;
}

function setVolume(value) {
  const volume = Math.max(0, Math.min(100, Number(value) || 0));
  volumeSlider.value = volume;
  volumeValue.value = volume;
  volumeValue.textContent = volume;
  return volume / 100;
}

chrome.storage.local.get({ cueVolume: 100 }).then(({ cueVolume }) => setVolume(cueVolume));

volumeSlider.addEventListener('input', () => {
  const volume = setVolume(volumeSlider.value) * 100;
  chrome.storage.local.set({ cueVolume: volume });
});

async function playInActiveTab(sound, volume) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab');
  if (!/^https?:\/\//.test(activeTab.url || '')) {
    const error = new Error('Cue playback requires a regular website tab.');
    error.code = 'UNSUPPORTED_TAB';
    throw error;
  }

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['tab-audio.js'],
    world: 'MAIN',
    injectImmediately: true
  });

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    world: 'MAIN',
    args: [chrome.runtime.getURL(clips[sound]), volume],
    func: (soundUrl, cueVolume) => window.__classroomCuePlay(soundUrl, cueVolume)
  });
}

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const sound = button.dataset.sound;
    button.classList.add('playing');
    setTimeout(() => button.classList.remove('playing'), 220);
    try {
      const volume = Number(volumeSlider.value) / 100;
      await playInActiveTab(sound, volume);
      setStatus(volume ? `Playing ${button.querySelector('b').textContent} in this tab.` : 'Volume is muted.', 'ready');
    } catch (error) {
      if (error.code === 'UNSUPPORTED_TAB') {
        setStatus('Switch to the tab you are sharing. Chrome internal pages cannot play cues.', 'error');
      } else {
        console.error(error);
        setStatus('Chrome cannot add sound to this page. Use a normal website tab.', 'error');
      }
    }
  });
});
