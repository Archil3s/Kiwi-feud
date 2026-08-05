(()=>{
  if(!document.title.includes('Host')) return;

  const css=document.createElement('style');
  css.textContent=`
    .rules-launch{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#173f68,#102f4e);border:1px solid #ffffff24;box-shadow:0 12px 30px #0005;margin:10px 0}
    .rules-launch strong{color:#ffd24b}.rules-launch small{display:block;color:#c6d8e4;margin-top:3px}
    .rules-modal{position:fixed;inset:0;z-index:60000;display:none;place-items:center;padding:14px;background:#02070dcc;backdrop-filter:blur(6px)}
    .rules-modal.open{display:grid}
    .rules-shell{width:min(1040px,100%);max-height:min(900px,94vh);display:grid;grid-template-rows:auto auto 1fr auto;background:linear-gradient(180deg,#102f4e,#071a2b);border:2px solid #ffd24b;border-radius:22px;overflow:hidden;box-shadow:0 30px 100px #000d;color:#fff}
    .rules-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;background:linear-gradient(90deg,#173f68,#0b2943)}
    .rules-head h2{margin:0;color:#ffd24b;font-size:clamp(24px,4vw,38px)}
    .rules-head p{margin:3px 0 0;color:#c5d7e3;font-size:13px}
    .rules-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:10px;background:#061724;border-top:1px solid #ffffff12;border-bottom:1px solid #ffffff12}
    .rules-tabs button{border:0;border-radius:10px;padding:10px 8px;background:#ffffff0d;color:#d9e8f1;font-weight:900;cursor:pointer}
    .rules-tabs button.on{background:#ffd24b;color:#251700;box-shadow:0 0 0 2px #fff0a6 inset}
    .rules-body{overflow:auto;padding:16px;scrollbar-gutter:stable}
    .rules-page{display:none;animation:rulesIn .22s ease-out}.rules-page.on{display:block}
    .rules-hero{display:grid;grid-template-columns:1.2fr .8fr;gap:12px;margin-bottom:14px}
    .rules-card{background:#ffffff0a;border:1px solid #ffffff18;border-radius:15px;padding:14px}
    .rules-card h3{margin:0 0 8px;color:#ffd24b}.rules-card p{margin:0;color:#d6e4ec;line-height:1.45}
    .rules-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}
    .rules-step{padding:12px;border-radius:13px;background:#061b2d;border:1px solid #ffffff16;text-align:center}.rules-step b{display:block;color:#ffd24b;font-size:18px}.rules-step span{display:block;color:#c6d8e3;font-size:12px;margin-top:5px}
    .rules-mode-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.rules-mode{padding:14px;border-radius:15px;background:#061b2d;border:1px solid #ffffff18}.rules-mode h3{margin:0 0 8px;color:#ffd24b}.rules-mode ul{margin:0;padding-left:18px;color:#d7e5ed}.rules-mode li{margin:6px 0}
    .rules-points{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.rules-point{padding:16px;border-radius:15px;text-align:center;background:#061b2d;border:1px solid #ffffff18}.rules-point b{display:block;color:#ffd24b;font-size:34px}.rules-point span{color:#c8d9e4}
    .rules-example{margin-top:12px;padding:14px;border-radius:14px;background:linear-gradient(135deg,#173f68,#0d273f);border:1px solid #ffffff22;text-align:center;font-weight:900}.rules-example strong{color:#ffd24b;font-size:24px}
    .rules-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;background:#061724;border-top:1px solid #ffffff15}.rules-progress{color:#a9c3d5;font-size:12px}.rules-footer .btn{min-width:120px}
    @keyframes rulesIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    @media(max-width:760px){.rules-tabs{grid-template-columns:repeat(3,1fr)}.rules-hero,.rules-mode-grid{grid-template-columns:1fr}.rules-flow{grid-template-columns:1fr 1fr}.rules-points{grid-template-columns:1fr}.rules-shell{max-height:96vh}.rules-head{align-items:flex-start}.rules-launch{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(css);

  const launch=document.createElement('section');
  launch.className='rules-launch';
  launch.innerHTML=`<div><strong>📘 Complete Game Rules</strong><small>Game structure, modes, scoring, timers, strikes, steals and host flow.</small></div><button class="btn gold" id="openCompleteRules">Open Rules</button>`;
  const modePanel=document.querySelector('.mode-panel');
  (modePanel||document.querySelector('main'))?.insertAdjacentElement(modePanel?'afterend':'afterbegin',launch);

  const modal=document.createElement('div');
  modal.className='rules-modal';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label','Complete Kiwi Feud game rules');
  modal.innerHTML=`
    <div class="rules-shell">
      <div class="rules-head"><div><h2>🥝 Kiwi Feud — Complete Rules</h2><p>Everything the host needs to run the game from start to finish.</p></div><button class="btn red" id="closeCompleteRules">Close</button></div>
      <div class="rules-tabs">
        <button data-rule-tab="overview" class="on">Overview</button><button data-rule-tab="standard">Standard</button><button data-rule-tab="modes">Game Modes</button><button data-rule-tab="points">Points</button><button data-rule-tab="host">Host Flow</button><button data-rule-tab="finish">Winning</button>
      </div>
      <div class="rules-body">
        <section class="rules-page on" data-rule-page="overview">
          <div class="rules-hero"><div class="rules-card"><h3>Goal of the game</h3><p>Teams try to guess the most popular answers shown on the board. Higher-ranked answers are normally worth more points. The team with the highest total score at the end wins.</p></div><div class="rules-card"><h3>Core rule</h3><p>The host controls whether an answer matches the board. Similar wording and accepted synonyms may count when they clearly mean the same thing.</p></div></div>
          <div class="rules-flow"><div class="rules-step"><b>1</b><span>Select a mode</span></div><div class="rules-step"><b>2</b><span>Load the question</span></div><div class="rules-step"><b>3</b><span>Start the timer</span></div><div class="rules-step"><b>4</b><span>Reveal or strike</span></div><div class="rules-step"><b>5</b><span>Award and continue</span></div></div>
          <div class="rules-card" style="margin-top:12px"><h3>Important host note</h3><p>Changing modes prepares the question and timer but does not start the countdown. Press <strong>Start Countdown</strong> only when contestants are ready.</p></div>
        </section>

        <section class="rules-page" data-rule-page="standard">
          <div class="rules-mode-grid">
            <article class="rules-mode"><h3>🎤 Face-off</h3><ul><li>One player from each team answers.</li><li>The team with the higher-ranked answer gains control.</li><li>The host confirms the controlling team.</li><li>Face-off answers decide control and are not automatically added as a timed-mode award.</li></ul></article>
            <article class="rules-mode"><h3>🟢 Team turn</h3><ul><li>The controlling team gives one answer at a time.</li><li>Correct answers are revealed and added to the round pot.</li><li>A repeated or incorrect answer may receive a strike.</li><li>The team continues until the board is cleared or three strikes are reached.</li></ul></article>
            <article class="rules-mode"><h3>❌ Strikes</h3><ul><li>Strike 1 and Strike 2 keep play with the controlling team.</li><li>Strike 3 begins the steal phase.</li><li>The large X animation pauses visual flow while it plays.</li><li>Undo is available for host mistakes.</li></ul></article>
            <article class="rules-mode"><h3>⚡ Steal</h3><ul><li>The opposing team receives one answer.</li><li>A correct steal wins the complete multiplied round pot.</li><li>A missed steal gives the pot back to the original controlling team.</li><li>The round is then marked complete to prevent double scoring.</li></ul></article>
          </div>
        </section>

        <section class="rules-page" data-rule-page="modes">
          <div class="rules-mode-grid">
            <article class="rules-mode"><h3>🎯 Tie-breaker</h3><ul><li>Uses a dedicated one-answer tie-breaker question.</li><li>Each team receives the configured countdown.</li><li>The host starts the first timer manually.</li><li>At expiry, revealed points are awarded automatically and the next team/question is prepared or continued by the mode flow.</li></ul></article>
            <article class="rules-mode"><h3>💨 Speed Round</h3><ul><li>Questions move quickly on a repeating timer.</li><li>The game automatically changes question and rotates the active team.</li><li>Revealed points are awarded automatically at the end of each timed question.</li><li>The next countdown continues automatically after the host has started the mode.</li></ul></article>
            <article class="rules-mode"><h3>💰 Fast Money</h3><ul><li>Runs a set of five short questions for one team.</li><li>Each question uses the Fast Money bank.</li><li>Revealed points are awarded automatically at expiry.</li><li>After five questions, the next team is prepared automatically.</li></ul></article>
            <article class="rules-mode"><h3>🎤 Face-off Mode</h3><ul><li>Each team receives a timed chance on the same question.</li><li>The game rotates to the next team after the first chance.</li><li>The host uses the result to select control.</li><li>This mode does not automatically add the face-off answer as a round award.</li></ul></article>
          </div>
        </section>

        <section class="rules-page" data-rule-page="points">
          <div class="rules-points"><div class="rules-point"><b>×1</b><span>Single points</span></div><div class="rules-point"><b>×2</b><span>Double points</span></div><div class="rules-point"><b>×3</b><span>Triple points</span></div></div>
          <div class="rules-example">Example: revealed answers total <strong>42</strong> and the multiplier is <strong>×2</strong> → the team receives <strong>84 points</strong>.</div>
          <div class="rules-mode-grid" style="margin-top:12px"><article class="rules-mode"><h3>Timed multiplier</h3><ul><li>When enabled, the mode begins at ×1.</li><li>The middle third of the countdown changes to ×2.</li><li>The final third changes to ×3.</li><li>The colour shifts from green toward red as time decreases.</li></ul></article><article class="rules-mode"><h3>Automatic awards</h3><ul><li>Tie-breaker, Fast Money and Speed Round total revealed answers at expiry.</li><li>The active multiplier is applied.</li><li>The result is added to the active team once.</li><li>Standard rounds are awarded through the normal round/steal flow.</li></ul></article></div>
        </section>

        <section class="rules-page" data-rule-page="host">
          <div class="rules-flow"><div class="rules-step"><b>READY</b><span>Choose mode and team</span></div><div class="rules-step"><b>START</b><span>Press Start Countdown</span></div><div class="rules-step"><b>PLAY</b><span>Reveal answers or add strikes</span></div><div class="rules-step"><b>RESOLVE</b><span>Award, steal or auto-score</span></div><div class="rules-step"><b>NEXT</b><span>Continue the game</span></div></div>
          <div class="rules-mode-grid" style="margin-top:12px"><article class="rules-mode"><h3>Main host actions</h3><ul><li>Reveal the matched answer.</li><li>Add a strike for an incorrect answer.</li><li>Pause or continue the timer.</li><li>Confirm successful or missed steals.</li><li>Use Next Now when a timed mode must move early.</li></ul></article><article class="rules-mode"><h3>Safety controls</h3><ul><li>Undo accidental strikes.</li><li>Emergency Restore returns to the last stable state.</li><li>Round awards cannot be applied twice.</li><li>Already revealed answers cannot be revealed again.</li><li>Stop Mode returns the timer system to Standard.</li></ul></article></div>
        </section>

        <section class="rules-page" data-rule-page="finish">
          <div class="rules-hero"><div class="rules-card"><h3>Winning the game</h3><p>After the agreed number of rounds or the final mode, compare the team totals. The team with the highest score wins. Use a tie-breaker if scores are level.</p></div><div class="rules-card"><h3>Recommended structure</h3><p>Face-off → standard rounds → double/triple rounds → optional Speed Round → Fast Money or tie-breaker → final winner.</p></div></div>
          <div class="rules-mode-grid"><article class="rules-mode"><h3>Suggested two-hour game</h3><ul><li>10 minutes: setup and rules</li><li>60–75 minutes: standard rounds</li><li>15 minutes: Speed Round</li><li>15 minutes: Fast Money</li><li>5–10 minutes: tie-breaker and winner celebration</li></ul></article><article class="rules-mode"><h3>Final check</h3><ul><li>Confirm all scores have been awarded.</li><li>Stop any active timer.</li><li>Show the final scoreboard.</li><li>Use the winner celebration and confetti.</li></ul></article></div>
        </section>
      </div>
      <div class="rules-footer"><div class="rules-progress" id="rulesProgress">Section 1 of 6</div><div style="display:flex;gap:8px"><button class="btn ghost" id="rulesBack">Back</button><button class="btn gold" id="rulesNext">Next</button></div></div>
    </div>`;
  document.body.appendChild(modal);

  const tabs=[...modal.querySelectorAll('[data-rule-tab]')];
  const pages=[...modal.querySelectorAll('[data-rule-page]')];
  let index=0;
  function show(i){
    index=Math.max(0,Math.min(pages.length-1,i));
    tabs.forEach((b,n)=>b.classList.toggle('on',n===index));
    pages.forEach((p,n)=>p.classList.toggle('on',n===index));
    modal.querySelector('#rulesProgress').textContent=`Section ${index+1} of ${pages.length}`;
    modal.querySelector('#rulesBack').disabled=index===0;
    modal.querySelector('#rulesNext').textContent=index===pages.length-1?'Done':'Next';
    modal.querySelector('.rules-body').scrollTop=0;
  }
  function open(){modal.classList.add('open');document.body.style.overflow='hidden';show(index);setTimeout(()=>modal.querySelector('#closeCompleteRules')?.focus(),20)}
  function close(){modal.classList.remove('open');document.body.style.overflow=''}
  launch.querySelector('#openCompleteRules').onclick=open;
  modal.querySelector('#closeCompleteRules').onclick=close;
  tabs.forEach((b,i)=>b.onclick=()=>show(i));
  modal.querySelector('#rulesBack').onclick=()=>show(index-1);
  modal.querySelector('#rulesNext').onclick=()=>index===pages.length-1?close():show(index+1);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(index+1);if(e.key==='ArrowLeft')show(index-1)});
  show(0);
})();
