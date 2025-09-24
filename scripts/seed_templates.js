// scripts/seed_templates.js
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
  const dataset = JSON.parse(fs.readFileSync('./dataset/sunda_dataset.json', 'utf8'));
  const templates = dataset.templates || [];

  for (const t of templates) {
    const { data, error } = await supabase
      .from('templates')
      .insert([{ name: t.label, category: t.media, prompt: t.prompt }])
      .select();

    if (error) {
      console.error('Insert error', error);
    } else {
      console.log('✅ Inserted:', data[0].name);
    }
  }
}

seed().catch(console.error);
