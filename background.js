
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'create_notification') {
        console.log("create notif")
        chrome.alarms.create('BOOKMARK_ALARM', {
            delayInMinutes: delay / (1000 * 60) // Convert milliseconds to minutes
        });
        // Create notification when requested
        // chrome.notifications.create('', {
        //     title: 'Just wanted to notify you',
        //     message: 'How great it is!',
        //     iconUrl: 'assets/hello.png',
        //     type: 'basic',
        //     buttons: [
        //         { title: 'Yes' },
        //         { title: 'No' }
        //     ]
        // });
        
        // chrome.alarms.create('testAlarm', {
        //     periodInMinutes: 0.1
        // });
    }
});

