document.getElementById('toggleImages').addEventListener('click', () => {
  console.log("Toggle Images button clicked");

  chrome.runtime.sendMessage({ action: 'toggleImagesSetting' }, (response) => {
    if (response && response.status === "done") {
      console.log("Images setting toggled successfully");
      window.close(); // Close the popup after toggling the setting
    } else {
      console.error("Error toggling images setting:", chrome.runtime.lastError);
    }
  });
});

document.getElementById('setInterval').addEventListener('click', () => {
  const interval = parseFloat(document.getElementById('intervalInput').value, 10);
  if (isNaN(interval) || interval < 0) {
    alert("Please enter a valid number greater than 0 or 0 to disable the alarm.");
    return;
  }

  chrome.runtime.sendMessage({ action: 'setInterval', interval: interval }, (response) => {
    console.log(`Interval set to ${interval} minutes`);
    window.close();
  });
});

// Load current interval value
chrome.storage.sync.get(['interval'], (result) => {
  const interval = result.interval || 10; // Default to 10 minutes if not set
  document.getElementById('intervalInput').value = interval;
});
