// Utility functions
async function getImageSettingForPattern(pattern) {
  return new Promise((resolve, reject) => {
    chrome.contentSettings.images.get({ primaryUrl: pattern }, (details) => {
      if (chrome.runtime.lastError) {
        console.error(`Error getting current setting for ${pattern}:`, chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else if (details) {
        resolve(details.setting);
      } else {
        console.error(`Failed to get current setting details for ${pattern}.`);
        reject(new Error('No details found'));
      }
    });
  });
}

async function getCurrentSetting() {
  const patterns = ['http://*/*', 'https://*/*'];
  const results = await Promise.all(patterns.map(getImageSettingForPattern));
  return results[0]; // Assuming all patterns have the same setting
}

async function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found");
        reject(new Error("No active tab found"));
      } else {
        resolve(tabs[0].url);
      }
    });
  });
}

async function getCurrentTabSetting(url) {
  return new Promise((resolve, reject) => {
    chrome.contentSettings.images.get({ primaryUrl: url }, (details) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting current setting:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else if (details) {
        resolve(details.setting);
      } else {
        console.error("Failed to get current setting details.");
        reject(new Error("No details found"));
      }
    });
  });
}

// Main functions
async function setImagesSetting(setting) {
  return new Promise((resolve, reject) => {
    chrome.contentSettings.images.set({
      primaryPattern: '<all_urls>',
      setting: setting
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting new setting:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        console.log(`Images are now ${setting === 'allow' ? 'allowed' : 'blocked'}.`);
        // Save the current state to storage
        chrome.storage.sync.set({ imagesSetting: setting }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving images setting:", chrome.runtime.lastError.message);
          }
        });
        resetAlarm();
        resolve();
      }
    });
  });
}

async function setImagesSettingIfNeeded(setting) {
  const currentSetting = await getCurrentSetting();
  if (currentSetting !== setting) {
    await setImagesSetting(setting);
  } else {
    console.log(`Images setting is already ${setting === 'allow' ? 'allowed' : 'blocked'}. No change needed.`);
  }
}

async function toggleImagesSetting() {
  try {
    const currentUrl = await getCurrentTabUrl();
    const currentSetting = await getCurrentTabSetting(currentUrl);
    const newSetting = currentSetting === 'allow' ? 'block' : 'allow';
    await setImagesSettingIfNeeded(newSetting);
    refreshCurrentTab();
  } catch (error) {
    console.error(error.message);
  }
}

async function disableImagesAutomatically() {
  console.log("Disabling images automatically");
  await setImagesSettingIfNeeded('block');
}

async function applySavedImagesSetting() {
  chrome.storage.sync.get(['imagesSetting', 'interval'], async (result) => {
    const setting = result.imagesSetting || 'block'; // Default to 'block' if not set
    await setImagesSetting(setting);

    if (result.interval !== 0 && setting === 'allow') {
      console.log("Interval is not zero and images are allowed, setting the timer");
      setAlarm();
    }
  });
}

function refreshCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      chrome.tabs.get(tabId, (tab) => {
        chrome.tabs.reload(tabId);
      });
    }
  });
}

function setAlarm() {
  chrome.storage.sync.get(['interval'], (result) => {
    const interval = result.interval;
    if (interval === 0) {
      console.log("Interval is set to 0. No alarm will be set.");
      return;
    }
    const alarmInterval = interval || 10; // Default to 10 minutes if not set
    chrome.alarms.create('disableImages', { periodInMinutes: alarmInterval });
    console.log(`Alarm set to disable images every ${alarmInterval} minutes`);
  });
}

function resetAlarm() {
  chrome.alarms.get('disableImages', (alarm) => {
    if (alarm) {
      chrome.alarms.clear('disableImages', (wasCleared) => {
        if (wasCleared) {
          console.log("Previous alarm cleared. Setting a new alarm.");
          setAlarm();
        } else {
          console.error("Failed to clear the previous alarm.");
        }
      });
    } else {
      console.log("No previous alarm to clear. Setting a new alarm.");
      setAlarm();
    }
  });
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or reloaded, applying saved image setting");
  applySavedImagesSetting();
  setAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup, applying saved image setting");
  applySavedImagesSetting();
  setAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'disableImages') {
    disableImagesAutomatically();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleImagesSetting') {
    console.log("Received message to toggle images setting");
    toggleImagesSetting().then(() => sendResponse({ status: "done" })).catch(() => sendResponse({ status: "error" }));
  } else if (request.action === 'setInterval') {
    chrome.storage.sync.set({ interval: request.interval }, () => {
      console.log(`Interval set to ${request.interval} minutes`);
      setAlarm();
      sendResponse({ status: "done" });
    });
  }
  return true; // Indicate that the response is asynchronous
});
