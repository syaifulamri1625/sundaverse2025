
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function Admin() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name:'', category:'', prompt:'' });

  useEffect(()=>{ fetchTemplates() },[]);

  async function fetchTemplates(){
    const { data, error } = await supabase.from('templates').select('*').order('created_at',{ascending:false});
    if (error) console.error(error); else setTemplates(data || []);
  }

  async function addTemplate(){
    const { data, error } = await supabase.from('templates').insert([newTemplate]);
    if (error) console.error(error); else { setNewTemplate({name:'',category:'',prompt:''}); fetchTemplates(); }
  }

  async function deleteTemplate(id){
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) console.error(error); else fetchTemplates();
  }

  return (
    <div style={{fontFamily:'Arial',maxWidth:900,margin:20}}>
      <h1>Admin — Templates (Supabase)</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <h3>Add Template</h3>
          <input placeholder='name' value={newTemplate.name} onChange={e=>setNewTemplate({...newTemplate,name:e.target.value})} /><br/>
          <input placeholder='category' value={newTemplate.category} onChange={e=>setNewTemplate({...newTemplate,category:e.target.value})} /><br/>
          <textarea placeholder='prompt' value={newTemplate.prompt} onChange={e=>setNewTemplate({...newTemplate,prompt:e.target.value})}></textarea><br/>
          <button onClick={addTemplate}>Add Template</button>
        </div>
        <div style={{flex:1}}>
          <h3>Existing Templates</h3>
          <ul>{templates.map(t=>(<li key={t.id}><b>{t.name}</b> ({t.category}) <button onClick={()=>deleteTemplate(t.id)}>Delete</button><div style={{fontSize:13,color:'#333'}}>{t.prompt}</div></li>))}</ul>
        </div>
      </div>
    </div>
  );
}
