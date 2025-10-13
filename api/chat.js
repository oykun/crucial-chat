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
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      // Fallback response when no API key
      const lowerMessage = message.toLowerCase();
      let response = '';
      
      if (lowerMessage.includes('availability') || lowerMessage.includes('available')) {
        response = `Great question! We currently have availability for new projects starting in late October. Our typical timeline is:
        
• Brand identity projects: 2-3 weeks
• Website design: 3-4 weeks  
• Complete rebrand: 6-8 weeks

We're booking consultations for next week. Would you like to schedule a 30-minute discovery call?`;
      } else if (lowerMessage.includes('team')) {
        response = `Meet our core team:

🎨 **Oykun (Creative Director)** - 8+ years in brand strategy and visual identity. Previously worked with startups and Fortune 500 companies.

💻 **Lead Developer** - Full-stack specialist with expertise in modern web technologies and performance optimization.

📱 **UX/UI Designer** - User-centered design expert who ensures every interaction feels intuitive and delightful.

We're a tight-knit team of 4 designers and developers who collaborate closely on every project.`;
      } else {
        response = `That's a great question! We're a creative design agency specializing in brand identity, web design, and user experience. Our team has over 10 years of experience helping businesses create memorable brand experiences. 

Could you tell me more about what specific aspect you'd like to know about? I'm here to help with information about our services, process, availability, or anything else!`;
      }
      
      return res.status(200).json({ response });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
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
