
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
                chrome.tabs.create({ url: bookmarkData.url });
                break;
            case 1:
                snoozeBookmark(bookmarkData);
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

function snoozeBookmark(data) {
    var tab = data.title;
    var url = data.url;
    var formattedReminderDate = data.reminderDateTime.substring(0, 10);
    var formattedReminderTime = addHourToTime(data.reminderDateTime.substring(11));
    var formattedReminderDateTime = formattedReminderDate + ' ' + (formattedReminderTime || '00:00');
    var reminderNote = data.note || 'No Note.';
    var snoozeBookmarkData = {
        title: tab,
        url: url,
        reminderDateTime: formattedReminderDateTime,
        bookmarkId: generateUniqueId(),
        note: reminderNote
    };
    
    // console.log("Snooze Bookmark Data:", snoozeBookmarkData);
    storeSnoozedBookmark(snoozeBookmarkData);
    scheduleNotificationsFromStorage();
}

function storeSnoozedBookmark(bookmarkData) {
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.push(bookmarkData);
        
        // // Log all bookmarks after pushing new bookmarkData
        // console.log("All Bookmarks:");
        // bookmarks.forEach(function(bookmark) {
        //     console.log(bookmark);
        // });
        chrome.storage.sync.set({ bookmarks: bookmarks }, function () {
            // console.log("Bookmarks updated successfully.");
        });
    });
}




function addHourToTime(time) {
    var parts = time.split(":");
    var hours = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);
    hours += 1;
    hours = hours % 24;
    return (hours < 10 ? '0' : '') + hours + ":" + (minutes < 10 ? '0' : '') + minutes;
}