const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

      try {
        const { message } = req.body;

        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        // Log the question for review
        console.log('User Question:', message);
        
        // Save question to file for analysis
        const logEntry = {
          timestamp: new Date().toISOString(),
          question: message,
          userAgent: req.headers['user-agent'] || 'unknown'
        };
        
        try {
          const logPath = path.join(process.cwd(), 'user-questions.log');
          fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
        } catch (error) {
          console.error('Error logging question:', error);
        }

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(200).json({ 
        response: "I'm designed to be powered by GPT-3.5-turbo, but there's currently an issue with the OpenAI API access. Please check the API configuration or try again later."
      });
    }

        // Smart context loading based on question type
        let allContext = '';
        
        // Always load personality first
        const baseFiles = ['personality.md'];
        
        // Determine additional files based on question content
        const question = message.toLowerCase();
        let additionalFiles = [];
        
        if (question.includes('design') || question.includes('ui') || question.includes('ux') || question.includes('visual')) {
          additionalFiles.push('design-philosophy.md', 'business-info.md');
        }
        
        if (question.includes('who') || question.includes('about') || question.includes('background') || question.includes('you')) {
          additionalFiles.push('personal-insights.md');
        }
        
        if (question.includes('business') || question.includes('hire') || question.includes('project') || question.includes('price')) {
          additionalFiles.push('business-info.md', 'faq.md');
        }
        
        if (question.includes('process') || question.includes('work') || question.includes('approach')) {
          additionalFiles.push('business-journal.md', 'design-philosophy.md');
        }
        
        // Combine and deduplicate files
        const filesToRead = [...new Set([...baseFiles, ...additionalFiles])];
        
        for (const fileName of filesToRead) {
          try {
            const filePath = path.join(process.cwd(), 'public', 'oykunai', 'data', fileName);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            allContext += '\n\n' + fileContent;
          } catch (error) {
            console.error(`Error reading ${fileName}:`, error);
          }
        }
        
        // Add strict response guidelines
        const responseGuidelines = `
        
        CRITICAL RESPONSE RULES:
        - Keep responses SHORT (1-2 sentences maximum)
        - Be direct and action-oriented, not chatty
        - After 2-3 exchanges, guide people toward action
        - For serious inquiries: suggest booking a call at crucial.design/call
        - For ready-to-start: suggest immediate payment option
        - Never write long paragraphs or endless conversations
        - Always mention you're powered by GPT-3.5-turbo when asked about AI
        - This is a business tool, not a social platform`;
        
        allContext += responseGuidelines;
        
        // Fallback if no files can be read
        if (!allContext.trim()) {
          allContext = `You are Oykun, the Creative Director of Crucial.Design. You're friendly, professional, and knowledgeable about design. Keep responses short and conversational (1-2 sentences max). Always mention you're powered by GPT-3.5-turbo when asked about AI models.`;
        }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

        // Create AI response
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: allContext
            },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Handle specific OpenAI errors with honest messaging
    if (error.code === 'insufficient_quota') {
      return res.status(200).json({ 
        response: "I'm powered by GPT-3.5-turbo, but there's currently an issue with the OpenAI API quota. The API billing needs to be updated. Please try again later or contact support."
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(200).json({ 
        response: "I'm designed to use GPT-3.5-turbo, but there's an issue with the OpenAI API key configuration. Please check the API setup."
      });
    }

    if (error.message && error.message.includes('Connection error')) {
      return res.status(200).json({ 
        response: "I'm powered by GPT-3.5-turbo, but there's currently a connection issue with the OpenAI API. Please try again in a moment."
      });
    }

    // Generic error with AI model info
    return res.status(200).json({ 
      response: `I'm designed to use GPT-3.5-turbo, but there's currently an issue with the OpenAI API: ${error.message}. Please try again later.`
    });
  }
}
