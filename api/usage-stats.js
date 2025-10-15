const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logPath = path.join(process.cwd(), 'api-usage.log');
    
    if (!fs.existsSync(logPath)) {
      return res.status(200).json({ 
        message: 'No usage data available yet',
        stats: {
          totalRequests: 0,
          todayRequests: 0,
          averageResponseLength: 0,
          errorRate: 0
        }
      });
    }

    const logContent = fs.readFileSync(logPath, 'utf8');
    const logs = logContent.split('\n').filter(Boolean).map(JSON.parse);
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.timestamp.startsWith(today));
    
    const stats = {
      totalRequests: logs.length,
      todayRequests: todayLogs.length,
      averageResponseLength: Math.round(
        logs.reduce((sum, log) => sum + log.responseLength, 0) / logs.length || 0
      ),
      errorRate: Math.round(
        (logs.filter(log => log.hasError).length / logs.length) * 100 || 0
      ),
      recentRequests: logs.slice(-10).map(log => ({
        timestamp: log.timestamp,
        messageLength: log.messageLength,
        responseLength: log.responseLength,
        hasError: log.hasError
      }))
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error reading usage stats:', error);
    res.status(500).json({ error: 'Failed to read usage statistics' });
  }
};
