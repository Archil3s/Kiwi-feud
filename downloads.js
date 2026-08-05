(()=>{
  function downloadFile(name,type,text){
    const blob=new Blob([text],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function exportRows(){
    const rows=[];
    (window.KIWI_FEUD_BANK||[]).forEach((item,qi)=>item.a.forEach((ans,ai)=>rows.push({
      number:qi+1,category:item.c,question:item.q,rank:ai+1,answer:ans[0],points:ans[1],aliases:Array.isArray(ans[2])?ans[2].join('; '):''
    })));
    return rows;
  }
  function downloadCSV(){
    const rows=exportRows();
    const head=['Question Number','Category','Question','Rank','Answer','Points','Accepted Synonyms'];
    const csv='\uFEFF'+[head.map(csvCell).join(','),...rows.map(r=>[r.number,r.category,r.question,r.rank,r.answer,r.points,r.aliases].map(csvCell).join(','))].join('\r\n');
    downloadFile('kiwi-feud-question-bank.csv','text/csv;charset=utf-8',csv);
  }
  function downloadJSON(){
    const pack={
      title:'Kiwi Pub Night Feud Question Bank',
      exported:new Date().toISOString(),
      mainQuestions:window.KIWI_FEUD_BANK||[],
      fastMoney:window.KIWI_FAST_MONEY||[],
      tieBreakers:window.KIWI_TIE_BREAKERS||[]
    };
    downloadFile('kiwi-feud-question-bank.json','application/json;charset=utf-8',JSON.stringify(pack,null,2));
  }
  function printQuestionBook(){
    const bank=window.KIWI_FEUD_BANK||[];
    const groups=new Map();
    bank.forEach((x,i)=>{if(!groups.has(x.c))groups.set(x.c,[]);groups.get(x.c).push({x,i})});
    const sections=[...groups].map(([cat,items])=>`<section><h2>${esc(cat)}</h2>${items.map(({x,i})=>`<article><h3>${i+1}. ${esc(x.q)}</h3><table><thead><tr><th>Rank</th><th>Answer</th><th>Points</th><th>Accepted Synonyms</th></tr></thead><tbody>${x.a.map((a,n)=>`<tr><td>${n+1}</td><td>${esc(a[0])}</td><td>${a[1]}</td><td>${esc(Array.isArray(a[2])?a[2].join(', '):'')}</td></tr>`).join('')}</tbody></table></article>`).join('')}</section>`).join('');
    const w=window.open('','kiwiFeudPrint');
    if(!w)return alert('Please allow pop-ups to create the printable question book.');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Kiwi Feud Question Book</title><style>body{font-family:Arial,sans-serif;color:#17212b;margin:30px;line-height:1.35}h1{text-align:center}h2{background:#123f66;color:white;padding:10px;break-before:page}article{margin:0 0 24px;break-inside:avoid}h3{margin-bottom:8px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:7px;text-align:left;vertical-align:top}th:nth-child(1),td:nth-child(1),th:nth-child(3),td:nth-child(3){text-align:center;width:70px}@media print{button{display:none}body{margin:12mm}}</style></head><body><button onclick="print()">Print / Save as PDF</button><h1>Kiwi Pub Night Feud — Questions & Answers</h1><p>${bank.length} main questions. Point values are game estimates.</p>${sections}</body></html>`);
    w.document.close();w.focus();
  }
  function buildPanel(){
    if(!document.title.includes('Host')||document.getElementById('questionDownloads'))return;
    const panel=document.createElement('section');
    panel.id='questionDownloads';panel.className='panel';
    panel.innerHTML='<div><strong>⬇ Download Question Bank</strong><div style="font-size:11px;color:#b6ccda;text-align:center;margin-top:4px">Exports every question and ranked answer currently loaded in the game.</div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><button class="btn green" id="downloadCsv">CSV</button><button class="btn" id="downloadJson">JSON</button><button class="btn gold" id="printBook">Print / Save PDF</button></div>';
    document.querySelector('main')?.appendChild(panel);
    panel.querySelector('#downloadCsv').onclick=downloadCSV;
    panel.querySelector('#downloadJson').onclick=downloadJSON;
    panel.querySelector('#printBook').onclick=printQuestionBook;
  }
  window.KiwiDownloads={downloadCSV,downloadJSON,printQuestionBook};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildPanel);else buildPanel();
})();