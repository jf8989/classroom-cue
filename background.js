const TAB_SETTING_PREFIX = 'classroomCueQuickBar:';

function tabSettingKey(tabId) {
  return `${TAB_SETTING_PREFIX}${tabId}`;
}

async function getQuickBarSettings(tabId) {
  const [{ quickBarSize = 'small' }, tabSettings] = await Promise.all([
    chrome.storage.local.get({ quickBarSize: 'small' }),
    chrome.storage.local.get(tabSettingKey(tabId))
  ]);

  return {
    quickBarEnabled: tabSettings[tabSettingKey(tabId)] === true,
    quickBarSize
  };
}

async function sendQuickBarSettings(tabId, settings) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'CLASSROOM_CUE_QUICK_BAR', ...settings });
  } catch {
    // Tabs open before installation may not have received the content script.
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['overlay.css'] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['overlay.js'] });
    await chrome.tabs.sendMessage(tabId, { type: 'CLASSROOM_CUE_QUICK_BAR', ...settings });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'CLASSROOM_CUE_GET_QUICK_BAR') {
    const tabId = sender.tab?.id ?? message.tabId;
    if (!tabId) {
      return false;
    }

    getQuickBarSettings(tabId)
      .then((settings) => sendResponse(settings))
      .catch((error) => {
        console.error('Unable to read quick bar settings.', error);
        sendResponse({ quickBarEnabled: false, quickBarSize: 'small' });
      });
    return true;
  }

  if (message?.type === 'CLASSROOM_CUE_SET_QUICK_BAR' && Number.isInteger(message.tabId)) {
    const settings = {
      quickBarEnabled: message.quickBarEnabled === true,
      quickBarSize: ['small', 'medium', 'large'].includes(message.quickBarSize) ? message.quickBarSize : 'small'
    };
    Promise.all([
      chrome.storage.local.set({ quickBarSize: settings.quickBarSize }),
      chrome.storage.local.set({ [tabSettingKey(message.tabId)]: settings.quickBarEnabled })
    ])
      .then(() => sendQuickBarSettings(message.tabId, settings))
      .then(() => sendResponse({ ok: true }))
      .catch((error) => {
        console.error('Unable to update the quick bar.', error);
        sendResponse({ ok: false, error: error.message });
      });
    return true;
  }
});

// The enabled state follows a tab through page reloads and extension reloads,
// but is discarded as soon as that tab closes.
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(tabSettingKey(tabId)).catch(() => {});
});
