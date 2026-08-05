(()=>{
  const isHost=document.title.includes('Host');
  const nextTeamIndex=(state,from)=>state.teams.length?((from+1)%state.teams.length):0;
  const roundDefaults={phase:'play',controllingTeam:0,defendingTeam:null,stealTeam:null};

  function normalize(s){
    const patch={};
    if(!s.phase)patch.phase='play';
    if(!Number.isInteger(s.controllingTeam))patch.controllingTeam=s.activeTeam||0;
    if(s.defendingTeam===undefined)patch.defendingTeam=null;
    if(s.stealTeam===undefined)patch.stealTeam=null;
    if(Object.keys(patch).length)KiwiSync.set(patch);
  }

  function currentPot(s){
    const q=KIWI_FEUD_BANK[s.questionIndex];
    if(!q)return 0;
    const base=(s.revealed||[]).reduce((sum,i)=>sum+(q.a[i]?.[1]||0),0);
    return base*(Number(s.multiplier)||1);
  }

  if(isHost){
    const originalNext=window.nextQuestion;
    const originalReset=window.resetGame;
    let rulesComplete=false;

    window.nextQuestion=function(){
      if(!rulesComplete){
        openRulesPopup();
        return;
      }
      if(typeof originalNext==='function')originalNext();
      setTimeout(()=>{
        const s=KiwiSync.get();
        KiwiSync.set({phase:'play',controllingTeam:s.activeTeam,defendingTeam:null,stealTeam:null,strikes:0,roundAwarded:false,multiplier:Number(document.getElementById('multiplier')?.value||s.multiplier||1)});
      },0);
    };

    window.strike=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded)return;
      if(s.phase==='steal'){window.KiwiAudio?.buzzer?.();return;}
      const strikes=Math.min(3,(s.strikes||0)+1);
      if(strikes<3){KiwiSync.set({strikes});return;}
      const defending=Number.isInteger(s.controllingTeam)?s.controllingTeam:s.activeTeam;
      const steal=nextTeamIndex(s,defending);
      KiwiSync.set({strikes:3,phase:'steal',defendingTeam:defending,stealTeam:steal,activeTeam:steal});
    };

    window.award=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded)return;
      const pot=currentPot(s);
      if(!pot)return;
      const target=s.phase==='steal'&&Number.isInteger(s.stealTeam)?s.stealTeam:s.activeTeam;
      const teams=s.teams.map((t,i)=>i===target?{...t,score:t.score+pot}:t);
      KiwiSync.set({teams,roundAwarded:true,phase:'complete',activeTeam:target});
      window.KiwiAudio?.win?.();
    };

    window.stealMiss=function(){
      const s=KiwiSync.get();
      if(s.phase!=='steal'||s.roundAwarded)return;
      const pot=currentPot(s);
      const target=Number.isInteger(s.defendingTeam)?s.defendingTeam:s.controllingTeam;
      const teams=s.teams.map((t,i)=>i===target?{...t,score:t.score+pot}:t);
      KiwiSync.set({teams,roundAwarded:true,phase:'complete',activeTeam:target});
      window.KiwiAudio?.buzzer?.();
    };

    window.passControl=function(){
      const s=KiwiSync.get();
      const target=nextTeamIndex(s,s.activeTeam);
      KiwiSync.set({activeTeam:target,controllingTeam:target,phase:'play',strikes:0,defendingTeam:null,stealTeam:null});
    };

    if(typeof originalReset==='function'){
      window.resetGame=function(){
        originalReset();
        rulesComplete=false;
        sessionStorage.removeItem('kiwi-feud-rules-complete');
        setTimeout(()=>{KiwiSync.set({...roundDefaults});openRulesPopup();},0);
      };
    }

    const multiplier=document.getElementById('multiplier');
    if(multiplier)multiplier.onchange=e=>KiwiSync.set({multiplier:Math.max(1,Math.min(3,Number(e.target.value)||1))});

    const panel=document.createElement('section');
    panel.className='panel';
    panel.style.marginTop='12px';
    panel.innerHTML=`
      <div class="active-banner" id="roundPhaseBanner">Round control loading…</div>
      <div class="grid">
        <button class="btn" onclick="passControl()">↔ Pass Control</button>
        <button class="btn red" id="stealMissBtn" onclick="stealMiss()">✖ Steal Missed</button>
      </div>
      <button class="btn gold" id="openRulesBtn">📘 Open Rules & Host Walkthrough</button>
      <div class="status">Three strikes triggers one steal attempt. Correct steal: reveal the answer and press Award. Missed steal: press Steal Missed.</div>`;

    const main=document.querySelector('main');
    const soundPanel=[...main.querySelectorAll('section')].find(x=>x.textContent.includes('ORIGINAL GAME-SHOW SOUNDBOARD'));
    if(soundPanel)main.insertBefore(panel,soundPanel);else main.appendChild(panel);

    const modal=document.createElement('div');
    modal.id='rulesModal';
    modal.style.cssText='position:fixed;inset:0;z-index:20000;background:#020a12e8;display:none;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(6px)';
    modal.innerHTML=`
      <div style="width:min(720px,100%);max-height:92vh;overflow:auto;background:#102f4e;border:2px solid #ffd24b;border-radius:20px;box-shadow:0 30px 90px #000;padding:18px;color:#fff">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="font-size:34px">🥝</div>
          <div><div style="font-size:24px;font-weight:1000;color:#ffd24b">Kiwi Feud Host Walkthrough</div><div id="ruleProgress" style="color:#b6ccda;font-size:13px">Step 1 of 6</div></div>
        </div>
        <div id="ruleCard" style="background:#061b2d;border-radius:15px;padding:18px;min-height:260px"></div>
        <div style="height:8px;background:#061b2d;border-radius:999px;margin:14px 0;overflow:hidden"><div id="ruleBar" style="height:100%;width:16.6%;background:linear-gradient(90deg,#ffd24b,#e7a51b);transition:.25s"></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
          <button class="btn ghost" id="ruleBack">← Back</button>
          <button class="btn gold" id="ruleNext">Next →</button>
        </div>
        <button class="btn" id="ruleClose" style="width:100%;margin-top:9px;background:#ffffff12">Close for now</button>
      </div>`;
    document.body.appendChild(modal);

    const steps=[
      {title:'1. Set up your teams',icon:'👥',body:'Add or rename 2–6 teams. Tap a team’s numbered circle to make it active. Open the Audience screen before starting so everyone can see the board and scores.',tip:'The highlighted team is the team currently in control.'},
      {title:'2. Choose the round value',icon:'✖️',body:'Select Single ×1, Double ×2 or Triple ×3 before the question begins. Every revealed answer adds to the base pot, then the multiplier is applied automatically.',tip:'A 46-point board on Double becomes a 92-point pot.'},
      {title:'3. Start the question',icon:'🎤',body:'Press New Question. Run a face-off verbally, then tap the winning team’s circle. That team controls the board. Use Pass Control if they choose to pass or you selected the wrong team.',tip:'Do not press Award until the round is finished.'},
      {title:'4. Reveal answers and strikes',icon:'✅',body:'Tap an answer row when a team gives a matching response. Press Add Strike for a miss. The first two strikes keep play with the same team.',tip:'Revealed answers immediately increase the round pot.'},
      {title:'5. Steal after three strikes',icon:'⚡',body:'On the third strike, control automatically moves to the next team for one steal answer. If they are correct, reveal that answer and press Award. If they miss, press Steal Missed.',tip:'A successful steal takes the whole multiplied pot. A missed steal returns it to the original team.'},
      {title:'6. Continue the game',icon:'🏆',body:'After the pot is awarded, choose the next multiplier and press New Question. For roughly two hours, use 6 Single rounds, 4 Double rounds and 2 Triple rounds, then finish with Fast Money or a tie-breaker.',tip:'You can reopen this walkthrough at any time from the Host Controls.'}
    ];
    let step=0;
    const card=modal.querySelector('#ruleCard'),progress=modal.querySelector('#ruleProgress'),bar=modal.querySelector('#ruleBar'),back=modal.querySelector('#ruleBack'),next=modal.querySelector('#ruleNext');
    function renderRule(){
      const x=steps[step];
      progress.textContent=`Step ${step+1} of ${steps.length}`;
      bar.style.width=`${((step+1)/steps.length)*100}%`;
      card.innerHTML=`<div style="font-size:42px;margin-bottom:8px">${x.icon}</div><h2 style="margin:0 0 10px;color:#ffd24b">${x.title}</h2><p style="font-size:17px;line-height:1.55;margin:0">${x.body}</p><div style="margin-top:16px;background:#163a5b;border-left:4px solid #ffd24b;padding:11px;border-radius:9px"><b>Host tip:</b> ${x.tip}</div>`;
      back.disabled=step===0;
      next.textContent=step===steps.length-1?'Start the Game →':'Next →';
    }
    function openRulesPopup(){step=0;renderRule();modal.style.display='flex';document.body.style.overflow='hidden';}
    function closeRules(markComplete=false){
      if(markComplete){rulesComplete=true;sessionStorage.setItem('kiwi-feud-rules-complete','1');}
      modal.style.display='none';document.body.style.overflow='';
    }
    window.openRulesPopup=openRulesPopup;
    back.onclick=()=>{if(step>0){step--;renderRule();}};
    next.onclick=()=>{if(step<steps.length-1){step++;renderRule();}else closeRules(true);};
    modal.querySelector('#ruleClose').onclick=()=>closeRules(false);
    panel.querySelector('#openRulesBtn').onclick=openRulesPopup;

    KiwiSync.subscribe(s=>{
      normalize(s);
      const banner=document.getElementById('roundPhaseBanner');
      const miss=document.getElementById('stealMissBtn');
      if(!banner)return;
      const control=s.teams[s.controllingTeam]?.name||s.teams[s.activeTeam]?.name||'Team';
      const active=s.teams[s.activeTeam]?.name||'Team';
      if(s.roundAwarded||s.phase==='complete')banner.innerHTML=`Round complete — <strong>${active}</strong> received ${currentPot(s)} points`;
      else if(s.phase==='steal')banner.innerHTML=`STEAL CHANCE: <strong>${active}</strong> can steal the full ${currentPot(s)}-point pot from ${control}`;
      else banner.innerHTML=`IN CONTROL: <strong>${control}</strong> — ${s.strikes||0} of 3 strikes`;
      if(miss)miss.disabled=s.phase!=='steal'||s.roundAwarded;
    });

    const initial=KiwiSync.get();
    rulesComplete=sessionStorage.getItem('kiwi-feud-rules-complete')==='1';
    if(initial.questionIndex<0&&!rulesComplete)setTimeout(openRulesPopup,250);
  }else{
    const banner=document.createElement('div');
    banner.id='audiencePhase';
    banner.style.cssText='margin:0 auto 12px;max-width:900px;padding:10px 14px;border-radius:14px;background:#061b2ddd;border:2px solid #ffd24b55;text-align:center;font-weight:1000;color:#fff';
    document.querySelector('.shell')?.before(banner);
    KiwiSync.subscribe(s=>{
      normalize(s);
      const control=s.teams[s.controllingTeam]?.name||s.teams[s.activeTeam]?.name||'Team';
      const active=s.teams[s.activeTeam]?.name||'Team';
      if(s.roundAwarded||s.phase==='complete')banner.textContent=`ROUND COMPLETE — ${active}`;
      else if(s.phase==='steal')banner.textContent=`STEAL CHANCE — ${active} can take the whole pot`;
      else banner.textContent=`${control} IN CONTROL — ${s.strikes||0}/3 STRIKES`;
    });
  }
})();