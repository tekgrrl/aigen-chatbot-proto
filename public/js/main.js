document.addEventListener("DOMContentLoaded", function() {
    const newChatButton = document.getElementById("new-chat-button");

    if (newChatButton) {
        newChatButton.addEventListener("click", function() {
            // Clear current chat inputs and outputs
            const chatInput = document.getElementById("chat-input");
            const chatOutput = document.getElementById("chat-output");
            if (chatInput && chatOutput) {
                chatInput.value = ""; // Clear the chat input field
                chatOutput.innerHTML = ""; // Clear the chat output area
            } else {
                console.error("Chat input or output elements not found.");
            }

            // Log the action
            console.log("New chat session started.");
        });
    } else {
        console.error("New Chat button not found.");
    }
});