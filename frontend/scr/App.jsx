
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PromptTemplates from './PromptTemplates.jsx';

export default function App() {
  const [input, setInput] = useState('');
  const [promptPkg, setPromptPkg] = useState(null);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(()=>{ fetchTemplates() },[]);

  async function fetchTemplates(){
    try{
      const res = await fetch('/api/admin_templates');
      if(res.ok){ const j = await res.json(); setTemplates(j.templates || []); }
    }catch(e){ console.warn(e) }
  }

  function applyTemplate(t){
    setInput(t.prompt);
    buildPrompt(t.prompt, t.media);
  }

  function buildPrompt(txt, mediaOverride){
    const prompt = txt + ' — ground in Sundanese cultural context.';
    const intent = (mediaOverride==='video' || txt.toLowerCase().includes('video'))? 'GENERATE_VIDEO' : (mediaOverride==='audio'?'GENERATE_AUDIO':'GENERATE_IMAGE');
    const meta = { seed: Math.floor(Math.random()*2**30), guidance_scale:7.5, num_inference_steps:28, resolution:'1024x1024' };
    setPromptPkg({ prompt, negative_prompt:'lowres, watermark', meta, intent });
  }

  async function generate(){
    if(!promptPkg) return alert('Analyze first');
    setResult(null);
    try{
      const res = await axios.post('/api/generate', promptPkg);
      setResult(res.data);
    }catch(e){ alert('Generate error: '+(e.response?.data?.error||e.message)) }
  }

  return (
    <div style={{fontFamily:'Arial',maxWidth:1000,margin:'20px auto'}}>
      <h1>Sunda Immersive — Prototype (v4)</h1>
      <div style={{display:'flex',gap:16}}>
        <div style={{flex:2}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={6} style={{width:'100%'}} placeholder='Tuliskan instruksi atau pilih template' />
          <div style={{marginTop:8}}>
            <button onClick={()=>buildPrompt(input)}>Analyze</button>
            <button onClick={generate} style={{marginLeft:8}}>Generate</button>
          </div>
          <pre style={{background:'#f7f7f7',padding:12,marginTop:12}}>{promptPkg?JSON.stringify(promptPkg,null,2):'No prompt'}</pre>
          <pre style={{background:'#fffef0',padding:12,marginTop:12}}>{result?JSON.stringify(result,null,2):'No result yet'}</pre>
        </div>
        <div style={{flex:1}}>
          <PromptTemplates templates={templates} onApply={applyTemplate} />
          <div style={{marginTop:12}}><a href="/admin" target="_blank" rel="noreferrer">Open Admin Panel</a></div>
        </div>
      </div>
    </div>
  );
}
