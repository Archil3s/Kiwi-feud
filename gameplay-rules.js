(()=>{
  const isHost=document.title.includes('Host');
  const nextTeamIndex=(s,from)=>s.teams.length?((from+1)%s.teams.length):0;
  const defaults={phase:'setup',controllingTeam:0,defendingTeam:null,stealTeam:null,stealRevealBaseline:0};

  function pot(s){
    const q=KIWI_FEUD_BANK[s.questionIndex];
    if(!q)return 0;
    const base=(s.revealed||[]).reduce((n,i)=>n+(q.a[i]?.[1]||0),0);
    return base*(Number(s.multiplier)||1);
  }
  function teamName(s,i){return s.teams[i]?.name||`Team ${Number(i)+1}`}
  function normalise(s){
    const p={};
    if(!s.phase)p.phase=s.questionIndex<0?'setup':'faceoff';
    if(!Number.isInteger(s.controllingTeam))p.controllingTeam=s.activeTeam||0;
    if(s.defendingTeam===undefined)p.defendingTeam=null;
    if(s.stealTeam===undefined)p.stealTeam=null;
    if(!Number.isInteger(s.stealRevealBaseline))p.stealRevealBaseline=0;
    if(Object.keys(p).length)KiwiSync.set(p);
  }

  if(isHost){
    const baseNext=window.nextQuestion;
    const baseReset=window.resetGame;
    const baseSelectTeam=window.selectTeam;
    let rulesComplete=sessionStorage.getItem('kiwi-feud-rules-complete')==='1';

    window.selectTeam=function(i){
      const s=KiwiSync.get();
      if(typeof baseSelectTeam==='function')baseSelectTeam(i);else KiwiSync.set({activeTeam:i});
      if(s.phase==='steal')KiwiSync.set({activeTeam:i,stealTeam:i});
    };

    window.nextQuestion=function(){
      if(!rulesComplete){openRulesPopup();return;}
      if(typeof baseNext==='function')baseNext();
      setTimeout(()=>{
        const s=KiwiSync.get();
        KiwiSync.set({
          phase:'faceoff',controllingTeam:s.activeTeam,defendingTeam:null,stealTeam:null,
          stealRevealBaseline:0,strikes:0,roundAwarded:false,
          multiplier:Math.max(1,Math.min(3,Number(document.getElementById('multiplier')?.value||s.multiplier||1)))
        });
      },0);
    };

    window.setControl=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded||s.phase==='steal'||s.phase==='complete')return;
      KiwiSync.set({controllingTeam:s.activeTeam,phase:'play',strikes:0,defendingTeam:null,stealTeam:null});
    };

    window.passControl=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded||s.phase==='steal'||s.phase==='complete')return;
      if((s.strikes||0)>0){alert('Control cannot be passed after strikes have started. Use Undo Strike or finish the round.');return;}
      const target=s.activeTeam!==s.controllingTeam?s.activeTeam:nextTeamIndex(s,s.controllingTeam);
      KiwiSync.set({activeTeam:target,controllingTeam:target,phase:'play',strikes:0,defendingTeam:null,stealTeam:null});
    };

    window.strike=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded||s.phase==='complete')return;
      if(s.phase==='faceoff'){alert('Choose the controlling team first.');return;}
      if(s.phase==='steal'){window.stealMiss();return;}
      const count=Math.min(3,(s.strikes||0)+1);
      window.KiwiAudio?.buzzer?.();
      if(count<3){KiwiSync.set({strikes:count});return;}
      const defending=Number.isInteger(s.controllingTeam)?s.controllingTeam:s.activeTeam;
      const steal=nextTeamIndex(s,defending);
      KiwiSync.set({
        strikes:3,phase:'steal',defendingTeam:defending,stealTeam:steal,
        activeTeam:steal,stealRevealBaseline:(s.revealed||[]).length
      });
    };

    window.undoStrike=function(){
      const s=KiwiSync.get();
      if(s.roundAwarded)return;
      if(s.phase==='steal'){
        KiwiSync.set({phase:'play',activeTeam:s.defendingTeam,controllingTeam:s.defendingTeam,strikes:2,stealTeam:null,defendingTeam:null,stealRevealBaseline:0});
        return;
      }
      if((s.strikes||0)>0)KiwiSync.set({strikes:s.strikes-1});
    };

    function awardTo(index){
      const s=KiwiSync.get(),value=pot(s);
      if(!value||s.roundAwarded||!Number.isInteger(index))return;
      const teams=s.teams.map((t,i)=>i===index?{...t,score:t.score+value}:t);
      KiwiSync.set({teams,roundAwarded:true,phase:'complete',activeTeam:index});
      window.KiwiAudio?.win?.();
    }

    window.award=function(){
      const s=KiwiSync.get();
      if(s.phase==='steal'){window.stealSuccess();return;}
      awardTo(Number.isInteger(s.controllingTeam)?s.controllingTeam:s.activeTeam);
    };

    window.stealSuccess=function(){
      const s=KiwiSync.get();
      if(s.phase!=='steal'||s.roundAwarded)return;
      if((s.revealed||[]).length<=(s.stealRevealBaseline||0)){
        if(!confirm('No new answer has been revealed for the steal. Award the steal anyway?'))return;
      }
      awardTo(Number.isInteger(s.stealTeam)?s.stealTeam:s.activeTeam);
    };

    window.stealMiss=function(){
      const s=KiwiSync.get();
      if(s.phase!=='steal'||s.roundAwarded)return;
      window.KiwiAudio?.buzzer?.();
      awardTo(Number.isInteger(s.defendingTeam)?s.defendingTeam:s.controllingTeam);
    };

    if(typeof baseReset==='function')window.resetGame=function(){
      baseReset();rulesComplete=false;sessionStorage.removeItem('kiwi-feud-rules-complete');
      setTimeout(()=>{KiwiSync.set({...defaults});openRulesPopup();},0);
    };

    const multiplier=document.getElementById('multiplier');
    if(multiplier)multiplier.onchange=e=>KiwiSync.set({multiplier:Math.max(1,Math.min(3,Number(e.target.value)||1))});

    const panel=document.createElement('section');
    panel.className='panel';panel.style.marginTop='12px';
    panel.innerHTML=`
      <div class="active-banner" id="roundPhaseBanner">Round setup loading…</div>
      <div class="grid">
        <button class="btn green" id="setControlBtn" onclick="setControl()">✓ Make Selected Team Control</button>
        <button class="btn" id="passControlBtn" onclick="passControl()">↔ Pass / Give Control</button>
      </div>
      <div class="grid">
        <button class="btn ghost" id="undoStrikeBtn" onclick="undoStrike()">↶ Undo Strike</button>
        <button class="btn red" id="stealMissBtn" onclick="stealMiss()">✖ Steal Missed</button>
      </div>
      <button class="btn gold" id="stealWinBtn" onclick="stealSuccess()">⚡ Successful Steal — Award Pot</button>
      <button class="btn gold" id="openRulesBtn">📘 Open Rules & Host Walkthrough</button>
      <div class="status" id="flowHint">Select a team, make them controlling team, then reveal answers or add strikes.</div>`;
    const main=document.querySelector('main');
    const soundPanel=[...main.querySelectorAll('section')].find(x=>x.textContent.includes('ORIGINAL GAME-SHOW SOUNDBOARD'));
    if(soundPanel)main.insertBefore(panel,soundPanel);else main.appendChild(panel);

    const modal=document.createElement('div');modal.id='rulesModal';
    modal.style.cssText='position:fixed;inset:0;z-index:20000;background:#020a12e8;display:none;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(6px)';
    modal.innerHTML=`<div style="width:min(720px,100%);max-height:92vh;overflow:auto;background:#102f4e;border:2px solid #ffd24b;border-radius:20px;box-shadow:0 30px 90px #000;padding:18px;color:#fff"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div style="font-size:34px">🥝</div><div><div style="font-size:24px;font-weight:1000;color:#ffd24b">Kiwi Feud Host Walkthrough</div><div id="ruleProgress" style="color:#b6ccda;font-size:13px"></div></div></div><div id="ruleCard" style="background:#061b2d;border-radius:15px;padding:18px;min-height:260px"></div><div style="height:8px;background:#061b2d;border-radius:999px;margin:14px 0;overflow:hidden"><div id="ruleBar" style="height:100%;background:linear-gradient(90deg,#ffd24b,#e7a51b);transition:.25s"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px"><button class="btn ghost" id="ruleBack">← Back</button><button class="btn gold" id="ruleNext">Next →</button></div><button class="btn" id="ruleClose" style="width:100%;margin-top:9px;background:#ffffff12">Close for now</button></div>`;
    document.body.appendChild(modal);
    const steps=[
      ['👥','Select, then confirm control','Tap a team circle to select it. Press Make Selected Team Control after the face-off. Selecting a team alone no longer silently changes who owns the round.'],
      ['↔','Pass only before strikes','Pass / Give Control moves the round to the selected team, or to the next team if the controlling team is selected. Passing is blocked once strikes begin.'],
      ['❌','Strikes stay with the controlling team','The first and second misses add strikes. The third strike freezes the original team as the defending team and opens one steal chance. Undo Strike can safely reverse mistakes.'],
      ['⚡','One clean steal attempt','During a steal, select the stealing team if needed. Reveal one matching answer and press Successful Steal. For a miss, press Steal Missed; the original team receives the pot.'],
      ['✖️','The multiplier applies to the full pot','All revealed answer points are added first, then multiplied by ×1, ×2 or ×3. The winner receives the complete multiplied total.'],
      ['🏆','Finish, then start fresh','After awarding the pot, choose the next multiplier and press New Question. Control and strikes reset, while team scores remain.']
    ];
    let step=0;const card=modal.querySelector('#ruleCard'),progress=modal.querySelector('#ruleProgress'),bar=modal.querySelector('#ruleBar'),back=modal.querySelector('#ruleBack'),next=modal.querySelector('#ruleNext');
    function renderRule(){const x=steps[step];progress.textContent=`Step ${step+1} of ${steps.length}`;bar.style.width=`${(step+1)/steps.length*100}%`;card.innerHTML=`<div style="font-size:42px">${x[0]}</div><h2 style="color:#ffd24b">${x[1]}</h2><p style="font-size:17px;line-height:1.55">${x[2]}</p>`;back.disabled=step===0;next.textContent=step===steps.length-1?'Start the Game →':'Next →'}
    function openRulesPopup(){step=0;renderRule();modal.style.display='flex';document.body.style.overflow='hidden'}
    function closeRules(done=false){if(done){rulesComplete=true;sessionStorage.setItem('kiwi-feud-rules-complete','1')}modal.style.display='none';document.body.style.overflow=''}
    window.openRulesPopup=openRulesPopup;back.onclick=()=>{if(step){step--;renderRule()}};next.onclick=()=>step<steps.length-1?(step++,renderRule()):closeRules(true);modal.querySelector('#ruleClose').onclick=()=>closeRules(false);panel.querySelector('#openRulesBtn').onclick=openRulesPopup;

    KiwiSync.subscribe(s=>{
      normalise(s);
      const banner=document.getElementById('roundPhaseBanner'),hint=document.getElementById('flowHint');
      const setBtn=document.getElementById('setControlBtn'),passBtn=document.getElementById('passControlBtn'),undo=document.getElementById('undoStrikeBtn'),miss=document.getElementById('stealMissBtn'),win=document.getElementById('stealWinBtn');
      if(!banner)return;
      const control=teamName(s,s.controllingTeam),active=teamName(s,s.activeTeam),value=pot(s);
      if(s.roundAwarded||s.phase==='complete'){
        banner.innerHTML=`ROUND COMPLETE — <strong>${active}</strong> received ${value} points`;
        hint.textContent='Choose the next multiplier, then press New Question.';
      }else if(s.phase==='steal'){
        banner.innerHTML=`STEAL: <strong>${active}</strong> gets ONE answer for the ${value}-point pot held by ${control}`;
        hint.textContent='Correct: reveal one answer and press Successful Steal. Wrong: press Steal Missed. Tap another team circle to change the stealing team.';
      }else if(s.phase==='faceoff'){
        banner.innerHTML=`FACE-OFF — selected team: <strong>${active}</strong>`;
        hint.textContent='Run the face-off, select its winner, then press Make Selected Team Control.';
      }else{
        banner.innerHTML=`IN CONTROL: <strong>${control}</strong> — ${s.strikes||0}/3 strikes`;
        hint.textContent=(s.strikes||0)?'Continue revealing answers or add the next strike.':'Reveal answers. You may still pass control before the first strike.';
      }
      const locked=s.roundAwarded||s.phase==='complete'||s.phase==='steal';
      setBtn.disabled=locked;passBtn.disabled=locked||(s.strikes||0)>0;undo.disabled=!((s.strikes||0)>0||s.phase==='steal')||s.roundAwarded;miss.disabled=s.phase!=='steal'||s.roundAwarded;win.disabled=s.phase!=='steal'||s.roundAwarded;
      const award=document.getElementById('award');if(award)award.textContent=s.phase==='steal'?`Successful Steal — ${value} Points`:(s.roundAwarded?'Points Awarded':`Award ${value} Points`);
    });

    const initial=KiwiSync.get();if(initial.questionIndex<0&&!rulesComplete)setTimeout(openRulesPopup,250);
  }else{
    const banner=document.createElement('div');banner.id='audiencePhase';banner.style.cssText='margin:0 auto 12px;max-width:900px;padding:10px 14px;border-radius:14px;background:#061b2ddd;border:2px solid #ffd24b55;text-align:center;font-weight:1000;color:#fff';document.querySelector('.shell')?.before(banner);
    KiwiSync.subscribe(s=>{
      normalise(s);const active=teamName(s,s.activeTeam),control=teamName(s,s.controllingTeam);
      if(s.roundAwarded||s.phase==='complete')banner.textContent=`ROUND COMPLETE — ${active}`;
      else if(s.phase==='steal')banner.textContent=`ONE-ANSWER STEAL — ${active} can take the whole pot from ${control}`;
      else if(s.phase==='faceoff')banner.textContent='FACE-OFF — waiting for the host to confirm control';
      else banner.textContent=`${control} IN CONTROL — ${s.strikes||0}/3 STRIKES`;
    });
  }
})();