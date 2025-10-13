const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logPath = path.join(process.cwd(), 'user-questions.log');
    
    // Check if log file exists
    if (!fs.existsSync(logPath)) {
      return res.status(200).json({ 
        questions: [],
        message: 'No questions logged yet'
      });
    }

    // Read and parse the log file
    const logContent = fs.readFileSync(logPath, 'utf8');
    const questions = logContent
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(entry => entry !== null)
      .reverse(); // Most recent first

    res.status(200).json({ 
      questions,
      total: questions.length
    });

  } catch (error) {
    console.error('Error reading questions log:', error);
    res.status(500).json({ error: 'Failed to read questions log' });
  }
}
