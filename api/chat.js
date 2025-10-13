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

Respond naturally and helpfully. Be specific about timelines, pricing, and process. Ask follow-up questions when appropriate. Keep responses conversational but professional.`
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
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({ error: 'API quota exceeded. Please check your OpenAI billing.' });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'Invalid API key. Please check your OpenAI configuration.' });
    }

    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
