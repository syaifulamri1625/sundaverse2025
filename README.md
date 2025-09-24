
Sunda Immersive Prompt Builder — Prototype v4 (Supabase-ready)
=============================================================

This prototype includes:
- Frontend (Vite + React) with:
  - App.jsx (Prompt Reader)
  - PromptTemplates.jsx (template selector)
  - Admin.jsx  (Admin UI connected to Supabase)
- Backend serverless functions (backend/api):
  - generate.js : example using OpenAI (fallback to Hugging Face)
  - admin_templates.js : CRUD via Supabase service key
- dataset/sunda_dataset.json : starter dataset (for reference)
- vercel.json : example mapping for Vercel deployment
- .env.example : environment variable examples

IMPORTANT:
- Create a Supabase project and run the provided SQL to create `templates` table.
- Set environment variables in Vercel/Netlify: OPENAI_API_KEY, HF_TOKEN (optional), SUPABASE_URL, SUPABASE_SERVICE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
- For production, don't expose service keys in client; use server-side functions for writes and secure authentication.

Quick Supabase SQL to create table (run in Supabase SQL editor):
---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
create table templates (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,
  prompt text,
  created_at timestamp default now()
);

