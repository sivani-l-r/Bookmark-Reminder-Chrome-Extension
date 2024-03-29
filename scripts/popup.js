document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var successMessage = document.getElementById("userSuccessMessage");
    var reminderDate = document.getElementById("datePicker");
    var reminderTime = document.getElementById("timePicker");

    submitBtn.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;

            var formattedReminderDate = reminderDate.value;
            var formattedReminderTime = reminderTime.value;

            var formattedReminderDateTime = formattedReminderDate + ' ' + formattedReminderTime;

            // Bookmarking logic
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
            });

            // Reminder notification logic
            var reminderTimestamp = new Date(formattedReminderDateTime).getTime();
            console.log(reminderTimestamp);
            var now = Date.now();
            console.log(now);
            var delay = reminderTimestamp - now;
            console.log(delay);

            if (delay > 0) {
                setTimeout(function () {
                    var notificationOptions = {
                        type: "basic",
                        iconUrl: "assets/hello.png", 
                        title: "Reminder",
                        message: "It's time to visit the bookmarked website: " + currentTab.title
                    };
                    chrome.notifications.create(notificationOptions);
                }, delay);
            }
        });
    });
});

function createBookmark(parentId, title, url, reminderDateTime) {
    var successMessage = document.getElementById("userSuccessMessage");
    chrome.bookmarks.create({
        parentId: parentId,
        title: title + ' - ' + reminderDateTime,
        url: url,
    }, function (newBookmark) {
        console.log("Bookmark saved:", newBookmark);
        successMessage.innerText = "Bookmark saved successfully to: \nFolder - Bookmark Reminder Extension  \nTab - " + title;
    });
}
