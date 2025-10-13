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

    // Simple response for testing
    const response = `Thank you for asking: "${message}". We're a creative design agency specializing in brand identity, web design, and user experience. Our team has over 10 years of experience helping businesses create memorable brand experiences. We'd be happy to discuss your project needs!`;

    res.status(200).json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
