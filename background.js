chrome.storage.sync.get({ bookmarks: [] }, function (result) {
    var bookmarks = result.bookmarks;
    console.log("All Bookmarks:");
    bookmarks.forEach(function(bookmark) {
        console.log(bookmark);
    });
});

chrome.storage.sync.get({ bookmarks: [] }, function (result) {
    var bookmarks = result.bookmarks;
    bookmarks.forEach(function(bookmark) {
        scheduleNotification(bookmark);
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("background.js - onMessage");
    if (message.action === "saveBookmark") {
        saveBookmark(message.data);
    }
});

function saveBookmark(data) {
    console.log("saveBookmark - bg.js")
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0];
        var currentUrl = currentTab.url;
        var formattedReminderDateTime = data.formattedReminderDate + ' ' + data.formattedReminderTime;

        chrome.bookmarks.search({ title: "Bookmark Reminder Extension" }, function (results) 
        {
            if (results.length > 0) 
            {
                var existingFolder = results[0];
                createBookmark(existingFolder.id, currentTab.title, currentUrl, formattedReminderDateTime);
            } 
            else 
            {
                chrome.bookmarks.create({ title: "Bookmark Reminder Extension" }, function (newFolder) {
                    createBookmark(newFolder.id, currentTab.title, currentUrl, formattedReminderDateTime);
                });
            }

            var bookmarkData = {
                title: currentTab.title,
                url: currentUrl,
                reminderDateTime: formattedReminderDateTime,
                bookmarkId: Date.now()
            };
            storeBookmark(bookmarkData);
            scheduleNotificationsFromStorage();
        });
    });
}

function storeBookmark(bookmarkData) {
    console.log("storeBookmark - bg.js");
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.push(bookmarkData);
        chrome.storage.sync.set({ bookmarks: bookmarks }, function () {
            console.log("Bookmark saved:", bookmarkData);
            chrome.runtime.sendMessage({
                action: "successMessage",
                data: "Bookmark saved successfully to: \nFolder - Bookmark Reminder Extension \nTab - " + bookmarkData.title
            });
        });
    });
}

function scheduleNotificationsFromStorage() {
    console.log("scheduleNotificationFromStorage");
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.forEach(function(bookmark) {
            scheduleNotification(bookmark);
        });
    });
}

function scheduleNotification(bookmarkData) {
    
    var reminderTimestamp = new Date(bookmarkData.reminderDateTime).getTime();
    var now = Date.now();
    var delay = reminderTimestamp - now;

    if (delay <= 0) {
        reminderNotif(bookmarkData.title, bookmarkData);
    } else {
        setTimeout(function () {
            reminderNotif(bookmarkData.title, bookmarkData);
        }, delay);
    }
}

function reminderNotif(websiteName, bookmarkData) {
    console.log("reminderNotif");
    var notificationOptions = {
        type: "basic",
        iconUrl: "assets/hello.png",
        title: "Bookmark Reminder!",
        message: "It's time to visit the bookmarked website: " + websiteName
    };
    chrome.notifications.create(notificationOptions, function(notificationId) {
        chrome.storage.sync.get({ bookmarks: [] }, function(result) {
            var bookmarks = result.bookmarks || [];
            var updatedBookmarks = bookmarks.filter(function(bookmark) {
                return bookmark.title !== bookmarkData.title || bookmark.url !== bookmarkData.url || bookmark.bookmarkId !== bookmarkData.bookmarkId;
            });
            
            chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function() {
                console.log("Bookmark removed after notification:", bookmarkData);
            });
            chrome.storage.sync.get({ bookmarks: [] }, function (result) {
                var bookmarks = result.bookmarks;
                console.log("All Bookmarks:");
                bookmarks.forEach(function(bookmark) {
                    console.log(bookmark);
                });
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
        console.log("Bookmark saved:", newBookmark);
    });
}
