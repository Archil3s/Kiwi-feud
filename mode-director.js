(()=>{
  const isHost=document.title.includes('Host');
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-modes-v1'):null;
  const syntheticStart=window.KIWI_FEUD_BANK?.length||0;
  let controller={mode:'standard',running:false,duration:20,remaining:20,endAt:0,step:0,team:0,question:0,round:0,multiplierRamp:true,prepared:false,lastAward:0};
  let interval=null;

  const fast=(window.KIWI_FEUD_FAST_MONEY||[]).map((x,i)=>({c:'Fast Money',q:x.q,a:x.a,aliases:x.aliases||{},_mode:'fast',_modeIndex:i}));
  const ties=(window.KIWI_FEUD_TIE_BREAKERS||[]).map((x,i)=>({c:'Tie-breaker',q:x.q,a:[[x.topAnswer,x.points]],aliases:{},_mode:'tie',_modeIndex:i}));
  if(window.KIWI_FEUD_BANK&&!window.KIWI_FEUD_BANK.some(x=>x._mode==='fast'))window.KIWI_FEUD_BANK.push(...fast,...ties);
  const fastStart=syntheticStart,tieStart=syntheticStart+fast.length;

  const css=document.createElement('style');
  css.textContent=`
    .mode-panel{display:grid;gap:10px}.mode-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.mode-grid .btn.on{background:#ffd24b;color:#251700}.mode-clock{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;background:#061b2d;border-radius:14px;padding:12px}.mode-time{font-size:40px;font-weight:1000;color:#ffd24b}.mode-progress{height:12px;background:#ffffff12;border-radius:99px;overflow:hidden}.mode-progress>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#238b59,#ffd24b,#ef4056);transition:width .2s linear}.mode-status{padding:10px;border-radius:11px;background:#ffffff0b;text-align:center;color:#c9dce8}.mode-stage{position:absolute;left:14px;right:14px;top:12px;z-index:9000;display:none;pointer-events:none}.mode-stage.show{display:block}.mode-stage .mode-banner{background:#061b2df5;border:3px solid #ffd24b;border-radius:16px;padding:10px 14px;text-align:center;box-shadow:0 14px 40px #0009}.mode-stage strong{display:block;color:#ffd24b;text-transform:uppercase;letter-spacing:.08em}.mode-stage b{font-size:34px}.mode-stage small{display:block;color:#c7d9e5}.mode-rules{display:grid;gap:8px}.mode-rules article{padding:10px;border-radius:10px;background:#061b2d}.mode-rules strong{color:#ffd24b}.mode-panel .field select{min-height:42px}@media(max-width:760px){.mode-grid{grid-template-columns:1fr 1fr}.mode-clock{grid-template-columns:1fr;text-align:center}.mode-time{font-size:34px}}
  `;
  document.head.appendChild(css);

  function fmt(n){return `0:${String(Math.max(0,n)).padStart(2,'0')}`}
  function broadcast(){channel?.postMessage({type:'modeState',controller})}
  function multiplierFor(){
    if(!controller.multiplierRamp||!controller.running)return 1;
    const elapsed=1-controller.remaining/controller.duration;
    return elapsed>=.66?3:elapsed>=.33?2:1;
  }
  function setState(patch){controller={...controller,...patch};render();broadcast()}
  function stop(){controller.running=false;clearInterval(interval);interval=null;render();broadcast()}
  function prepare(seconds){
    clearInterval(interval);interval=null;
    controller.duration=seconds;controller.remaining=seconds;controller.endAt=0;controller.running=false;controller.prepared=true;controller._lastTick=null;
    if(isHost)KiwiSync.set({multiplier:1});
    render();broadcast();
  }
  function start(seconds=null){
    clearInterval(interval);
    if(seconds!==null){controller.duration=seconds;controller.remaining=seconds}
    if(controller.remaining<=0)controller.remaining=controller.duration;
    controller.endAt=Date.now()+controller.remaining*1000;controller.running=true;controller.prepared=false;
    interval=setInterval(tick,200);tick();
  }
  function currentRoundPoints(){
    const s=KiwiSync.get();
    const q=window.KIWI_FEUD_BANK?.[s.questionIndex];
    if(!q)return 0;
    const base=(s.revealed||[]).reduce((sum,i)=>sum+(q.a?.[i]?.[1]||0),0);
    return base*(Number(s.multiplier)||1);
  }
  function awardCurrentQuestion(){
    if(!isHost||controller.mode==='faceoff'||controller.mode==='standard')return 0;
    const s=KiwiSync.get();
    if(s.roundAwarded)return 0;
    const points=currentRoundPoints();
    if(points<=0)return 0;
    const teamIndex=Math.max(0,Math.min(controller.team,s.teams.length-1));
    const teams=s.teams.map((team,i)=>i===teamIndex?{...team,score:(Number(team.score)||0)+points}:team);
    KiwiSync.set({teams,roundAwarded:true});
    controller.lastAward=points;
    window.KiwiAudio?.win?.();
    return points;
  }
  function tick(){
    if(!controller.running)return;
    controller.remaining=Math.max(0,Math.ceil((controller.endAt-Date.now())/1000));
    const nextMult=multiplierFor();
    const s=window.KiwiSync?.get?.();
    if(isHost&&s&&s.multiplier!==nextMult)window.KiwiSync.set({multiplier:nextMult});
    if(controller.remaining<=0){stop();window.KiwiAudio?.buzzer?.();advanceMode(true);return}
    if(controller.remaining<=5&&controller.remaining>0&&controller.remaining!==controller._lastTick){controller._lastTick=controller.remaining;window.KiwiAudio?.countdown?.()}
    render();broadcast();
  }
  function loadIndex(index,team=controller.team){
    KiwiSync.set({questionIndex:index,revealed:[],strikes:0,roundAwarded:false,activeTeam:team,controllingTeam:team,phase:'play',multiplier:1});
  }
  function nextTeam(){const s=KiwiSync.get();return (controller.team+1)%Math.max(2,s.teams.length)}
  function beginMode(mode){
    stop();
    const s=KiwiSync.get();controller={...controller,mode,step:0,question:0,round:controller.round+1,team:s.activeTeam||0,multiplierRamp:true,prepared:true,lastAward:0};
    if(mode==='faceoff'){loadIndex(randomMain(),controller.team);prepare(12)}
    else if(mode==='tie'){loadIndex(tieStart+(controller.question%Math.max(1,ties.length)),controller.team);prepare(15)}
    else if(mode==='fast'){loadIndex(fastStart,controller.team);prepare(20)}
    else if(mode==='speed'){loadIndex(randomMain(),controller.team);prepare(15)}
    else{prepare(20);controller.mode='standard'}
    render();broadcast();
  }
  function randomMain(){
    const max=syntheticStart;const s=KiwiSync.get();let i=Math.floor(Math.random()*Math.max(1,max));let guard=0;
    while((s.usedQuestions||[]).includes(i)&&guard++<20)i=Math.floor(Math.random()*Math.max(1,max));
    return i;
  }
  function advanceMode(autoContinue=false){
    if(!isHost)return;
    awardCurrentQuestion();
    let nextDuration=controller.duration;
    if(controller.mode==='faceoff'){
      if(controller.step===0){controller.step=1;controller.team=nextTeam();loadIndex(KiwiSync.get().questionIndex,controller.team);nextDuration=12}
      else{controller.step=2;prepare(12);render();broadcast();return}
    }else if(controller.mode==='tie'){
      controller.question=(controller.question+1)%Math.max(1,ties.length);controller.team=nextTeam();loadIndex(tieStart+controller.question,controller.team);nextDuration=15
    }else if(controller.mode==='fast'){
      controller.question++;
      if(controller.question<Math.min(5,fast.length)){loadIndex(fastStart+controller.question,controller.team);nextDuration=20}
      else{controller.question=0;controller.team=nextTeam();controller.step++;loadIndex(fastStart,controller.team);nextDuration=20}
    }else if(controller.mode==='speed'){
      controller.question++;controller.team=nextTeam();loadIndex(randomMain(),controller.team);nextDuration=controller.duration
    }else return;
    if(autoContinue)start(nextDuration);else prepare(nextDuration);
  }

  let panel,stage;
  function render(){
    const pct=controller.duration?Math.max(0,Math.min(100,controller.remaining/controller.duration*100)):0;
    if(panel){
      panel.querySelector('[data-mode-time]').textContent=fmt(controller.remaining);
      panel.querySelector('[data-mode-fill]').style.width=pct+'%';
      panel.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===controller.mode));
      const s=KiwiSync.get(),name=s.teams?.[controller.team]?.name||'Team';
      const stateLabel=controller.running?'Running':controller.prepared?'Ready — press Start':'Paused';
      const awarded=controller.lastAward?` · Last award +${controller.lastAward}`:'';
      panel.querySelector('[data-mode-status]').innerHTML=`<strong>${controller.mode==='standard'?'Standard game':controller.mode.replace(/^./,x=>x.toUpperCase())}</strong> · ${name} · Question ${controller.question+1} · ${stateLabel} · Multiplier ×${multiplierFor()}${awarded}`;
      panel.querySelector('#modeStart').textContent=controller.running?'⏸ Pause Mode':controller.prepared?'▶ Start Countdown':'▶ Continue Countdown';
    }
    if(stage){
      const s=KiwiSync.get(),name=s.teams?.[controller.team]?.name||'Team';
      stage.classList.toggle('show',controller.mode!=='standard');
      stage.querySelector('strong').textContent=controller.mode==='faceoff'?'Face-off':controller.mode==='tie'?'Tie-breaker':controller.mode==='fast'?'Fast Money':'Speed Round';
      stage.querySelector('b').textContent=fmt(controller.remaining);
      stage.querySelector('small').textContent=`${name} · Question ${controller.question+1} · ${controller.running?'Counting down':'Waiting for host'} · ×${multiplierFor()} points`;
    }
  }

  if(channel)channel.onmessage=e=>{if(e.data?.type==='modeState'&&!isHost){controller={...controller,...e.data.controller};render()}};

  if(isHost){
    panel=document.createElement('section');panel.className='panel mode-panel';
    panel.innerHTML=`<strong style="color:#ffd24b">🎮 Automatic Game Modes</strong>
      <div class="mode-grid"><button class="btn" data-mode="standard">Standard</button><button class="btn" data-mode="faceoff">Face-off</button><button class="btn" data-mode="tie">Tie-breaker</button><button class="btn" data-mode="fast">Fast Money</button><button class="btn" data-mode="speed">Speed Round</button></div>
      <div class="mode-clock"><div class="mode-time" data-mode-time>0:20</div><div><div class="mode-progress"><i data-mode-fill></i></div><div class="mode-status" data-mode-status>Choose a mode.</div></div><button class="btn green" id="modeStart">▶ Start Countdown</button></div>
      <div class="grid"><button class="btn" id="modeNext">Next Now</button><button class="btn red" id="modeStop">Stop Mode</button></div>
      <label class="field"><span>Timed multiplier</span><select id="modeRamp"><option value="on">Automatic ×1 → ×2 → ×3</option><option value="off">Keep ×1</option></select></label>
      <details><summary style="cursor:pointer;font-weight:900;color:#ffd24b">Game rules and mode flow</summary><div class="mode-rules"><article><strong>Automatic scoring:</strong> when a timed Tie-breaker, Fast Money or Speed Round question ends, all revealed-answer points are multiplied and added to the active team's score before the next question loads.</article><article><strong>Mode selection:</strong> choosing a mode prepares the question and timer but does not start the countdown. The host presses Start when everyone is ready.</article><article><strong>Face-off:</strong> each team gets a 12-second chance. Face-off answers choose control and are not automatically added as round points.</article><article><strong>Tie-breaker:</strong> one top-answer board, 15 seconds per team, then automatic scoring, team rotation and a new tie-breaker.</article><article><strong>Fast Money:</strong> five 20-second questions for one team, with each question scored automatically, then the game swaps to the next team.</article><article><strong>Speed Round:</strong> each timer cycle scores the revealed answers, then loads a new question and team.</article><article><strong>Timed multiplier:</strong> ×1 in the first third, ×2 in the middle third and ×3 in the final third.</article></div></details>`;
    const left=document.querySelector('.host-left-column')||document.querySelector('main');left.prepend(panel);
    panel.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(b.dataset.mode==='standard'){stop();setState({mode:'standard',remaining:20,duration:20,prepared:false,lastAward:0});KiwiSync.set({multiplier:1})}else beginMode(b.dataset.mode)});
    panel.querySelector('#modeStart').onclick=()=>controller.running?stop():start();
    panel.querySelector('#modeNext').onclick=()=>advanceMode(controller.running);
    panel.querySelector('#modeStop').onclick=()=>{stop();setState({mode:'standard',remaining:20,duration:20,prepared:false,lastAward:0});KiwiSync.set({multiplier:1})};
    panel.querySelector('#modeRamp').onchange=e=>{controller.multiplierRamp=e.target.value==='on';if(!controller.multiplierRamp)KiwiSync.set({multiplier:1});render();broadcast()};
  }else{
    const board=document.querySelector('.board')||document.querySelector('.shell')||document.body;board.style.position='relative';stage=document.createElement('div');stage.className='mode-stage';stage.innerHTML='<div class="mode-banner"><strong>Mode</strong><b>0:20</b><small>Waiting for host</small></div>';board.appendChild(stage);
  }
  render();
})();