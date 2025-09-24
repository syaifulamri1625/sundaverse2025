
/**
 * api/generate.js
 * Example serverless function to call OpenAI Images/Chat APIs and fallback to Hugging Face.
 * Requires OPENAI_API_KEY and/or HF_TOKEN in environment.
 */
const fetch = require('node-fetch');

async function callOpenAIImage(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('missing OPENAI_API_KEY');
  const url = 'https://api.openai.com/v1/images/generations';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ prompt, n: 1, size: '1024x1024' })
  });
  if (!resp.ok) {
    const txt = await resp.text(); throw new Error('OpenAI image error: '+txt);
  }
  return await resp.json();
}

async function callOpenAIChat(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('missing OPENAI_API_KEY');
  const url = 'https://api.openai.com/v1/chat/completions';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are a storytelling assistant grounded in Sundanese culture.' }, { role: 'user', content: prompt }],
      max_tokens: 800
    })
  });
  if (!resp.ok) { const txt = await resp.text(); throw new Error('OpenAI chat error: '+txt); }
  return await resp.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, meta, intent } = req.body || {};
    // basic safety
    const BANNED = ['child','illegal'];
    for (const b of BANNED) if ((prompt||'').toLowerCase().includes(b)) return res.status(400).json({ error: 'safety_violation', detail: b });

    if (intent === 'GENERATE_TEXT') {
      try {
        const chat = await callOpenAIChat(prompt);
        return res.status(200).json({ ok:true, provider:'openai', result: chat });
      } catch (e) {
        console.warn('OpenAI chat failed:', e.message);
      }
    } else {
      try {
        const img = await callOpenAIImage(prompt);
        return res.status(200).json({ ok:true, provider:'openai', result: img });
      } catch (e) {
        console.warn('OpenAI image failed:', e.message);
      }
    }

    // fallback to Hugging Face inference
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) return res.status(500).json({ error: 'no_providers_available' });
    const model = 'stabilityai/stable-diffusion-2';
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const payload = { inputs: prompt, parameters: { guidance_scale: meta?.guidance_scale || 7.5, num_inference_steps: meta?.num_inference_steps || 28 } };
    const hfRes = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!hfRes.ok) {
      const txt = await hfRes.text();
      return res.status(502).json({ error: 'hf_inference_failed', detail: txt });
    }
    const contentType = hfRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await hfRes.json();
      return res.status(200).json({ ok:true, provider:'huggingface', result: json });
    } else {
      const arrayBuffer = await hfRes.arrayBuffer();
      const b64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:image/png;base64,${b64}`;
      return res.status(200).json({ ok:true, provider:'huggingface', artifact: dataUri });
    }
  } catch (err) {
    console.error('generate error', err);
    return res.status(500).json({ error: 'internal_error', detail: err.message });
  }
};
