const fs = require('fs');
const path = require('path');

// In-memory storage for rate limiting (in production, use Redis)
const userSessions = new Map();
const dailyUsage = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
    // Per session limits
    messagesPerMinute: 5,
    messagesPerHour: 20,
    messagesPerDay: 50,
    
    // Global limits
    maxDailyRequests: 1000,
    
    // Content filtering
    minMessageLength: 3,
    maxMessageLength: 500,
    maxConsecutiveSimilar: 3
};

// Clean up old sessions (run every hour)
setInterval(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const [sessionId, data] of userSessions.entries()) {
        if (now - data.firstSeen > oneDay) {
            userSessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000);

function getSessionId(req) {
    // Use IP + User-Agent for session identification
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 20)}`;
}

function checkRateLimit(sessionId) {
    const now = Date.now();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    // Initialize session if doesn't exist
    if (!userSessions.has(sessionId)) {
        userSessions.set(sessionId, {
            firstSeen: now,
            requests: [],
            lastRequest: 0
        });
    }
    
    const session = userSessions.get(sessionId);
    session.requests.push(now);
    
    // Clean old requests
    session.requests = session.requests.filter(time => now - time < day);
    
    // Check rate limits
    const requestsLastMinute = session.requests.filter(time => now - time < minute).length;
    const requestsLastHour = session.requests.filter(time => now - time < hour).length;
    const requestsToday = session.requests.length;
    
    // Check daily global limit
    const today = new Date().toISOString().split('T')[0];
    const todayRequests = dailyUsage.get(today) || 0;
    
    if (todayRequests >= RATE_LIMITS.maxDailyRequests) {
        return {
            allowed: false,
            reason: 'Daily service limit reached. Please try again tomorrow.',
            resetTime: new Date().setHours(24, 0, 0, 0) // Next midnight
        };
    }
    
    if (requestsLastMinute >= RATE_LIMITS.messagesPerMinute) {
        return {
            allowed: false,
            reason: 'Too many messages. Please wait a moment.',
            resetTime: now + minute
        };
    }
    
    if (requestsLastHour >= RATE_LIMITS.messagesPerHour) {
        return {
            allowed: false,
            reason: 'Hourly limit reached. Please wait before sending more messages.',
            resetTime: now + hour
        };
    }
    
    if (requestsToday >= RATE_LIMITS.messagesPerDay) {
        return {
            allowed: false,
            reason: 'Daily limit reached. Please try again tomorrow.',
            resetTime: new Date().setHours(24, 0, 0, 0)
        };
    }
    
    // Update daily counter
    dailyUsage.set(today, todayRequests + 1);
    
    session.lastRequest = now;
    
    return {
        allowed: true,
        remaining: {
            minute: RATE_LIMITS.messagesPerMinute - requestsLastMinute,
            hour: RATE_LIMITS.messagesPerHour - requestsLastHour,
            day: RATE_LIMITS.messagesPerDay - requestsToday
        }
    };
}

function validateMessage(message) {
    // Check message length
    if (message.length < RATE_LIMITS.minMessageLength) {
        return {
            valid: false,
            reason: 'Message too short. Please ask a meaningful question.'
        };
    }
    
    if (message.length > RATE_LIMITS.maxMessageLength) {
        return {
            valid: false,
            reason: 'Message too long. Please keep it under 500 characters.'
        };
    }
    
    // Basic spam detection
    const spamPatterns = [
        /(.)\1{4,}/g, // Repeated characters (aaaaa)
        /(test|testing|hello|hi|hey)\s*(test|testing|hello|hi|hey)/gi, // Repeated simple words
        /^[^a-zA-Z]*$/, // No letters
        /\b(spam|bot|test)\b.*\b(spam|bot|test)\b/gi // Multiple spam keywords
    ];
    
    for (const pattern of spamPatterns) {
        if (pattern.test(message)) {
            return {
                valid: false,
                reason: 'Please ask a meaningful question about Oykun\'s work or design.'
            };
        }
    }
    
    // Check for too many special characters
    const specialCharCount = (message.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > message.length * 0.5) {
        return {
            valid: false,
            reason: 'Please ask a clear question with mostly letters and words.'
        };
    }
    
    return { valid: true };
}

function logRequest(sessionId, message, response, error = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId: sessionId.slice(0, 20) + '...', // Truncate for privacy
        messageLength: message.length,
        hasError: !!error,
        responseLength: response ? response.length : 0
    };
    
    try {
        const logPath = path.join(process.cwd(), 'api-usage.log');
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    } catch (err) {
        console.error('Failed to log request:', err);
    }
}

module.exports = {
    checkRateLimit,
    validateMessage,
    logRequest,
    getSessionId,
    RATE_LIMITS
};
