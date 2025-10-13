import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Read agency information from the text file
    const agencyInfoPath = path.join(process.cwd(), 'public', 'agency-info.txt');
    let agencyInfo = '';
    
    try {
      agencyInfo = fs.readFileSync(agencyInfoPath, 'utf8');
    } catch (error) {
      console.error('Error reading agency info:', error);
      // Continue without agency info if file can't be read
    }

    // Create the system prompt with agency information
    const systemPrompt = `You are a helpful AI assistant for a design agency. Here is information about the agency:

${agencyInfo}

Please answer questions about the agency's services, expertise, and approach in a friendly and professional manner. If you don't know something specific about the agency, you can mention that and suggest the person contact the agency directly for more information.

Keep your responses concise but helpful, and always maintain a professional tone that reflects the agency's brand.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
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
