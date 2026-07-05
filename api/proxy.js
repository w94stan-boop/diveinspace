export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST方法' });
  }

  const { endpoint, apiKey, body } = req.body;
  
  if (!endpoint || !apiKey || !body) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    const url = new URL(endpoint);
    const headers = {
      'Content-Type': 'application/json'
    };

    if (endpoint.includes('gemini.googleapis.com') || endpoint.includes('generativelanguage.googleapis.com')) {
      const params = new URLSearchParams(url.search);
      params.set('key', apiKey);
      url.search = params.toString();
    } else {
      headers['Authorization'] = 'Bearer ' + apiKey;
    }

    const apiResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    res.status(apiResponse.status);
    
    apiResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    const reader = apiResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();

  } catch (error) {
    res.status(500).json({ error: '代理请求失败: ' + error.message });
  }
}
