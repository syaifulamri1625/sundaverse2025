
import React from 'react';
export default function PromptTemplates({templates, onApply}){
  return (<div style={{background:'#fff',padding:10,borderRadius:6}}>
    <h3>Prompt Templates</h3>
    {templates.length===0 ? <div style={{fontSize:13,color:'#666'}}>No templates loaded</div> : null}
    <ul style={{listStyle:'none',padding:0}}>
      {templates.map(t=> (<li key={t.id} style={{marginBottom:8}}>
        <div style={{fontWeight:600}}>{t.name}</div>
        <div style={{fontSize:13,color:'#333',marginBottom:6}}>{t.prompt}</div>
        <button onClick={()=>onApply(t)}>Apply</button>
      </li>))}
    </ul>
  </div>)
}
