chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentUrl = currentTab.url;
    document.getElementById("currentWebsite").innerText = "Current website: " + currentUrl;
});

document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var successMessage = document.getElementById("userSuccessMessage");
    var reminderDate = document.getElementById("datePicker");
    var reminderTime = document.getElementById("timePicker"); // Get reference to time picker
  
    submitBtn.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;

            var formattedReminderDate = reminderDate.value;
            var formattedReminderTime = reminderTime.value; // Get the value of the time picker

            // Combine date and time into a single string
            var formattedReminderDateTime = formattedReminderDate + ' ' + formattedReminderTime;
  
            chrome.bookmarks.search({ title: "Bookmark Reminder Extension" }, function (results) {
                if (results.length > 0) {
                    var existingFolder = results[0];
                    chrome.bookmarks.create({
                        parentId: existingFolder.id,
                        title: currentTab.title + ' - ' + formattedReminderDateTime, 
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
                            title: currentTab.title + ' - ' + formattedReminderDateTime, 
                            url: currentUrl,
                        }, function (newBookmark) {
                            console.log("Bookmark saved:", newBookmark);
                            successMessage.innerText = "Bookmark saved successfully to: \nFolder - " + newFolder.title + "\nTab - " + currentTab.title;
                        });
                    });
                }
            });

            var notificationOptions = {
                type: 'basic',
                iconUrl: 'assets/hello.png', 
                title: 'Reminder',
                message: 'Time to visit the bookmarked website!'
            };
            chrome.notifications.create('reminderNotification', notificationOptions);
            
            var reminderTimestamp = new Date(formattedReminderDateTime).getTime(); 
            var now = Date.now(); 
            var delay = reminderTimestamp - now; 
           
        });

            chrome.runtime.sendMessage({ action: 'create_notification' });
          
    });
});



document.addEventListener('DOMContentLoaded', function() {
    var notifButton = document.getElementById('click');
    
    notifButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'create_notification' });
    });
  });