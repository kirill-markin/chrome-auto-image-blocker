function setImagesSetting(setting) {
  chrome.contentSettings.images.set({
    primaryPattern: '<all_urls>',
    setting: setting
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting new setting:", chrome.runtime.lastError);
    } else {
      console.log(`Images are now ${setting === 'allow' ? 'allowed' : 'blocked'}.`);
      refreshCurrentTab();
    }
  });
}

function toggleImagesSetting() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found");
      return;
    }

    const currentUrl = tabs[0].url;

    chrome.contentSettings.images.get({ primaryUrl: currentUrl }, (details) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting current setting:", chrome.runtime.lastError);
        return;
      }

      const newSetting = details.setting === 'allow' ? 'block' : 'allow';
      setImagesSetting(newSetting);
    });
  });
}

function disableImagesAutomatically() {
  console.log("Disabling images automatically");
  setImagesSetting('block');
}

function refreshCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

function setAlarm() {
  chrome.storage.sync.get(['interval'], (result) => {
    const interval = result.interval || 10; // Default to 10 minutes if not set
    chrome.alarms.create('disableImages', { periodInMinutes: interval });
    console.log(`Alarm set to disable images every ${interval} minutes`);
  });
}

// Set images to disabled when the extension is first installed or reloaded
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or reloaded, disabling images by default");
  disableImagesAutomatically();
  setAlarm();
});

// Ensure images are disabled when the browser starts
chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup, disabling images by default");
  disableImagesAutomatically();
  setAlarm();
});

// Listen for the alarm to disable images
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'disableImages') {
    disableImagesAutomatically();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleImagesSetting') {
    console.log("Received message to toggle images setting");
    toggleImagesSetting();
    sendResponse({ status: "done" });
  } else if (request.action === 'setInterval') {
    chrome.storage.sync.set({ interval: request.interval }, () => {
      console.log(`Interval set to ${request.interval} minutes`);
      setAlarm();
    });
  }
});
