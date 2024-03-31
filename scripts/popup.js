document.addEventListener("DOMContentLoaded", function () {
    var submitBtn = document.getElementById("submitBtn");
    var reminderDate = document.getElementById("datePicker");
    var reminderTime = document.getElementById("timePicker");
    var reminderNote = document.getElementById("customMessage");

    submitBtn.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            action: "saveBookmark",
            data: {
                formattedReminderDate: reminderDate.value,
                formattedReminderTime: reminderTime.value,
                note: reminderNote.value
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
    document.getElementById('userSuccessMessageContainer').style.display = 'block';
    document.getElementById('userSuccessMessage').textContent = message;
}

document.getElementById("datePicker").addEventListener("change", function() {
    var submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = !this.checkValidity(); // Disable the button if date input is invalid
  });
