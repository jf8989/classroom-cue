// A deliberately small, page-local toolbar. It is rendered only when the user
// enables it from the extension popup and does not reserve layout space.
(() => {
  if (window.__classroomCueOverlayLoaded) return;
  window.__classroomCueOverlayLoaded = true;

  const ROOT_ID = 'classroom-cue-quick-bar';
  const clips = {
    applause: 'assets/sounds/applause.wav', cheer: 'assets/sounds/cheer.wav',
    fanfare: 'assets/sounds/fanfare.wav', trombone: 'assets/sounds/sad-trombone.wav',
    boing: 'assets/sounds/boing.wav', rimshot: 'assets/sounds/rimshot.wav',
    quack: 'assets/sounds/duck-quack.wav', bell: 'assets/sounds/school-bell.wav',
    whoosh: 'assets/sounds/whoosh.wav', drumroll: 'assets/sounds/drumroll.wav',
    mystery: 'assets/sounds/mystery-rise.wav'
  };
  const cues = [
    ['applause', '👏', 'Applause'], ['cheer', '🎉', 'Cheer'], ['fanfare', '🏆', 'Ta-da'],
    ['trombone', '📯', 'Wah-wah'], ['boing', '🪀', 'Boing'], ['rimshot', '🥁', 'Rimshot'],
    ['quack', '🦆', 'Quack'], ['bell', '🔔', 'Class bell'], ['whoosh', '💨', 'Whoosh'],
    ['drumroll', '🥁', 'Drumroll'], ['mystery', '🕵️', 'Mystery rise']
  ];
  let cueVolume = 100;

  function root() { return document.getElementById(ROOT_ID); }
  function remove() { root()?.remove(); }
  function play(sound) {
    const audio = new Audio(chrome.runtime.getURL(clips[sound]));
    audio.volume = Math.max(0, Math.min(1, Number(cueVolume) / 100));
    audio.addEventListener('ended', () => audio.remove(), { once: true });
    audio.play().catch(() => {});
  }
  function render(size) {
    remove();
    const bar = document.createElement('div');
    bar.id = ROOT_ID;
    bar.className = `ccq-size-${['small', 'medium', 'large'].includes(size) ? size : 'small'}`;
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Classroom Cue quick sounds');
    cues.forEach(([sound, icon, label]) => {
      const button = document.createElement('button');
      button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
      button.textContent = icon;
      button.addEventListener('click', () => play(sound));
      bar.append(button);
    });
    document.documentElement.append(bar);
  }
  function apply({ quickBarEnabled, quickBarSize }) {
    if (quickBarEnabled === false) return remove();
    if (quickBarEnabled === true || root()) render(quickBarSize || root()?.dataset.size || 'small');
  }

  chrome.storage.local.get({ cueVolume: 100 }).then(({ cueVolume: storedVolume }) => {
    cueVolume = storedVolume;
  });
  chrome.runtime.sendMessage({ type: 'CLASSROOM_CUE_GET_QUICK_BAR' }).then(apply).catch(() => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.cueVolume) cueVolume = changes.cueVolume.newValue;
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'CLASSROOM_CUE_QUICK_BAR') apply(message);
  });
})();
