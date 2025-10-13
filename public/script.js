const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing';
    typingDiv.id = 'typing';
    typingDiv.textContent = 'AI is thinking...';
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTyping() {
    const typingDiv = document.getElementById('typing');
    if (typingDiv) {
        typingDiv.remove();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    chatContainer.appendChild(errorDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    messageInput.value = '';
    
    // Disable input while processing
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        hideTyping();

        if (response.ok) {
            addMessage(data.response);
        } else {
            showError(data.error || 'Sorry, something went wrong. Please try again.');
        }
    } catch (error) {
        hideTyping();
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    }

    // Re-enable input
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

function sendSampleQuestion(question) {
    // Hide the sample questions after one is clicked
    const sampleQuestions = document.querySelector('.sample-questions');
    if (sampleQuestions) {
        sampleQuestions.style.display = 'none';
    }
    
    // Set the input value and send the message
    messageInput.value = question;
    sendMessage();
}

// Health check function
async function checkHealth() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            statusDot.className = 'status-dot healthy';
            statusText.textContent = 'Service is active. Ask questions!';
        } else {
            statusDot.className = 'status-dot unhealthy';
            statusText.textContent = 'Services down. Email me instead';
        }
    } catch (error) {
        statusDot.className = 'status-dot unhealthy';
        statusText.textContent = 'Services down. Email me instead';
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Check health on page load
checkHealth();

// Check health every 30 seconds
setInterval(checkHealth, 30000);

// Focus input on load
messageInput.focus();
