const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Simple markdown parser for basic formatting
function parseMarkdown(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convert bullet points (- item) to lists
    text = text.replace(/^- (.+)$/gm, '• $1');
    
    // Convert links [text](url) to <a>
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    return text;
}

function addMessage(content, isUser = false, showAvatar = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    // Add avatar for bot messages only when explicitly requested
    if (!isUser && showAvatar) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = 'oykunai.png';
        avatarImg.alt = 'Oykun';
        avatarImg.className = 'avatar-image';
        
        avatarDiv.appendChild(avatarImg);
        messageDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Parse markdown for bot messages, plain text for user
    if (!isUser) {
        contentDiv.innerHTML = parseMarkdown(content);
    } else {
        contentDiv.textContent = content;
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'thinking-message';
    typingDiv.id = 'typing';
    typingDiv.textContent = 'Thinking...';
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

// Sample responses for UI testing
const sampleResponses = [
    "Hey! I'm Oykun, Creative Director of Crucial.Design. I've been doing this for 25+ years and love helping AI founders build great products. What's your project about?",
    "My design process is pretty straightforward - we chat, I get to work, you see first designs in 24-48 hours. I use Figma for design, Framer for sites. What do you need designed?",
    "I work directly with founders, no juniors. $4,950/month for ongoing work, $7,950 for shorter projects. Ready to move fast? We can start today.",
    "I specialize in AI product design, brand identity, web design, UX/UI, Framer builds, and pitch decks. Been helping generate over $1B in outcomes. Want to book a quick call to discuss?",
    "Sure thing! I focus on design that actually works - no BS, just results. I'm passionate about helping founders move fast and build products people love. What's your timeline like?"
];

function getRandomResponse() {
    return sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Hide sample questions on first user message
    const sampleQuestions = document.querySelector('.sample-questions');
    if (sampleQuestions) {
        sampleQuestions.style.display = 'none';
    }

    // Add user message
    addMessage(message, true);
    messageInput.value = '';

    // Disable input while processing
    messageInput.disabled = true;
    sendButton.disabled = true;

    showTyping();

    try {
        const response = await fetch('../api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        hideTyping();

        if (response.ok) {
            addMessage(data.response, false, true); // Show avatar for bot responses
        } else if (response.status === 429) {
            // Rate limit exceeded
            const resetTime = new Date(data.resetTime);
            const timeUntilReset = Math.ceil((resetTime - Date.now()) / 1000 / 60); // minutes
            showError(`Rate limit reached. Please wait ${timeUntilReset} minutes before sending another message.`);
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
        const response = await fetch('../api/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            statusDot.className = 'status-dot healthy';
            statusText.textContent = 'Service is active. Ask questions!';
        } else {
            statusDot.className = 'status-dot unhealthy';
            statusText.innerHTML = 'Services down. <a href="mailto:hello@oykun.com" style="color: inherit; text-decoration: underline;">Email me instead</a>';
        }
    } catch (error) {
        statusDot.className = 'status-dot unhealthy';
        statusText.innerHTML = 'Services down. <a href="mailto:hello@oykun.com" style="color: inherit; text-decoration: underline;">Email me instead</a>';
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Update send button state
function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    if (hasText) {
        sendButton.classList.add('enabled');
        sendButton.disabled = false;
    } else {
        sendButton.classList.remove('enabled');
        sendButton.disabled = true;
    }
}

messageInput.addEventListener('input', () => {
    autoResize(messageInput);
    updateSendButton();
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            // Shift+Enter: Allow new line (default behavior)
            return;
        } else {
            // Enter: Send message
            e.preventDefault();
            sendMessage();
        }
    }
});

// Check health on page load
checkHealth();

// Check health every 30 seconds
setInterval(checkHealth, 30000);

// Initialize button state
updateSendButton();

// Intro messages
const introMessages = [
    "Hey, it's OykunAI",
    "I'm trained on Oykun's design work, philosophy, and experiments.",
    "Ask me about his agency <a href='https://crucial.design' target='_blank'>Crucial.Design</a>, how he works with founders, or lessons from 25 years of design.",
    "Let's talk design, AI, and building things that matter."
];

// Load intro messages with delay
function loadIntroMessages() {
    introMessages.forEach((message, index) => {
        setTimeout(() => {
            addMessage(message, false, index === 0); // Only show avatar on first message
        }, index * 1000); // 1 second delay between each message
    });
}

// Load intro messages
loadIntroMessages();

// Focus input on load
messageInput.focus();
