chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'create_notification') {
      chrome.notifications.create('', {
        title: 'Just wanted to notify you',
        message: 'How great it is!',
        iconUrl: 'assets/hello.png',
        type: 'basic',
        buttons: [
            {
                title: 'Yes'
            },
            {
                title: 'No'
            }
        ]
      });
    }
  });
  