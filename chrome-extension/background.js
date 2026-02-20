chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: "https://unpredictable-runner.web.app"
    });
});
