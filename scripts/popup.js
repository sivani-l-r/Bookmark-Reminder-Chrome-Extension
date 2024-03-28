chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentUrl = currentTab.url;
    document.getElementById("currentWebsite").innerText = "Current website: " + currentUrl;
});

document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var successMessage = document.getElementById("userSuccessMessage");
    var reminderDate = document.getElementById("datePicker");
  
    submitBtn.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;

            var formattedReminderDate = reminderDate.value; 
  
            chrome.bookmarks.search({ title: "Bookmark Reminder Extension" }, function (results) {
                if (results.length > 0) {
                    var existingFolder = results[0];
                    chrome.bookmarks.create({
                        parentId: existingFolder.id,
                        title: currentTab.title + ' - ' + formattedReminderDate, 
                        url: currentUrl,
                    }, function (newBookmark) {
                        console.log("Bookmark saved:", newBookmark);
                        successMessage.innerText = "Bookmark saved successfully to: \nFolder - " + existingFolder.title + "\nTab - " + currentTab.title;
                    });
                } else {
                    chrome.bookmarks.create({
                        title: "Bookmark Reminder Extension"
                    }, function (newFolder) {
                        console.log("Bookmark folder created:", newFolder);
                        
                        chrome.bookmarks.create({
                            parentId: newFolder.id,
                            title: currentTab.title + ' - ' + formattedReminderDate, 
                            url: currentUrl,
                        }, function (newBookmark) {
                            console.log("Bookmark saved:", newBookmark);
                            successMessage.innerText = "Bookmark saved successfully to: \nFolder - " + newFolder.title + "\nTab - " + currentTab.title;
                        });
                    });
                }
            });
        });
    });
});
