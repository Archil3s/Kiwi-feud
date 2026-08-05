(()=>{
  if(!document.title.includes('Host')) return;
  const css=document.createElement('style');
  css.textContent=`
    body{padding-bottom:84px}.top{position:sticky;top:0;z-index:90;background:#081b2df4;padding:7px 0;backdrop-filter:blur(8px)}
    .top h1{font-size:clamp(22px,4vw,32px)}
    .host-status-top{position:sticky;top:57px;z-index:85;display:grid;grid-template-columns:1.3fr .7fr .7fr .9fr;gap:7px;margin:0 0 10px;padding:8px;background:#081b2df4;border:1px solid #ffffff16;border-radius:13px;backdrop-filter:blur(8px)}
    .status-box{min-width:0;background:#061b2d;border-radius:10px;padding:8px;text-align:center}.status-box small{display:block;color:#9eb7c8;font-size:9px;font-weight:900;text-transform:uppercase}.status-box strong{display:block;color:#ffd24b;font-size:18px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .host-workspace{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(330px,.92fr);gap:10px;align-items:start;margin-bottom:12px}
    .simple-host{display:grid;gap:9px}.phase-pill{display:flex;justify-content:center;gap:5px;flex-wrap:wrap}.phase-pill span{padding:5px 8px;border-radius:999px;background:#ffffff0b;color:#7893a7;font-size:9px;font-weight:950}.phase-pill .on{background:#ffd24b;color:#251700}.phase-pill .done{background:#238b59;color:#fff}
    .host-focus{background:linear-gradient(135deg,#174e78,#102f4e);border:2px solid #ffd24b55;border-radius:14px;padding:11px;box-shadow:0 12px 28px #0006}.host-focus small{color:#ffd24b;font-weight:1000;letter-spacing:.1em;font-size:10px}.host-focus h2{margin:3px 0;font-size:clamp(18px,2.6vw,25px);line-height:1.12}.host-focus p{margin:0;color:#c5d8e4;line-height:1.3;font-size:13px}
    .strike-card{background:#061b2d;border-radius:12px;padding:9px;text-align:center;border:1px solid #ffffff16}.strike-card h3{margin:0 0 4px;font-size:13px}.strike-line{display:flex;justify-content:center;gap:8px}.strike-dot{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#ffffff0b;color:#ffffff28;font-size:23px;font-weight:1000}.strike-dot.on{background:#d93a4d;color:white;box-shadow:0 0 12px #d93a4d88}.strike-note{margin-top:4px;color:#9eb7c8;font-size:10px}
    .main-action{min-height:58px;font-size:17px!important;border-radius:13px!important}.secondary-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}.secondary-row .btn{min-height:42px}.advanced{background:#061b2d;border-radius:10px;padding:8px}.advanced summary{cursor:pointer;font-weight:900;color:#b6ccda;font-size:12px}.advanced-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}
    .host-question-card{position:sticky;top:122px;z-index:70;max-height:calc(100vh - 132px);overflow:auto;scrollbar-width:thin}
    .host-question-card .head{padding:8px 10px;font-size:11px}.host-question-card .question{padding:10px 12px;font-size:clamp(18px,2vw,25px);line-height:1.14;min-height:0;overflow-wrap:anywhere}.host-question-card .answers{padding:7px;gap:6px;grid-template-columns:1fr}.host-question-card .answer{min-height:42px;font-size:13px;grid-template-columns:32px minmax(0,1fr) 44px}.host-question-card .answer span{padding:5px}.host-question-card .answer .label{line-height:1.15;overflow-wrap:anywhere;word-break:normal}.host-question-card .answer.done{opacity:.45}
    .legacy-hidden{display:none!important}.host-bottom{position:fixed;left:0;right:0;bottom:0;z-index:150;background:#061b2df4;border-top:2px solid #ffd24b55;padding:8px}.host-bottom-inner{width:min(820px,100%);margin:auto}.host-bottom .btn{width:100%;min-height:54px;font-size:16px}
    .team-row{min-height:56px}.select-team{width:42px;height:42px}
    .soundboard-panel{position:static!important;z-index:auto!important}
    @media(min-width:1180px){.host-question-card .answers{grid-template-columns:1fr 1fr}.host-question-card .answer{min-height:46px}}
    @media(max-width:900px){
      .host-status-top{top:55px;grid-template-columns:1.4fr .8fr .8fr .8fr}.host-workspace{grid-template-columns:1fr}.host-question-card{order:-1;position:static;max-height:none;overflow:visible}.simple-host{order:2}.host-question-card .answers{grid-template-columns:1fr 1fr}.host-question-card .question{font-size:20px}.host-question-card .answer{font-size:12px;min-height:40px}
    }
    @media(max-width:620px){
      body{padding-bottom:78px}.host-status-top{top:52px;grid-template-columns:1fr 1fr;margin-bottom:7px;padding:6px}.host-status-top .status-box:first-child{grid-column:1/-1}.status-box{padding:6px}.status-box strong{font-size:16px}.host-workspace{gap:7px}.host-question-card .head{padding:6px 8px}.host-question-card .question{font-size:18px;padding:8px;line-height:1.12}.host-question-card .answers{grid-template-columns:1fr;padding:5px;gap:4px}.host-question-card .answer{grid-template-columns:28px minmax(0,1fr) 38px;min-height:36px;font-size:12px}.host-question-card .answer span{padding:4px}.phase-pill{display:none}.secondary-row,.advanced-grid{grid-template-columns:1fr}.host-focus{padding:9px}.host-focus h2{font-size:19px}.main-action{min-height:52px;font-size:15px!important}
    }
  `;
  document.head.appendChild(css);

  const main=document.querySelector('main');
  const card=main.querySelector('.card');
  card.classList.add('host-question-card');

  const status=document.createElement('section');status.className='host-status-top';
  status.innerHTML='<div class="status-box"><small>Current team</small><strong id="topTeam">—</strong></div><div class="status-box"><small>Pot</small><strong id="topPot">0</strong></div><div class="status-box"><small>Multiplier</small><strong id="topMult">×1</strong></div><div class="status-box"><small>Strikes</small><strong id="topStrikes">0 / 3</strong></div>';
  main.insertBefore(status,card);

  const workspace=document.createElement('div');workspace.className='host-workspace';
  const ui=document.createElement('section');ui.className='simple-host';
  ui.innerHTML=`
    <div class="phase-pill"><span data-p="setup">Setup</span><span data-p="faceoff">Face-off</span><span data-p="play">Play</span><span data-p="steal">Steal</span><span data-p="complete">Finish</span></div>
    <div class="host-focus"><small>HOST: DO THIS NOW</small><h2 id="simpleTitle">Set up the game</h2><p id="simpleHelp">Add teams, choose the multiplier and open the audience screen.</p></div>
    <div class="strike-card"><h3>Strikes</h3><div class="strike-line"><span class="strike-dot">×</span><span class="strike-dot">×</span><span class="strike-dot">×</span></div><div class="strike-note" id="strikeNote">No strikes yet</div></div>
    <button class="btn main-action" id="mainAction"></button>
    <div class="secondary-row" id="secondaryActions"></div>
    <details class="advanced"><summary>More controls</summary><div class="advanced-grid" id="advancedActions"></div></details>`;
  main.insertBefore(workspace,card);workspace.appendChild(card);workspace.appendChild(ui);
  card.querySelector('.controls')?.classList.add('legacy-hidden');
  [...main.querySelectorAll('.panel')].find(p=>p.querySelector('#roundPhaseBanner'))?.classList.add('legacy-hidden');

  const bottom=document.createElement('div');bottom.className='host-bottom';bottom.innerHTML='<div class="host-bottom-inner"><button class="btn" id="bottomAction"></button></div>';document.body.appendChild(bottom);
  const call=fn=>window[fn]?.();
  function pot(s){const q=KIWI_FEUD_BANK[s.questionIndex];return q?(s.revealed||[]).reduce((n,i)=>n+(q.a[i]?.[1]||0),0)*(Number(s.multiplier)||1):0}
  function setButtons(el,items){el.innerHTML=items.map(x=>`<button class="btn ${x.c||''}" ${x.d?'disabled':''} data-f="${x.f}">${x.t}</button>`).join('');el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>call(b.dataset.f))}
  function render(s){
    const has=s.questionIndex>=0,phase=s.roundAwarded?'complete':(s.phase||(has?'faceoff':'setup')),order=['setup','faceoff','play','steal','complete'];
    document.querySelectorAll('[data-p]').forEach(x=>{const i=order.indexOf(x.dataset.p),c=order.indexOf(phase);x.classList.toggle('on',x.dataset.p===phase);x.classList.toggle('done',i<c)});
    const active=s.teams[s.activeTeam]?.name||'Team',control=s.teams[s.controllingTeam]?.name||active,value=pot(s),strikes=s.strikes||0,current=phase==='play'?control:active;
    document.getElementById('topTeam').textContent=current;document.getElementById('topPot').textContent=value;document.getElementById('topMult').textContent='×'+(Number(s.multiplier)||1);document.getElementById('topStrikes').textContent=`${strikes} / 3`;
    document.querySelectorAll('.strike-dot').forEach((d,i)=>d.classList.toggle('on',i<strikes));document.getElementById('strikeNote').textContent=phase==='steal'?'Three strikes — steal is active':strikes?`${strikes} of 3 strikes`:'No strikes yet';
    const title=document.getElementById('simpleTitle'),help=document.getElementById('simpleHelp'),mainBtn=document.getElementById('mainAction'),bottomBtn=document.getElementById('bottomAction'),secondary=document.getElementById('secondaryActions'),advanced=document.getElementById('advancedActions');
    let mainAct={t:'',f:'',c:''},sec=[],adv=[];
    if(!has){title.textContent='Set up the game';help.textContent='Add teams, choose the multiplier, then start the first question.';mainAct={t:'🎲 Start First Question',f:'nextQuestion',c:'green'};sec=[{t:'🎬 Open Audience',f:'openAudience',c:'gold'},{t:'📘 Show Rules',f:'openRulesPopup'}]}
    else if(phase==='faceoff'){title.textContent='Choose the face-off winner';help.textContent='Tap the winning team, then confirm control.';mainAct={t:`✓ ${active} Controls the Round`,f:'setControl',c:'green'};sec=[{t:'↔ Select Next Team',f:'selectNextTeam'},{t:'🎲 Replace Question',f:'nextQuestion'}]}
    else if(phase==='play'){title.textContent=`Listen for ${control}'s answer`;help.textContent='Tap the matching answer. For a miss, use the red strike button.';mainAct={t:`❌ Wrong Answer — Strike ${Math.min(3,strikes+1)}`,f:'strike',c:'red'};sec=[{t:'↶ Undo Strike',f:'undoStrike',d:strikes===0},{t:`🏆 Award ${value} Points`,f:'award',c:'gold',d:value===0}];adv=[{t:'↔ Pass Control',f:'passControl',d:strikes>0},{t:'🎲 New Question',f:'nextQuestion'}]}
    else if(phase==='steal'){title.textContent=`One steal answer for ${active}`;help.textContent='Correct: reveal the answer and award the pot. Wrong: press Steal Missed.';mainAct={t:`⚡ Correct Steal — Award ${value}`,f:'stealSuccess',c:'gold'};sec=[{t:`✖ Steal Missed — ${control} Wins`,f:'stealMiss',c:'red'},{t:'↶ Undo Third Strike',f:'undoStrike'}]}
    else{title.textContent=`Round complete — ${active} wins`;help.textContent='Choose the next multiplier, then continue.';mainAct={t:'➡ Start Next Question',f:'nextQuestion',c:'green'};sec=[{t:'🔊 Play Win Sound',f:'playWinSound',c:'gold'},{t:'📘 Rules',f:'openRulesPopup'}]}
    mainBtn.textContent=mainAct.t;mainBtn.className='btn main-action '+mainAct.c;mainBtn.onclick=()=>call(mainAct.f);bottomBtn.textContent=mainAct.t;bottomBtn.className='btn '+mainAct.c;bottomBtn.onclick=()=>call(mainAct.f);setButtons(secondary,sec);setButtons(advanced,adv);
  }
  window.playWinSound=()=>window.KiwiAudio?.win?.();KiwiSync.subscribe(render);
})();