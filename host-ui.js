(()=>{
  if(!document.title.includes('Host')) return;
  const css=document.createElement('style');
  css.textContent=`
    body{padding-bottom:92px}.top{position:sticky;top:0;z-index:90;background:#081b2df2;padding:8px 0;backdrop-filter:blur(8px)}
    .host-workspace{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:12px;align-items:start;margin-bottom:14px}
    .simple-host{display:grid;gap:10px}.phase-pill{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}.phase-pill span{padding:6px 9px;border-radius:999px;background:#ffffff0b;color:#7893a7;font-size:10px;font-weight:950}.phase-pill .on{background:#ffd24b;color:#251700}.phase-pill .done{background:#238b59;color:#fff}
    .host-focus{background:linear-gradient(135deg,#174e78,#102f4e);border:2px solid #ffd24b55;border-radius:16px;padding:13px;box-shadow:0 14px 35px #0007}.host-focus small{color:#ffd24b;font-weight:1000;letter-spacing:.12em}.host-focus h2{margin:4px 0 3px;font-size:clamp(20px,4vw,29px)}.host-focus p{margin:0;color:#c5d8e4;line-height:1.35;font-size:14px}
    .round-strip{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:7px}.round-box{background:#061b2d;border-radius:11px;padding:9px;text-align:center;border:1px solid #ffffff16}.round-box small{display:block;color:#9eb7c8;font-size:9px;font-weight:900;text-transform:uppercase}.round-box strong{display:block;color:#ffd24b;font-size:20px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .strike-card{background:#061b2d;border-radius:13px;padding:10px;text-align:center;border:1px solid #ffffff16}.strike-card h3{margin:0 0 5px;font-size:14px}.strike-line{display:flex;justify-content:center;gap:9px}.strike-dot{width:37px;height:37px;border-radius:50%;display:grid;place-items:center;background:#ffffff0b;color:#ffffff28;font-size:25px;font-weight:1000}.strike-dot.on{background:#d93a4d;color:white;box-shadow:0 0 14px #d93a4d88}.strike-note{margin-top:5px;color:#9eb7c8;font-size:11px}
    .main-action{min-height:62px;font-size:18px!important;border-radius:14px!important}.secondary-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}.secondary-row .btn{min-height:44px}.advanced{background:#061b2d;border-radius:11px;padding:9px}.advanced summary{cursor:pointer;font-weight:900;color:#b6ccda;font-size:13px}.advanced-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}
    .host-question-card{position:sticky;top:72px;z-index:70;max-height:calc(100vh - 86px);overflow:auto;scrollbar-width:thin}
    .host-question-card .head{padding:9px 11px;font-size:12px}.host-question-card .question{padding:12px;font-size:clamp(19px,2.4vw,28px);min-height:0}.host-question-card .answers{padding:8px;gap:6px;grid-template-columns:1fr 1fr}.host-question-card .answer{min-height:45px;font-size:14px;grid-template-columns:34px minmax(0,1fr) 45px}.host-question-card .answer span{padding:6px}.host-question-card .answer.done{opacity:.42}.host-question-card .answer:not(.done){box-shadow:0 3px 8px #0001}.host-question-card .answer:not(.done):active{transform:scale(.99)}
    .legacy-hidden{display:none!important}.host-bottom{position:fixed;left:0;right:0;bottom:0;z-index:150;background:#061b2df4;border-top:2px solid #ffd24b55;padding:9px}.host-bottom-inner{width:min(820px,100%);margin:auto;display:grid;grid-template-columns:1fr;gap:8px}.host-bottom .btn{min-height:58px;font-size:17px}
    .team-row{min-height:58px}.select-team{width:44px;height:44px}
    @media(max-width:850px){
      .host-workspace{grid-template-columns:1fr}.host-question-card{order:-1;position:sticky;top:61px;max-height:none;overflow:visible}.simple-host{order:2}.host-question-card .answers{grid-template-columns:1fr 1fr}.host-question-card .question{font-size:21px;padding:10px}.host-question-card .answer{min-height:42px;font-size:13px}
    }
    @media(max-width:560px){
      body{padding-bottom:82px}.host-workspace{gap:8px}.host-question-card{top:58px}.host-question-card .head{padding:7px 9px}.host-question-card .question{font-size:19px;padding:9px}.host-question-card .answers{padding:6px;gap:5px}.host-question-card .answer{grid-template-columns:29px minmax(0,1fr) 38px;min-height:38px;font-size:12px}.host-question-card .answer span{padding:4px}.phase-pill{display:none}.round-strip{grid-template-columns:1fr 1fr}.round-strip .round-box:first-child{grid-column:1/-1}.secondary-row,.advanced-grid{grid-template-columns:1fr}.host-focus{padding:11px}.host-focus h2{font-size:21px}.main-action{min-height:56px;font-size:16px!important}
    }
  `;
  document.head.appendChild(css);

  const main=document.querySelector('main');
  const card=main.querySelector('.card');
  card.classList.add('host-question-card');
  const workspace=document.createElement('div');workspace.className='host-workspace';
  const ui=document.createElement('section');ui.className='simple-host';
  ui.innerHTML=`
    <div class="phase-pill"><span data-p="setup">Setup</span><span data-p="faceoff">Face-off</span><span data-p="play">Play</span><span data-p="steal">Steal</span><span data-p="complete">Finish</span></div>
    <div class="host-focus"><small>HOST: DO THIS NOW</small><h2 id="simpleTitle">Set up the game</h2><p id="simpleHelp">Add teams, choose the multiplier and open the audience screen.</p></div>
    <div class="round-strip"><div class="round-box"><small>Current team</small><strong id="simpleTeam">—</strong></div><div class="round-box"><small>Pot</small><strong id="simplePot">0</strong></div><div class="round-box"><small>Round</small><strong id="simpleMult">×1</strong></div></div>
    <div class="strike-card"><h3>Strikes</h3><div class="strike-line"><span class="strike-dot">×</span><span class="strike-dot">×</span><span class="strike-dot">×</span></div><div class="strike-note" id="strikeNote">No strikes yet</div></div>
    <button class="btn main-action" id="mainAction"></button>
    <div class="secondary-row" id="secondaryActions"></div>
    <details class="advanced"><summary>More controls</summary><div class="advanced-grid" id="advancedActions"></div></details>`;
  main.insertBefore(workspace,card);workspace.appendChild(ui);workspace.appendChild(card);
  card.querySelector('.controls')?.classList.add('legacy-hidden');
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
    if(!has){title.textContent='Set up the game';help.textContent='Add teams, choose the multiplier, then start the first question.';mainAct={t:'🎲 Start First Question',f:'nextQuestion',c:'green'};sec=[{t:'🎬 Open Audience',f:'openAudience',c:'gold'},{t:'📘 Show Rules',f:'openRulesPopup'}]}
    else if(phase==='faceoff'){title.textContent='Choose the face-off winner';help.textContent='Tap the winning team, then confirm control.';mainAct={t:`✓ ${active} Controls the Round`,f:'setControl',c:'green'};sec=[{t:'↔ Select Next Team',f:'selectNextTeam'},{t:'🎲 Replace Question',f:'nextQuestion'}]}
    else if(phase==='play'){title.textContent=`Listen for ${control}'s answer`;help.textContent='Tap the matching answer card. For a miss, use the red strike button.';mainAct={t:`❌ Wrong Answer — Strike ${Math.min(3,strikes+1)}`,f:'strike',c:'red'};sec=[{t:'↶ Undo Strike',f:'undoStrike',d:strikes===0},{t:`🏆 Award ${value} Points`,f:'award',c:'gold',d:value===0}];adv=[{t:'↔ Pass Control',f:'passControl',d:strikes>0},{t:'🎲 New Question',f:'nextQuestion'}]}
    else if(phase==='steal'){title.textContent=`One steal answer for ${active}`;help.textContent='Correct: reveal the answer and award the pot. Wrong: press Steal Missed.';mainAct={t:`⚡ Correct Steal — Award ${value}`,f:'stealSuccess',c:'gold'};sec=[{t:`✖ Steal Missed — ${control} Wins`,f:'stealMiss',c:'red'},{t:'↶ Undo Third Strike',f:'undoStrike'}]}
    else{title.textContent=`Round complete — ${active} wins`;help.textContent='Choose the next multiplier, then continue.';mainAct={t:'➡ Start Next Question',f:'nextQuestion',c:'green'};sec=[{t:'🔊 Play Win Sound',f:'playWinSound',c:'gold'},{t:'📘 Rules',f:'openRulesPopup'}]}
    mainBtn.textContent=mainAct.t;mainBtn.className='btn main-action '+mainAct.c;mainBtn.onclick=()=>call(mainAct.f);bottomBtn.textContent=mainAct.t;bottomBtn.className='btn '+mainAct.c;bottomBtn.onclick=()=>call(mainAct.f);setButtons(secondary,sec);setButtons(advanced,adv);
  }
  window.playWinSound=()=>window.KiwiAudio?.win?.();KiwiSync.subscribe(render);
})();