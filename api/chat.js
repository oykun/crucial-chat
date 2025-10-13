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

    const lowerMessage = message.toLowerCase();
    let response = '';

    // Smart responses based on keywords in the question
    if (lowerMessage.includes('availability') || lowerMessage.includes('available') || lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
      response = `Great question! We currently have availability for new projects starting in late October. Our typical timeline is:
      
• Brand identity projects: 2-3 weeks
• Website design: 3-4 weeks  
• Complete rebrand: 6-8 weeks

We're booking consultations for next week. Would you like to schedule a 30-minute discovery call to discuss your project timeline and requirements?`;
    }
    else if (lowerMessage.includes('team') || lowerMessage.includes('who') || lowerMessage.includes('people') || lowerMessage.includes('staff')) {
      response = `Meet our core team:

🎨 **Oykun (Creative Director)** - 8+ years in brand strategy and visual identity. Previously worked with startups and Fortune 500 companies.

💻 **Lead Developer** - Full-stack specialist with expertise in modern web technologies and performance optimization.

📱 **UX/UI Designer** - User-centered design expert who ensures every interaction feels intuitive and delightful.

We're a tight-knit team of 4 designers and developers who collaborate closely on every project. No outsourcing, no junior designers - just experienced professionals who care about quality.`;
    }
    else if (lowerMessage.includes('services') || lowerMessage.includes('what do you') || lowerMessage.includes('offer')) {
      response = `We offer comprehensive design services including: Brand identity and logo design, Website design and development, User experience (UX) design, Print design and marketing materials, Social media graphics, and Business stationery. We work with businesses of all sizes to create memorable brand experiences.`;
    }
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('how much')) {
      response = `Our pricing varies based on project scope and requirements. We offer packages for small businesses starting at $2,500 and custom solutions for larger projects. Every project includes a detailed proposal with transparent pricing. Would you like to discuss your specific needs for a tailored quote?`;
    }
    else if (lowerMessage.includes('contact') || lowerMessage.includes('get in touch') || lowerMessage.includes('reach')) {
      response = `You can reach us at hello@oykun.com or through our website contact form. We typically respond within 24 hours and are happy to schedule a free consultation to discuss your project needs.`;
    }
    else if (lowerMessage.includes('portfolio') || lowerMessage.includes('work') || lowerMessage.includes('examples') || lowerMessage.includes('show me')) {
      response = `We'd be happy to show you our portfolio! You can view our recent work at oykun.com/portfolio. We've worked with clients across various industries, from startups to established businesses, creating everything from complete brand identities to website redesigns.`;
    }
    else if (lowerMessage.includes('process') || lowerMessage.includes('how do you work') || lowerMessage.includes('workflow')) {
      response = `Our design process typically includes: 1) Discovery call to understand your needs, 2) Research and strategy development, 3) Concept creation and presentation, 4) Refinement based on your feedback, 5) Final delivery and brand guidelines. We keep you involved throughout the process with regular check-ins and revisions.`;
    }
    else if (lowerMessage.includes('experience') || lowerMessage.includes('years') || lowerMessage.includes('background')) {
      response = `Our team has over 10 years of experience in the design industry. We've worked with businesses ranging from local startups to international brands, helping them establish strong visual identities and effective digital presence. Our experience spans multiple industries including technology, healthcare, retail, and professional services.`;
    }
    else {
      response = `That's a great question! We're a creative design agency specializing in brand identity, web design, and user experience. Our team has over 10 years of experience helping businesses create memorable brand experiences. Could you tell me more about what specific aspect you'd like to know about? I'm here to help with information about our services, process, availability, or anything else!`;
    }

    res.status(200).json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
