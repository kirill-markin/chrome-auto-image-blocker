// change the icon of the toggle button based on the current images setting
chrome.storage.sync.get(["imagesSetting"], (result) => {
  const setting = result.imagesSetting || "block"; // Default to 'block' if not set
  console.log("Current images setting:", setting);
  if (setting === "allow") {
    document.getElementById("toggleImages").classList.remove("blocking");
    document.querySelector(".interval-container").style.display = "flex";
  } else {
    document.getElementById("toggleImages").classList.add("blocking");
    document.querySelector(".interval-container").style.display = "none";
  }
});

// Toggle images setting functionality
document.getElementById("toggleImages").addEventListener("click", () => {
  console.log("Toggle Images button clicked");

  chrome.runtime.sendMessage({ action: "toggleImagesSetting" }, (response) => {
    if (response && response.status === "done") {
      console.log("Images setting toggled successfully");
      window.close();
    } else {
      console.error("Error toggling images setting:", chrome.runtime.lastError);
    }
  });
});

// Set interval functionality
document.getElementById("setInterval").addEventListener("click", () => {
  const interval = parseFloat(
    document.getElementById("intervalInput").value,
    10
  );
  if (isNaN(interval) || interval < 0) {
    alert(
      "Please enter a valid number greater than 0 or 0 to disable the alarm."
    );
    return;
  }

  chrome.runtime.sendMessage(
    { action: "setInterval", interval: interval },
    (response) => {
      console.log(`Interval set to ${interval} minutes`);
      window.close();
    }
  );
});

// Load current interval value
chrome.storage.sync.get(["interval"], (result) => {
  // No default value here to avoid overwriting the stored 0 value
  if (result.interval !== undefined) {
    document.getElementById("intervalInput").value = result.interval;
  } else {
    document.getElementById("intervalInput").value = 10; // Default to 10 minutes if not set
  }
});

// Close button functionality
document.querySelector(".close-button").addEventListener("click", () => {
  window.close();
});

// Restart button functionality
document.getElementById("restart").addEventListener("click", () => {
  console.log("Restart button clicked");

  chrome.runtime.sendMessage({ action: "restartAlarm" }, (response) => {
    console.log("Response received:", response);
    window.close();
  });
});
