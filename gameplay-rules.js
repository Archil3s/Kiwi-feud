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

    const rules=document.createElement('section');
    rules.className='panel';
    rules.style.marginTop='12px';
    rules.innerHTML=`
      <details id="hostRules">
        <summary style="cursor:pointer;font-weight:1000;color:#ffd24b;font-size:17px;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>📘 Rules & How to Play</span><span style="font-size:13px;color:#b6ccda">Tap to open</span>
        </summary>
        <div style="margin-top:12px;display:grid;gap:12px;color:#e8f1f7;line-height:1.45">
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">1. Set up the game</strong>
            <p style="margin:6px 0 0">Add or rename teams, open the Audience screen, choose a category and select Single, Double or Triple points.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">2. Start a round</strong>
            <p style="margin:6px 0 0">Press <b>New Question</b>. Choose the team that won the face-off by tapping its numbered circle. That team is now in control.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">3. Reveal correct answers</strong>
            <p style="margin:6px 0 0">Tap an answer row when the team gives a matching answer. Its points are added to the round pot automatically.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">4. Add strikes</strong>
            <p style="margin:6px 0 0">Press <b>Add Strike</b> for a wrong answer. On the third strike, the next team automatically receives one steal attempt.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">5. Resolve the steal</strong>
            <p style="margin:6px 0 0"><b>Successful steal:</b> reveal the matching answer, then press <b>Award</b>. <b>Missed steal:</b> press <b>Steal Missed</b>; the original controlling team receives the full pot.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">6. Multipliers and scoring</strong>
            <p style="margin:6px 0 0">The revealed-answer total is multiplied by ×1, ×2 or ×3. Example: a 46-point board on Double becomes a 92-point round pot.</p>
          </div>
          <div style="background:#061b2d;border-radius:12px;padding:12px">
            <strong style="color:#ffd24b">Host control guide</strong>
            <div style="margin-top:7px;display:grid;gap:5px;font-size:14px">
              <div><b>Pass Control:</b> manually moves control to the next team and clears strikes.</div>
              <div><b>Next Team:</b> changes the highlighted team without resetting the round.</div>
              <div><b>Cover Answers:</b> hides all revealed answers for the current card.</div>
              <div><b>+5 / −5:</b> manually corrects a team score.</div>
              <div><b>New Question:</b> starts a fresh round and clears strikes.</div>
              <div><b>Reset Game:</b> clears all scores and game progress.</div>
            </div>
          </div>
          <div style="background:#163a5b;border:1px solid #ffd24b55;border-radius:12px;padding:12px;font-size:13px">
            <strong style="color:#ffd24b">Recommended 2-hour format</strong>
            <p style="margin:6px 0 0">Play 6 Single rounds, 4 Double rounds and 2 Triple rounds, then finish with Fast Money or a tie-breaker.</p>
          </div>
        </div>
      </details>`;

    const main=document.querySelector('main');
    const soundPanel=[...main.querySelectorAll('section')].find(x=>x.textContent.includes('ORIGINAL GAME-SHOW SOUNDBOARD'));
    if(soundPanel){
      main.insertBefore(panel,soundPanel);
      main.insertBefore(rules,soundPanel);
    }else{
      main.appendChild(panel);
      main.appendChild(rules);
    }

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