export default async function handler(req, res) {
  const { method, body, headers } = req;
  
  if (method === 'POST' && req.url.startsWith('/api/ai/proxy')) {
    const { endpoint, apiKey, proxyBody } = body;
    
    if (!endpoint || !apiKey) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    try {
      const url = new URL(endpoint);
      const requestHeaders = {
        'Content-Type': 'application/json'
      };
      
      if (endpoint.includes('gemini.googleapis.com') || endpoint.includes('generativelanguage.googleapis.com')) {
        const searchParams = new URLSearchParams(url.search);
        searchParams.set('key', apiKey);
        url.search = searchParams.toString();
      } else {
        requestHeaders['Authorization'] = 'Bearer ' + apiKey;
      }
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(proxyBody),
        redirect: 'follow'
      });
      
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
          responseHeaders[key] = value;
        }
      });
      
      res.status(response.status);
      Object.keys(responseHeaders).forEach(key => {
        res.setHeader(key, responseHeaders[key]);
      });
      
      const reader = response.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      
      res.end();
      
    } catch (err) {
      res.status(500).json({ error: '代理请求失败: ' + err.message });
    }
  } else if (method === 'GET' && req.url === '/api/health') {
    res.json({ status: 'ok', time: new Date().toISOString() });
  } else {
    res.status(404).json({ error: '未找到该接口' });
  }
}
