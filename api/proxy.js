export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { url: targetUrl, headers: customHeaders, body: requestBody } = await req.json();

  if (!targetUrl || !requestBody) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
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

    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy request failed: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
