function setImagesSetting(setting) {
  chrome.contentSettings.images.set({
    primaryPattern: '<all_urls>',
    setting: setting
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting new setting:", chrome.runtime.lastError.message);
    } else {
      console.log(`Images are now ${setting === 'allow' ? 'allowed' : 'blocked'}.`);
      checkAndRefreshCurrentTab();
      resetAlarm();
    }
  });
}

function getCurrentSetting(callback) {
  const patterns = ['http://*/*', 'https://*/*'];
  let results = [];
  
  patterns.forEach((pattern, index) => {
    chrome.contentSettings.images.get({ primaryUrl: pattern }, (details) => {
      if (chrome.runtime.lastError) {
        console.error(`Error getting current setting for ${pattern}:`, chrome.runtime.lastError.message);
      } else if (details) {
        results.push(details.setting);
        if (results.length === patterns.length) {
          callback(results[0]); // Assuming all patterns have the same setting
        }
      } else {
        console.error(`Failed to get current setting details for ${pattern}.`);
      }
    });
  });
}

function setImagesSettingIfNeeded(setting) {
  getCurrentSetting((currentSetting) => {
    if (currentSetting !== setting) {
      setImagesSetting(setting);
    } else {
      console.log(`Images setting is already ${setting === 'allow' ? 'allowed' : 'blocked'}. No change needed.`);
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
        console.error("Error getting current setting:", chrome.runtime.lastError.message);
        return;
      }

      if (details) {
        const currentSetting = details.setting;
        const newSetting = currentSetting === 'allow' ? 'block' : 'allow';
        setImagesSettingIfNeeded(newSetting);
      } else {
        console.error("Failed to get current setting details.");
      }
    });
  });
}

function disableImagesAutomatically() {
  console.log("Disabling images automatically");
  setImagesSettingIfNeeded('block');
}

function checkAndRefreshCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      chrome.tabs.get(tabId, (tab) => {
        // If audio is playing in the tab, don't reload it
        // For example, if the user is watching a video on YouTube
        // user might not want the video to be interrupted
        if (tab.audible) {
          console.log("Audio is currently playing in the tab. Skipping tab reload.");
        } else {
          chrome.tabs.reload(tabId);
          console.log("Tab reloaded to apply new images setting.");
        }
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
  chrome.alarms.clear('disableImages', (wasCleared) => {
    if (wasCleared) {
      console.log("Previous alarm cleared. Setting a new alarm.");
      setAlarm();
    } else {
      console.error("Failed to clear the previous alarm.");
    }
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
      sendResponse({ status: "done" });
    });
  }
  return true; // Indicate that the response is asynchronous
});
