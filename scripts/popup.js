document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var reminderDate = document.getElementById("datePicker");
    var reminderTime = document.getElementById("timePicker");

    submitBtn.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            action: "saveBookmark",
            data: {
                formattedReminderDate: reminderDate.value,
                formattedReminderTime: reminderTime.value
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "successMessage") {
        displaySuccessMessage(message.data);
    }
});

function displaySuccessMessage(message) {
    // var successMessage = document.getElementById("userSuccessMessage");
    // successMessage.innerText = message;
    document.getElementById('userSuccessMessageContainer').style.display = 'block';
    document.getElementById('userSuccessMessage').textContent = message;
}

document.getElementById("creditsBtn").addEventListener("click", function() {
    var creditsContainer = document.getElementById("creditsContainer");
    creditsContainer.style.display = (creditsContainer.style.display === "block") ? "none" : "block";
  });