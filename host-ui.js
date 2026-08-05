(()=>{
  if(!document.title.includes('Host')) return;
  const css=document.createElement('style');
  css.textContent=`
    body{padding-bottom:110px}
    .top{position:sticky;top:0;z-index:80;background:#081b2df2;padding:8px 0;backdrop-filter:blur(8px)}
    .guided-host{display:grid;gap:12px;margin-bottom:14px}
    .flow-track{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;background:#061b2d;border-radius:14px;padding:9px;position:sticky;top:64px;z-index:70;box-shadow:0 10px 30px #0007}
    .flow-step{padding:8px 4px;border-radius:10px;text-align:center;font-size:11px;font-weight:950;color:#7893a7;background:#ffffff08}
    .flow-step.active{background:linear-gradient(#ffe177,#e6a51f);color:#251700;box-shadow:0 0 18px #ffd24b44}
    .flow-step.done{color:#d9e9f3;background:#1c6849}
    .host-prompt{background:linear-gradient(135deg,#174e78,#102f4e);border:2px solid #ffd24b55;border-radius:18px;padding:16px;box-shadow:0 18px 50px #0008}
    .prompt-kicker{font-size:12px;font-weight:1000;letter-spacing:.13em;color:#ffd24b;text-transform:uppercase}
    .prompt-title{font-size:clamp(22px,5vw,34px);font-weight:1000;margin-top:4px}
    .prompt-help{color:#c5d8e4;margin-top:6px;line-height:1.4}
    .quick-state{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:8px}
    .quick-card{background:#061b2d;border-radius:13px;padding:11px;text-align:center;border:1px solid #ffffff16}
    .quick-card small{display:block;color:#9eb7c8;text-transform:uppercase;font-weight:900;font-size:10px}
    .quick-card strong{display:block;color:#ffd24b;font-size:23px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .strike-dots{display:flex;justify-content:center;gap:8px;margin-top:5px}.strike-dot{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#ffffff0d;color:#ffffff28;font-size:24px;font-weight:1000}.strike-dot.on{background:#d93a4d;color:white;box-shadow:0 0 15px #d93a4d88}
    .guided-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .guided-actions .btn{min-height:56px;font-size:15px;border:1px solid #ffffff18;box-shadow:0 8px 20px #0004}
    .guided-actions .primary{grid-column:1/-1;min-height:68px;font-size:18px}
    .team-row{min-height:62px}.select-team{width:46px;height:46px}.team-row.active{transform:scale(1.01)}
    .answer{min-height:58px;font-size:16px}.answer:not(.done):hover{transform:translateY(-1px);box-shadow:0 7px 15px #0002}
    .legacy-hidden{display:none!important}
    .host-sticky-bar{position:fixed;left:0;right:0;bottom:0;z-index:150;background:#061b2df5;border-top:2px solid #ffd24b55;padding:9px max(9px,env(safe-area-inset-right)) calc(9px + env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));backdrop-filter:blur(9px)}
    .host-sticky-inner{width:min(820px,100%);margin:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px}.host-sticky-inner .btn{min-height:52px;font-size:15px}
    @media(max-width:560px){.flow-track{top:58px}.flow-step{font-size:9px;padding:7px 2px}.quick-state{grid-template-columns:1fr 1fr}.quick-state .quick-card:first-child{grid-column:1/-1}.guided-actions{grid-template-columns:1fr}.guided-actions .primary{grid-column:auto}.panel{padding:10px}.team-row{grid-template-columns:auto minmax(0,1fr) 62px}.team-actions{grid-column:1/-1;justify-content:flex-end}}
  `;
  document.head.appendChild(css);

  const main=document.querySelector('main');
  const guide=document.createElement('section');
  guide.className='guided-host';
  guide.innerHTML=`
    <div class="flow-track" id="flowTrack">
      <div class="flow-step" data-step="setup">1 Setup</div><div class="flow-step" data-step="faceoff">2 Face-off</div><div class="flow-step" data-step="play">3 Play</div><div class="flow-step" data-step="steal">4 Steal</div><div class="flow-step" data-step="complete">5 Finish</div>
    </div>
    <div class="host-prompt"><div class="prompt-kicker">Host next step</div><div class="prompt-title" id="guidedTitle">Set up the game</div><div class="prompt-help" id="guidedHelp">Add teams, open the audience board, and choose a round value.</div></div>
    <div class="quick-state">
      <div class="quick-card"><small>Selected / Active Team</small><strong id="guidedTeam">—</strong></div>
      <div class="quick-card"><small>Round Pot</small><strong id="guidedPot">0</strong></div>
      <div class="quick-card"><small>Multiplier</small><strong id="guidedMult">×1</strong></div>
    </div>
    <div class="quick-card"><small>Strikes</small><div class="strike-dots"><span class="strike-dot">×</span><span class="strike-dot">×</span><span class="strike-dot">×</span></div></div>
    <div class="guided-actions" id="guidedActions"></div>`;
  const firstCard=main.querySelector('.card');
  main.insertBefore(guide,firstCard);

  const oldControls=document.querySelector('.card .controls');
  if(oldControls) oldControls.classList.add('legacy-hidden');
  const rulesPanel=[...main.querySelectorAll('.panel')].find(p=>p.querySelector('#roundPhaseBanner'));
  if(rulesPanel) rulesPanel.classList.add('legacy-hidden');

  const sticky=document.createElement('div');
  sticky.className='host-sticky-bar';
  sticky.innerHTML='<div class="host-sticky-inner"><button class="btn red" id="stickyStrike">❌ Add Strike</button><button class="btn green" id="stickyNext">➡ Next Question</button></div>';
  document.body.appendChild(sticky);
  sticky.querySelector('#stickyStrike').onclick=()=>window.strike?.();
  sticky.querySelector('#stickyNext').onclick=()=>window.nextQuestion?.();

  function value(s){const q=KIWI_FEUD_BANK[s.questionIndex];if(!q)return 0;return (s.revealed||[]).reduce((n,i)=>n+(q.a[i]?.[1]||0),0)*(Number(s.multiplier)||1)}
  function button(label,cls,fn,disabled=false){return `<button class="btn ${cls||''}" ${disabled?'disabled':''} data-action="${fn}">${label}</button>`}
  function wire(){guide.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>window[b.dataset.action]?.())}
  function render(s){
    const phase=s.roundAwarded?'complete':(s.phase|| (s.questionIndex<0?'setup':'faceoff'));
    const order=['setup','faceoff','play','steal','complete'];
    document.querySelectorAll('.flow-step').forEach(el=>{const i=order.indexOf(el.dataset.step),current=order.indexOf(phase);el.classList.toggle('active',el.dataset.step===phase);el.classList.toggle('done',i<current)});
    const active=s.teams[s.activeTeam]?.name||'Team';
    const control=s.teams[s.controllingTeam]?.name||active;
    document.getElementById('guidedTeam').textContent=phase==='play'?control:active;
    document.getElementById('guidedPot').textContent=value(s);
    document.getElementById('guidedMult').textContent='×'+(Number(s.multiplier)||1);
    document.querySelectorAll('.strike-dot').forEach((d,i)=>d.classList.toggle('on',i<(s.strikes||0)));
    const title=document.getElementById('guidedTitle'),help=document.getElementById('guidedHelp'),actions=document.getElementById('guidedActions');
    const hasQuestion=s.questionIndex>=0;
    if(!hasQuestion){
      title.textContent='Set up the game';help.textContent='Add or rename teams, choose Single, Double or Triple, then open the audience board.';
      actions.innerHTML=button('🎬 Open Audience Screen','primary gold','openAudience')+button('📘 Show Rules','','openRulesPopup')+button('🎲 Start First Question','green','nextQuestion');
    }else if(phase==='faceoff'){
      title.textContent='Select the face-off winner';help.textContent='Tap the winning team’s numbered circle below, then confirm they control the round.';
      actions.innerHTML=button(`✓ Give Control to ${active}`,'primary green','setControl')+button('↔ Select Next Team','','selectNextTeam')+button('🎲 Replace Question','','nextQuestion');
    }else if(phase==='play'){
      title.textContent=`${control} is playing the board`;help.textContent=(s.strikes||0)===0?'Tap a matching answer below. Add a strike for a miss. Control may still be passed before the first strike.':'Keep revealing matching answers. Three strikes will open one steal chance.';
      actions.innerHTML=button('❌ Wrong Answer — Add Strike','primary red','strike')+button('↶ Undo Last Strike','ghost','undoStrike',(s.strikes||0)===0)+button('↔ Pass Control','','passControl',(s.strikes||0)>0)+button(`🏆 End Round — Award ${value(s)}`,'gold','award',value(s)===0);
    }else if(phase==='steal'){
      title.textContent=`Steal chance for ${active}`;help.textContent=`One answer only. Correct: reveal it below, then award the ${value(s)}-point pot. Wrong: return the pot to ${control}.`;
      actions.innerHTML=button(`⚡ Correct Steal — Award ${value(s)}`,'primary gold','stealSuccess')+button(`✖ Steal Missed — ${control} Wins`,'red','stealMiss')+button('↶ Undo Third Strike','ghost','undoStrike');
    }else{
      title.textContent=`Round complete — ${active} wins`;help.textContent=`The ${value(s)}-point pot has been added. Choose the next multiplier, then continue.`;
      actions.innerHTML=button('➡ Start Next Question','primary green','nextQuestion')+button('🔊 Play Win Sound','gold','playWinSound')+button('📘 Rules','','openRulesPopup');
    }
    wire();
    const strikeBtn=document.getElementById('stickyStrike');
    strikeBtn.disabled=!hasQuestion||phase==='faceoff'||phase==='complete';
    strikeBtn.textContent=phase==='steal'?'✖ Steal Missed':'❌ Add Strike';
    const nextBtn=document.getElementById('stickyNext');
    nextBtn.textContent=phase==='complete'||!hasQuestion?'➡ Next Question':'🎲 New Question';
  }
  window.playWinSound=()=>window.KiwiAudio?.win?.();
  KiwiSync.subscribe(render);
})();