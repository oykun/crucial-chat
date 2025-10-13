const { OpenAI } = require('openai');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test API with minimal request
    const testResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1,
    });

    return res.status(200).json({ 
      status: 'healthy', 
      message: 'AI service is active - ask questions!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(200).json({ 
      status: 'unhealthy', 
      message: 'AI service is down - email hello@oykun.com instead',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
