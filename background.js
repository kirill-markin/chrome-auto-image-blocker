// Utility functions
async function getImageSettingForPattern(pattern) {
  return new Promise((resolve, reject) => {
    chrome.contentSettings.images.get({ primaryUrl: pattern }, (details) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error getting current setting for ${pattern}:`,
          chrome.runtime.lastError.message
        );
        reject(chrome.runtime.lastError);
      } else if (details) {
        resolve(details.setting);
      } else {
        console.error(`Failed to get current setting details for ${pattern}.`);
        reject(new Error("No details found"));
      }
    });
  });
}

async function getCurrentSetting() {
  const patterns = ["http://*/*", "https://*/*"];
  try {
    const results = await Promise.all(patterns.map(getImageSettingForPattern));
    return results[0]; // Assuming all patterns have the same setting
  } catch (error) {
    console.error("Error getting current setting:", error);
    return "allow"; // Default to allow if there's an error
  }
}

// Set images setting (allow or block)
async function setImagesSetting(setting) {
  const patterns = ["http://*/*", "https://*/*"];
  const settingPromises = patterns.map(pattern => {
    return new Promise((resolve, reject) => {
      chrome.contentSettings.images.set(
        {
          primaryPattern: pattern,
          setting: setting,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error setting new setting for ${pattern}:`,
              chrome.runtime.lastError.message
            );
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });
  });

  try {
    await Promise.all(settingPromises);
    console.log(`Images are now ${setting === "allow" ? "allowed" : "blocked"}.`);
    
    // Save the current state to storage
    chrome.storage.sync.set({ imagesSetting: setting }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error saving images setting:",
          chrome.runtime.lastError.message
        );
      }
    });
    
    // Update icon based on current state
    updateIcon(setting);
    
    return true;
  } catch (error) {
    console.error("Error setting images setting:", error);
    return false;
  }
}

// Toggle images setting
async function toggleImagesSetting() {
  try {
    const currentSetting = await getCurrentSetting();
    const newSetting = currentSetting === "allow" ? "block" : "allow";
    const success = await setImagesSetting(newSetting);
    if (success) {
      refreshCurrentTab();
    }
  } catch (error) {
    console.error("Error toggling images setting:", error.message);
  }
}

// Refresh the current tab using tabs.reload
function refreshCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      chrome.tabs.reload(tabId);
    }
  });
}

// Update the extension icon based on current setting
function updateIcon(setting) {
  const iconPath = setting === "allow" ? 
    { 
      path: {
        "16": "assets/icons/disconnect-16.png",
        "32": "assets/icons/disconnect-32.png",
        "48": "assets/icons/disconnect-48.png",
        "128": "assets/icons/disconnect-128.png"
      }
    } : 
    { 
      path: {
        "16": "assets/icons/connect-16.png",
        "32": "assets/icons/connect-32.png",
        "48": "assets/icons/connect-48.png",
        "128": "assets/icons/connect-128.png"
      }
    };
  
  chrome.action.setIcon(iconPath, () => {
    if (chrome.runtime.lastError) {
      console.error("Icon error details:", chrome.runtime.lastError);
      console.log("Attempted to set icon with path:", JSON.stringify(iconPath));
    } else {
      console.log("Icon successfully updated to:", setting === "allow" ? "disconnect" : "connect");
    }
  });
}

// Apply saved images setting on startup
async function applySavedImagesSetting() {
  chrome.storage.sync.get(["imagesSetting"], async (result) => {
    const setting = result.imagesSetting || "allow"; // Default to 'allow' if not set
    await setImagesSetting(setting);
  });
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or reloaded");
  applySavedImagesSetting();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup");
  applySavedImagesSetting();
});

// Listen for browser action clicks
chrome.action.onClicked.addListener(() => {
  console.log("Extension icon clicked, toggling images setting");
  toggleImagesSetting();
});
