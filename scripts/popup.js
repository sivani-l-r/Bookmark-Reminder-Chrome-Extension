document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var reminderDate = document.getElementById("datePicker");
    var reminderTime = document.getElementById("timePicker");

    submitBtn.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;

            var formattedReminderDate = reminderDate.value;
            var formattedReminderTime = reminderTime.value;

            var formattedReminderDateTime = formattedReminderDate + ' ' + formattedReminderTime;

            chrome.bookmarks.search({ title: "Bookmark Reminder Extension" }, function (results) {
                if (results.length > 0) 
                {
                    var existingFolder = results[0];
                    createBookmark(existingFolder.id, currentTab.title, currentUrl, formattedReminderDateTime);
                } 
                else 
                {
                    chrome.bookmarks.create({
                        title: "Bookmark Reminder Extension"
                    }, function (newFolder) {
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
    });
});

function storeBookmark(bookmarkData) {
    chrome.storage.sync.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.push(bookmarkData);
        chrome.storage.sync.set({ bookmarks: bookmarks }, function () {
            console.log("Bookmark saved:", bookmarkData);
            displaySuccessMessage("Bookmark saved successfully to: \nFolder - Bookmark Reminder Extension \nTab - " + bookmarkData.title);
        });
    });
}

function scheduleNotificationsFromStorage() {
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
                return bookmark.bookmarkId !== bookmarkData.bookmarkId;
            });
            
            chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function() {
                console.log("Bookmark removed after notification:", bookmarkData);
                chrome.storage.sync.get({ bookmarks: [] }, function (result) {
                    var bookmarks = result.bookmarks;
                    console.log("All Bookmarks:");
                    bookmarks.forEach(function(bookmark) {
                        console.log(bookmark);
                    });
                });
            });
        });
    });
}




function createBookmark(parentId, title, url, reminderDateTime) {
    var successMessage = document.getElementById("userSuccessMessage");
    chrome.bookmarks.create({
        parentId: parentId,
        title: title + ' - ' + reminderDateTime,
        url: url,
    }, function (newBookmark) {
        console.log("Bookmark saved:", newBookmark);
        chrome.storage.sync.get({ bookmarks: [] }, function (result) {
            var bookmarks = result.bookmarks;
            console.log("All Bookmarks:");
            bookmarks.forEach(function(bookmark) {
                console.log(bookmark);
            });
        });
    });
}

function displaySuccessMessage(message) {
    var successMessage = document.getElementById("userSuccessMessage");
    successMessage.innerText = message;
}
