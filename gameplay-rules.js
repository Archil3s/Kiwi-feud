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

    window.nextQuestion=function(){
      if(typeof originalNext==='function')originalNext();
      setTimeout(()=>{
        const s=KiwiSync.get();
        KiwiSync.set({
          phase:'play',
          controllingTeam:s.activeTeam,
          defendingTeam:null,
          stealTeam:null,
          strikes:0,
          roundAwarded:false,
          multiplier:Number(document.getElementById('multiplier')?.value||s.multiplier||1)
        });
      },0);
    };

    window.strike=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded)return;
      if(s.phase==='steal'){
        if(window.KiwiAudio?.buzzer)window.KiwiAudio.buzzer();
        return;
      }
      const strikes=Math.min(3,(s.strikes||0)+1);
      if(strikes<3){
        KiwiSync.set({strikes});
        return;
      }
      const defending=Number.isInteger(s.controllingTeam)?s.controllingTeam:s.activeTeam;
      const steal=nextTeamIndex(s,defending);
      KiwiSync.set({
        strikes:3,
        phase:'steal',
        defendingTeam:defending,
        stealTeam:steal,
        activeTeam:steal
      });
    };

    window.award=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded)return;
      const pot=currentPot(s);
      if(!pot)return;
      const target=s.phase==='steal'&&Number.isInteger(s.stealTeam)?s.stealTeam:s.activeTeam;
      const teams=s.teams.map((t,i)=>i===target?{...t,score:t.score+pot}:t);
      KiwiSync.set({teams,roundAwarded:true,phase:'complete',activeTeam:target});
      if(window.KiwiAudio?.win)window.KiwiAudio.win();
    };

    window.stealMiss=function(){
      const s=KiwiSync.get();
      if(s.phase!=='steal'||s.roundAwarded)return;
      const pot=currentPot(s);
      const target=Number.isInteger(s.defendingTeam)?s.defendingTeam:s.controllingTeam;
      const teams=s.teams.map((t,i)=>i===target?{...t,score:t.score+pot}:t);
      KiwiSync.set({teams,roundAwarded:true,phase:'complete',activeTeam:target});
      if(window.KiwiAudio?.buzzer)window.KiwiAudio.buzzer();
    };

    window.passControl=function(){
      const s=KiwiSync.get();
      const target=nextTeamIndex(s,s.activeTeam);
      KiwiSync.set({activeTeam:target,controllingTeam:target,phase:'play',strikes:0,defendingTeam:null,stealTeam:null});
    };

    if(typeof originalReset==='function'){
      window.resetGame=function(){
        originalReset();
        setTimeout(()=>KiwiSync.set({...roundDefaults}),0);
      };
    }

    const multiplier=document.getElementById('multiplier');
    if(multiplier){
      multiplier.onchange=e=>{
        const value=Math.max(1,Math.min(3,Number(e.target.value)||1));
        KiwiSync.set({multiplier:value});
      };
    }

    const panel=document.createElement('section');
    panel.className='panel';
    panel.style.marginTop='12px';
    panel.innerHTML=`
      <div class="active-banner" id="roundPhaseBanner">Round control loading…</div>
      <div class="grid">
        <button class="btn" onclick="passControl()">↔ Pass Control</button>
        <button class="btn red" id="stealMissBtn" onclick="stealMiss()">✖ Steal Missed</button>
      </div>
      <div class="status">At three strikes, control automatically moves to the next team for one steal attempt. Correct steal: reveal the answer and press Award. Missed steal: press Steal Missed.</div>`;
    const main=document.querySelector('main');
    const soundPanel=[...main.querySelectorAll('section')].find(x=>x.textContent.includes('ORIGINAL GAME-SHOW SOUNDBOARD'));
    if(soundPanel)main.insertBefore(panel,soundPanel);else main.appendChild(panel);

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