chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getApiKey') {
        chrome.storage.local.get('apiKey', (result) => {
            sendResponse({ apiKey: result.apiKey });
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (request.action === 'setApiKey') {
        chrome.storage.local.set({ apiKey: request.apiKey }, () => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === 'removeApiKey') {
        chrome.storage.local.remove('apiKey', () => {
            sendResponse({ success: true });
        });
        return true;
    }
});