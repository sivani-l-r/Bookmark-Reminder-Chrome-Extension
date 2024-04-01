
chrome.alarms.create({ periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {
    scheduleNotificationsFromStorage();
    // console.log("SW Active")
});



function scheduleNotificationsFromStorage() {
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.forEach(function(bookmark) {
            scheduleNotification(bookmark);
        });
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "saveBookmark") {
        saveBookmark(message.data);
    }
});

function saveBookmark(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0];
        var currentUrl = currentTab.url;
        var formattedReminderDateTime = data.formattedReminderDate + ' ' + (data.formattedReminderTime || '00:00');
        var reminderNote = data.note || 'No Note.';
        chrome.bookmarks.search({ title: "Bookmark Alert Extension" }, function (results) 
        {
            if (results.length > 0) 
            {
                var existingFolder = results[0];
                createBookmark(existingFolder.id, currentTab.title, currentUrl, formattedReminderDateTime);
            } 
            else 
            {
                chrome.bookmarks.create({ title: "Bookmark Alert Extension" }, function (newFolder) {
                    createBookmark(newFolder.id, currentTab.title, currentUrl, formattedReminderDateTime);
                });
            }

            var bookmarkData = {
                title: currentTab.title,
                url: currentUrl,
                reminderDateTime: formattedReminderDateTime,
                bookmarkId: generateUniqueId() ,
                note: reminderNote
            };
            storeBookmark(bookmarkData);
            scheduleNotificationsFromStorage();
            

        });
    });
}


function generateUniqueId() {
    
    return Date.now().toString() + '-' + Math.floor(Math.random() * 1000);
}

function storeBookmark(bookmarkData) {
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.push(bookmarkData);
        chrome.storage.sync.set({ bookmarks: bookmarks }, function () {
        //     console.log("Bookmark saved:", bookmarkData);
            chrome.runtime.sendMessage({
                action: "successMessage",
                data: `Bookmark saved successfully to:
                        Folder - Bookmark Alert Extension
                    Url - ${bookmarkData.url}`
            });
            
        });
    });
}

function scheduleNotification(bookmarkData) {
    
    var reminderTimestamp = new Date(bookmarkData.reminderDateTime).getTime();
    var now = Date.now();
    var delay = reminderTimestamp - now;

    if (delay <= 0) {
        reminderNotif(bookmarkData);
    } else {
        setTimeout(function () {
            reminderNotif(bookmarkData);
        }, delay);
    }
}

function reminderNotif(bookmarkData) {
    var notificationOptions = {
        type: "basic",
        iconUrl: "assets/bell.png",
        title: "📌 Bookmark Alert!",
        message: "\nTab: " + bookmarkData.title  + "\nNote: " + bookmarkData.note +  "\nURL: " + bookmarkData.url ,
        buttons: [
            { 
                title: "Visit Website"
         },
            { 
                title: "Snooze",
            }
        ]

    };

    chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
        switch (buttonIndex) {
            case 0:
                console.log("Button 1 clicked");
                chrome.tabs.create({ url: bookmarkData.url });
                break;
            case 1:
                console.log("Button 2 clicked");
                break;
            default:
                break;
        }
    });
    
    chrome.notifications.create(notificationOptions, function callback(notificationId) {
        chrome.storage.sync.get({ bookmarks: [] }, function(result) {
            var bookmarks = result.bookmarks || [];
            var updatedBookmarks = bookmarks.filter(function(bookmark) {
                return !(bookmark.title === bookmarkData.title && bookmark.url === bookmarkData.url && bookmark.bookmarkId === bookmarkData.bookmarkId);
            });
            chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function() {
                // console.log("Bookmark removed after notification:", bookmarkData);
            });
            chrome.storage.sync.get({ bookmarks: [] }, function (result) {
                var bookmarks = result.bookmarks;
                // console.log("All Bookmarks:");
                // bookmarks.forEach(function(bookmark) {
                //     console.log(bookmark);
                // });
            });
        });
    });
}

function createBookmark(parentId, title, url, reminderDateTime) 
{
    chrome.bookmarks.create({
        parentId: parentId,
        title: title + ' - ' + reminderDateTime,
        url: url,
    }, function (newBookmark) {
        // console.log("Bookmark saved:", newBookmark);
    });
}
