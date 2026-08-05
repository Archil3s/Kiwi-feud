(()=>{
  if(!document.title.includes('Host')) return;

  const css=document.createElement('style');
  css.textContent=`
    .question-points-target{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      padding:9px 12px;
      background:#0d3455;
      color:#d9e8f2;
      border-top:1px solid #ffffff1a;
      border-bottom:1px solid #ffffff1a;
      font-size:13px;
      font-weight:800;
      text-align:center;
      line-height:1.2;
    }
    .question-points-target strong{
      color:#ffd24b;
      font-size:15px;
      overflow-wrap:anywhere;
    }
    .question-points-target.steal{
      background:#4a260d;
      border-color:#ffd24b55;
    }
    .question-points-target.complete{
      background:#174f38;
    }
    @media(max-width:620px){
      .question-points-target{padding:7px 8px;font-size:11px;gap:5px}
      .question-points-target strong{font-size:13px}
    }
  `;
  document.head.appendChild(css);

  function install(){
    const card=document.querySelector('.host-question-card, .card');
    const question=card?.querySelector('.question');
    if(!card||!question) return false;
    if(card.querySelector('.question-points-target')) return true;

    const strip=document.createElement('div');
    strip.className='question-points-target';
    strip.id='questionPointsTarget';
    strip.innerHTML='<span>Points will go to:</span><strong>Waiting for round control</strong>';
    question.insertAdjacentElement('afterend',strip);
    return true;
  }

  function name(s,i){return s.teams?.[i]?.name||`Team ${Number(i)+1}`}
  function render(s){
    if(!install()) return;
    const strip=document.getElementById('questionPointsTarget');
    if(!strip) return;
    const has=s.questionIndex>=0;
    const phase=s.roundAwarded?'complete':(s.phase||(has?'faceoff':'setup'));
    strip.classList.toggle('steal',phase==='steal');
    strip.classList.toggle('complete',phase==='complete');

    let label='Points will go to:';
    let target='Waiting for round control';
    if(!has){
      label='Round points:';
      target='Start a question first';
    }else if(phase==='faceoff'){
      label='Selected face-off team:';
      target=name(s,s.activeTeam);
    }else if(phase==='play'){
      label='Points will go to:';
      target=name(s,Number.isInteger(s.controllingTeam)?s.controllingTeam:s.activeTeam);
    }else if(phase==='steal'){
      label='Steal can take the pot:';
      target=name(s,Number.isInteger(s.stealTeam)?s.stealTeam:s.activeTeam);
    }else if(phase==='complete'){
      label='Round points awarded to:';
      target=name(s,s.activeTeam);
    }
    strip.innerHTML=`<span>${label}</span><strong>${target}</strong>`;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(install()||tries>30) clearInterval(timer);
  },100);

  KiwiSync.subscribe(render);
})();
