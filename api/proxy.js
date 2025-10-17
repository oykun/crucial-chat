// Simple proxy endpoint to fetch and serve web content
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Fetch the content from the target URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch content' });
    }
    
    const content = await response.text();
    
    // Modify the content to work within our iframe
    const modifiedContent = content
      // Remove X-Frame-Options headers by modifying meta tags
      .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
      // Remove Content-Security-Policy that might block iframe
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
      // Add base tag to ensure relative URLs work
      .replace(/<head>/i, '<head><base href="' + url + '">')
      // Remove any scripts that might redirect away from iframe
      .replace(/<script[^>]*>[\s\S]*?window\.top[\s\S]*?<\/script>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?parent\.location[\s\S]*?<\/script>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?top\.location[\s\S]*?<\/script>/gi, '');
    
    // Set headers to allow iframe embedding
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    
    res.status(200).send(modifiedContent);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    // Return a user-friendly error page instead of JSON
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unable to Load Site</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
            color: #333;
          }
          .error-container {
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #d32f2f;
          }
          .error-message {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
            line-height: 1.5;
          }
          .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            display: inline-block;
          }
          .btn-primary {
            background: #1976d2;
            color: white;
          }
          .btn-secondary {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">🌐</div>
          <div class="error-title">Unable to Load Site</div>
          <div class="error-message">
            This website couldn't be loaded through the proxy service. 
            This might be due to network issues, site restrictions, or server limitations.
          </div>
          <div class="error-actions">
            <button class="btn btn-primary" onclick="window.parent.postMessage('openExternal', '*')">Open in New Window</button>
            <button class="btn btn-secondary" onclick="window.parent.postMessage('goHome', '*')">Back to Favorites</button>
          </div>
        </div>
        <script>
          // Listen for parent window messages
          window.addEventListener('message', function(event) {
            if (event.data === 'openExternal') {
              window.open('${url}', '_blank');
            } else if (event.data === 'goHome') {
              // This will be handled by the parent window
            }
          });
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(errorHtml);
  }
}
