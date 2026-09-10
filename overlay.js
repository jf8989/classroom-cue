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
  let quickBarPosition;

  function root() { return document.getElementById(ROOT_ID); }
  function remove() { root()?.remove(); }
  function constrainPosition(left, top, bar) {
    const maxLeft = Math.max(0, window.innerWidth - bar.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - bar.offsetHeight);
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop)
    };
  }
  function positionBar(bar) {
    if (!quickBarPosition) return;
    const position = constrainPosition(quickBarPosition.left, quickBarPosition.top, bar);
    bar.style.left = `${position.left}px`;
    bar.style.top = `${position.top}px`;
    bar.style.transform = 'none';
  }
  function makeDraggable(bar) {
    let drag;

    bar.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 && event.pointerType !== 'touch') return;
      const rect = bar.getBoundingClientRect();
      drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
      bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      const position = constrainPosition(drag.left + dx, drag.top + dy, bar);
      quickBarPosition = position;
      bar.style.left = `${position.left}px`;
      bar.style.top = `${position.top}px`;
      bar.style.transform = 'none';
      event.preventDefault();
    });
    bar.addEventListener('pointerup', (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.moved) bar.dataset.dragged = 'true';
      drag = undefined;
    });
    bar.addEventListener('lostpointercapture', () => { drag = undefined; });
    bar.addEventListener('click', (event) => {
      if (bar.dataset.dragged !== 'true') return;
      delete bar.dataset.dragged;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
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
    positionBar(bar);
    makeDraggable(bar);
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
