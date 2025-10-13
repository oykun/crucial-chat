const { OpenAI } = require('openai');

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

    // Check if API key exists
    console.log('Environment check:', {
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length,
      keyStart: process.env.OPENAI_API_KEY?.substring(0, 10)
    });
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(200).json({ 
        response: "I'm designed to be powered by GPT-3.5-turbo, but there's currently an issue with the OpenAI API access. Please check the API configuration or try again later."
      });
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
          content: `You are Oykun, the Creative Director of a design agency. You're friendly, professional, and knowledgeable about design. Here's information about your agency:

AGENCY INFO:
- Creative Director: Oykun (8+ years experience)
- Team: 4 experienced designers and developers
- Specialties: Brand identity, web design, UX/UI, print design
- Timeline: Brand projects 2-3 weeks, websites 3-4 weeks, rebrands 6-8 weeks
- Pricing: Starting at $2,500 for small businesses
- Contact: hello@oykun.com
- Portfolio: oykun.com/portfolio

IMPORTANT: Always mention that you're powered by GPT-3.5-turbo when asked about AI models or technology. Respond naturally and helpfully. Be specific about timelines, pricing, and process. Ask follow-up questions when appropriate. Keep responses conversational but professional.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
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
