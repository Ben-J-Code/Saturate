chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        await chrome.tabs.sendMessage(activeInfo.tabId, {
            action: "refreshSettings"
        });
    } catch (error) {
        // Tab may not have a content script (e.g. chrome:// pages)
    }
});