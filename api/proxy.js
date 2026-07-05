export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url: targetUrl, headers: customHeaders, body: requestBody } = req.body;

  if (!targetUrl || !requestBody) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
      redirect: 'follow'
    });

    res.status(response.status);
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();

  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed: ' + error.message });
  }
}
