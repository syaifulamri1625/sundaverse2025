
/**
 * api/admin_templates.js
 * Server-side CRUD using Supabase service role key.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in env.
 */
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  const method = req.method;
  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ templates: data });
    }
    if (method === 'POST') {
      const body = req.body || {};
      if (!body.name || !body.prompt) return res.status(400).json({ error: 'missing_fields' });
      const { data, error } = await supabase.from('templates').insert([{ name: body.name, category: body.category || 'general', prompt: body.prompt }]).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok:true, template: data[0] });
    }
    if (method === 'DELETE') {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'missing_id' });
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok:true });
    }
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('admin_templates error', err);
    return res.status(500).json({ error: err.message });
  }
};
