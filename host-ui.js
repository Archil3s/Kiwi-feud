(()=>{
  if(!document.title.includes('Host')) return;
  const css=document.createElement('style');
  css.textContent=`
    body{padding-bottom:92px}.top{position:sticky;top:0;z-index:80;background:#081b2df2;padding:8px 0;backdrop-filter:blur(8px)}
    .simple-host{display:grid;gap:12px;margin-bottom:14px}.phase-pill{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.phase-pill span{padding:7px 10px;border-radius:999px;background:#ffffff0b;color:#7893a7;font-size:11px;font-weight:950}.phase-pill .on{background:#ffd24b;color:#251700}.phase-pill .done{background:#238b59;color:#fff}
    .host-focus{background:linear-gradient(135deg,#174e78,#102f4e);border:2px solid #ffd24b55;border-radius:18px;padding:16px;box-shadow:0 18px 50px #0008}.host-focus small{color:#ffd24b;font-weight:1000;letter-spacing:.12em}.host-focus h2{margin:5px 0 4px;font-size:clamp(23px,5vw,34px)}.host-focus p{margin:0;color:#c5d8e4;line-height:1.45}
    .round-strip{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:8px}.round-box{background:#061b2d;border-radius:13px;padding:11px;text-align:center;border:1px solid #ffffff16}.round-box small{display:block;color:#9eb7c8;font-size:10px;font-weight:900;text-transform:uppercase}.round-box strong{display:block;color:#ffd24b;font-size:23px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .strike-card{background:#061b2d;border-radius:16px;padding:14px;text-align:center;border:1px solid #ffffff16}.strike-card h3{margin:0 0 8px}.strike-line{display:flex;justify-content:center;gap:12px}.strike-dot{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#ffffff0b;color:#ffffff28;font-size:31px;font-weight:1000}.strike-dot.on{background:#d93a4d;color:white;box-shadow:0 0 18px #d93a4d88}.strike-note{margin-top:8px;color:#9eb7c8;font-size:13px}
    .main-action{min-height:76px;font-size:20px!important;border-radius:15px!important}.secondary-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.secondary-row .btn{min-height:50px}.advanced{background:#061b2d;border-radius:13px;padding:10px}.advanced summary{cursor:pointer;font-weight:900;color:#b6ccda}.advanced-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
    .legacy-hidden{display:none!important}.host-bottom{position:fixed;left:0;right:0;bottom:0;z-index:150;background:#061b2df4;border-top:2px solid #ffd24b55;padding:9px}.host-bottom-inner{width:min(820px,100%);margin:auto;display:grid;grid-template-columns:1fr;gap:8px}.host-bottom .btn{min-height:58px;font-size:17px}
    .team-row{min-height:62px}.select-team{width:46px;height:46px}.answer{min-height:58px;font-size:16px}
    @media(max-width:560px){.round-strip{grid-template-columns:1fr 1fr}.round-strip .round-box:first-child{grid-column:1/-1}.secondary-row,.advanced-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);

  const main=document.querySelector('main');
  const ui=document.createElement('section');ui.className='simple-host';
  ui.innerHTML=`
    <div class="phase-pill"><span data-p="setup">Setup</span><span data-p="faceoff">Face-off</span><span data-p="play">Play</span><span data-p="steal">Steal</span><span data-p="complete">Finish</span></div>
    <div class="host-focus"><small>HOST: DO THIS NOW</small><h2 id="simpleTitle">Set up the game</h2><p id="simpleHelp">Add teams, choose the multiplier and open the audience screen.</p></div>
    <div class="round-strip"><div class="round-box"><small>Current team</small><strong id="simpleTeam">—</strong></div><div class="round-box"><small>Pot</small><strong id="simplePot">0</strong></div><div class="round-box"><small>Round</small><strong id="simpleMult">×1</strong></div></div>
    <div class="strike-card"><h3>Strikes</h3><div class="strike-line"><span class="strike-dot">×</span><span class="strike-dot">×</span><span class="strike-dot">×</span></div><div class="strike-note" id="strikeNote">No strikes yet</div></div>
    <button class="btn main-action" id="mainAction"></button>
    <div class="secondary-row" id="secondaryActions"></div>
    <details class="advanced"><summary>More controls</summary><div class="advanced-grid" id="advancedActions"></div></details>`;
  main.insertBefore(ui,main.querySelector('.card'));
  document.querySelector('.card .controls')?.classList.add('legacy-hidden');
  [...main.querySelectorAll('.panel')].find(p=>p.querySelector('#roundPhaseBanner'))?.classList.add('legacy-hidden');

  const bottom=document.createElement('div');bottom.className='host-bottom';bottom.innerHTML='<div class="host-bottom-inner"><button class="btn" id="bottomAction"></button></div>';document.body.appendChild(bottom);
  const call=fn=>window[fn]?.();
  function pot(s){const q=KIWI_FEUD_BANK[s.questionIndex];return q?(s.revealed||[]).reduce((n,i)=>n+(q.a[i]?.[1]||0),0)*(Number(s.multiplier)||1):0}
  function setButtons(el,items){el.innerHTML=items.map(x=>`<button class="btn ${x.c||''}" ${x.d?'disabled':''} data-f="${x.f}">${x.t}</button>`).join('');el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>call(b.dataset.f))}
  function render(s){
    const has=s.questionIndex>=0,phase=s.roundAwarded?'complete':(s.phase||(has?'faceoff':'setup')),order=['setup','faceoff','play','steal','complete'];
    document.querySelectorAll('[data-p]').forEach(x=>{const i=order.indexOf(x.dataset.p),c=order.indexOf(phase);x.classList.toggle('on',x.dataset.p===phase);x.classList.toggle('done',i<c)});
    const active=s.teams[s.activeTeam]?.name||'Team',control=s.teams[s.controllingTeam]?.name||active,value=pot(s),strikes=s.strikes||0;
    document.getElementById('simpleTeam').textContent=phase==='play'?control:active;document.getElementById('simplePot').textContent=value;document.getElementById('simpleMult').textContent='×'+(Number(s.multiplier)||1);
    document.querySelectorAll('.strike-dot').forEach((d,i)=>d.classList.toggle('on',i<strikes));document.getElementById('strikeNote').textContent=phase==='steal'?'Three strikes — steal is active':strikes?`${strikes} of 3 strikes`:'No strikes yet';
    const title=document.getElementById('simpleTitle'),help=document.getElementById('simpleHelp'),mainBtn=document.getElementById('mainAction'),bottomBtn=document.getElementById('bottomAction'),secondary=document.getElementById('secondaryActions'),advanced=document.getElementById('advancedActions');
    let mainAct={t:'',f:'',c:''},sec=[],adv=[];
    if(!has){title.textContent='Set up the game';help.textContent='Add teams, choose the multiplier, then start the first question.';mainAct={t:'🎲 Start First Question',f:'nextQuestion',c:'green'};sec=[{t:'🎬 Open Audience',f:'openAudience',c:'gold'},{t:'📘 Show Rules',f:'openRulesPopup'}];adv=[]}
    else if(phase==='faceoff'){title.textContent='Choose the face-off winner';help.textContent='Tap the winning team below, then confirm control.';mainAct={t:`✓ ${active} Controls the Round`,f:'setControl',c:'green'};sec=[{t:'↔ Select Next Team',f:'selectNextTeam'},{t:'🎲 Replace Question',f:'nextQuestion'}];adv=[]}
    else if(phase==='play'){title.textContent=`Listen for ${control}'s answer`;help.textContent='Correct answer: tap the matching answer card. Wrong answer: press the big red button.';mainAct={t:`❌ Wrong Answer — Strike ${Math.min(3,strikes+1)}`,f:'strike',c:'red'};sec=[{t:'↶ Undo Strike',f:'undoStrike',d:strikes===0},{t:`🏆 Award ${value} Points`,f:'award',c:'gold',d:value===0}];adv=[{t:'↔ Pass Control',f:'passControl',d:strikes>0},{t:'🎲 New Question',f:'nextQuestion'}]}
    else if(phase==='steal'){title.textContent=`One steal answer for ${active}`;help.textContent=`Correct: reveal the matching answer, then press Correct Steal. Wrong: press Steal Missed.`;mainAct={t:`⚡ Correct Steal — Award ${value}`,f:'stealSuccess',c:'gold'};sec=[{t:`✖ Steal Missed — ${control} Wins`,f:'stealMiss',c:'red'},{t:'↶ Undo Third Strike',f:'undoStrike'}];adv=[]}
    else{title.textContent=`Round complete — ${active} wins`;help.textContent='Choose the next multiplier, then continue.';mainAct={t:'➡ Start Next Question',f:'nextQuestion',c:'green'};sec=[{t:'🔊 Play Win Sound',f:'playWinSound',c:'gold'},{t:'📘 Rules',f:'openRulesPopup'}];adv=[]}
    mainBtn.textContent=mainAct.t;mainBtn.className='btn main-action '+mainAct.c;mainBtn.onclick=()=>call(mainAct.f);bottomBtn.textContent=mainAct.t;bottomBtn.className='btn '+mainAct.c;bottomBtn.onclick=()=>call(mainAct.f);setButtons(secondary,sec);setButtons(advanced,adv);
  }
  window.playWinSound=()=>window.KiwiAudio?.win?.();KiwiSync.subscribe(render);
})();