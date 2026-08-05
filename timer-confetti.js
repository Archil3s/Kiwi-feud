(()=>{
  const isHost=document.title.includes('Host');
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-effects-v2'):null;
  const defaults={duration:15,remaining:15,running:false,endAt:0,label:'Speed Round',mode:'standard',autoNext:true,autoSwap:true,questionNo:1,transitioning:false};
  let timer={...defaults},tickId=null,lastSecond=null;

  const style=document.createElement('style');style.id='kiwiEffectsStyleV2';style.textContent=`
    @keyframes kConfetti{to{transform:translate(var(--drift),105vh) rotate(820deg);opacity:.12}}
    @keyframes kStrike{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-16deg)}42%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(5deg)}72%{transform:translate(-50%,-50%) scale(.94)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.03)}}
    @keyframes kPulse{50%{transform:scale(1.04);filter:drop-shadow(0 0 24px #ff334f)}}
    .kiwi-strike-layer{position:fixed;inset:0;z-index:31000;pointer-events:none;background:#05090fc8;backdrop-filter:blur(2px)}
    .kiwi-strike-x{position:absolute;left:50%;top:50%;font:1000 min(52vw,430px)/.8 Arial;color:#ef2946;text-shadow:0 8px 0 #781326,0 0 46px #ff183e;animation:kStrike 1.1s ease-out forwards}
    .timer-panel{position:static!important;padding:0!important;overflow:hidden;background:linear-gradient(145deg,#102f4e,#071b2d)!important;border:2px solid #ffd24b44!important}
    .speed-head{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:14px 15px;background:linear-gradient(90deg,#193f61,#102f4e)}
    .speed-head small{display:block;color:#9fb9ca;font-weight:900;text-transform:uppercase;letter-spacing:.09em}.speed-head h3{margin:2px 0 0;color:#fff;font-size:20px}.speed-clock{font-size:clamp(38px,5vw,58px);line-height:1;font-weight:1000;color:#ffd24b;font-variant-numeric:tabular-nums}
    .speed-progress{height:10px;background:#ffffff12}.speed-progress>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#36d47c,#ffd24b);transition:width .18s linear}.timer-panel.urgent .speed-progress>i{background:#ef2946}.timer-panel.urgent .speed-clock{color:#ff6077;animation:kPulse .55s infinite}
    .speed-team{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:12px 14px}.speed-team-card{background:#061b2d;border:1px solid #ffffff16;border-radius:12px;padding:10px;text-align:center}.speed-team-card small{display:block;color:#91adbf;font-size:10px;text-transform:uppercase;font-weight:900}.speed-team-card strong{display:block;margin-top:3px;color:#fff;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.speed-arrow{font-size:26px;color:#ffd24b}.speed-round-count{text-align:center;color:#a9c1d0;font-size:12px;font-weight:800}
    .speed-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:11px 13px}.speed-controls .btn{min-height:45px}.speed-settings{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 13px 11px}.speed-switches{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 13px 12px}.speed-state{padding:9px 12px;margin:0 13px 13px;border-radius:10px;background:#061b2d;text-align:center;color:#bdd0dc;font-size:12px}.speed-state strong{color:#ffd24b}
    .audience-timer{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:12000;background:#061b2df5;border:3px solid #ffd24b;border-radius:20px;padding:10px 18px;text-align:center;color:#fff;display:none;min-width:230px;box-shadow:0 18px 50px #0009}.audience-timer.show{display:block}.audience-timer.urgent{border-color:#ef2946;animation:kPulse .55s infinite}.audience-timer .bar{height:8px;background:#ffffff18;border-radius:999px;overflow:hidden;margin-top:8px}.audience-timer .fill{height:100%;background:#ffd24b;width:100%;transition:width .18s linear}.audience-team{font-size:13px;color:#fff;margin-top:5px;font-weight:900}
    .speed-flash{position:fixed;inset:0;z-index:30500;pointer-events:none;display:grid;place-items:center;background:#061b2df0;color:#fff;text-align:center;opacity:0;transition:.16s}.speed-flash.show{opacity:1}.speed-flash h2{font-size:clamp(30px,6vw,72px);margin:0;color:#ffd24b}.speed-flash p{font-size:clamp(16px,2vw,28px);margin:8px 0 0}
    @media(max-width:620px){.speed-team{grid-template-columns:1fr}.speed-arrow{transform:rotate(90deg);text-align:center}.speed-controls,.speed-settings,.speed-switches{grid-template-columns:1fr}.speed-head{padding:11px}.speed-clock{font-size:42px}}
  `;document.getElementById(style.id)?.remove();document.head.appendChild(style);

  const emit=(type,data={})=>{handle({type,...data});channel?.postMessage({type,...data})};
  if(channel)channel.onmessage=e=>handle(e.data);
  const state=()=>window.KiwiSync?.get?.()||{teams:[],activeTeam:0};
  const teamName=i=>state().teams?.[i]?.name||`Team ${i+1}`;
  const nextTeamIndex=()=>{const s=state(),n=Math.max(1,s.teams?.length||1);return ((s.activeTeam||0)+1)%n};
  const fmt=n=>`${Math.floor(n/60)}:${String(Math.max(0,n)%60).padStart(2,'0')}`;

  function burst(){const l=document.createElement('div');l.style.cssText='position:fixed;inset:0;z-index:30000;pointer-events:none;overflow:hidden';for(let i=0;i<55;i++){const p=document.createElement('span');p.textContent=['●','■','▲','★'][i%4];p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-20px;font-size:${10+Math.random()*15}px;color:hsl(${Math.random()*360} 88% 58%);animation:kConfetti ${.9+Math.random()*.7}s ${Math.random()*.15}s forwards`;p.style.setProperty('--drift',`${(Math.random()-.5)*200}px`);l.appendChild(p)}document.body.appendChild(l);setTimeout(()=>l.remove(),1900)}
  function strikeOverlay(){const l=document.createElement('div');l.className='kiwi-strike-layer';l.innerHTML='<div class="kiwi-strike-x">X</div>';document.body.appendChild(l);setTimeout(()=>l.remove(),1150)}
  function flash(title,sub){const f=document.createElement('div');f.className='speed-flash';f.innerHTML=`<div><h2>${title}</h2><p>${sub}</p></div>`;document.body.appendChild(f);requestAnimationFrame(()=>f.classList.add('show'));setTimeout(()=>f.classList.remove('show'),650);setTimeout(()=>f.remove(),850)}

  function stopLoop(){clearInterval(tickId);tickId=null}
  function startTimer(){if(timer.transitioning)return;timer.running=true;timer.endAt=Date.now()+Math.max(0,timer.remaining)*1000;stopLoop();tickId=setInterval(syncTimer,180);lastSecond=null;syncTimer()}
  function pauseTimer(){if(timer.running)timer.remaining=Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));timer.running=false;stopLoop();syncTimer()}
  function resetTimer(){timer.running=false;timer.transitioning=false;stopLoop();timer.remaining=timer.duration;lastSecond=null;syncTimer()}
  function setDuration(v){timer.duration=Math.max(5,Number(v)||15);timer.remaining=timer.duration;timer.running=false;stopLoop();lastSecond=null;syncTimer()}
  function swapTeam(){const s=state(),next=nextTeamIndex();window.KiwiSync?.set?.({activeTeam:next,controllingTeam:next,strikes:0});return teamName(next)}

  function advanceSpeedRound(){
    if(!isHost||timer.transitioning)return;
    timer.transitioning=true;timer.running=false;stopLoop();
    const incoming=timer.autoSwap?teamName(nextTeamIndex()):teamName(state().activeTeam||0);
    flash('Next question!',`${incoming} — get ready`);
    setTimeout(()=>{
      if(timer.autoSwap)swapTeam();
      window.nextQuestion?.();
      timer.questionNo+=1;timer.remaining=timer.duration;timer.transitioning=false;
      if(timer.autoNext)startTimer();else syncTimer();
    },720);
  }

  function syncTimer(){
    if(timer.running)timer.remaining=Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));
    if(timer.running&&timer.remaining!==lastSecond){lastSecond=timer.remaining;if(timer.remaining<=5&&timer.remaining>0)window.KiwiAudio?.countdown?.()}
    if(timer.running&&timer.remaining<=0){timer.running=false;stopLoop();window.KiwiAudio?.buzzer?.();emit('strikeVisual');if(timer.mode==='speed')setTimeout(advanceSpeedRound,1150)}
    render();if(isHost)channel?.postMessage({type:'timerState',timer,team:teamName(state().activeTeam||0),nextTeam:teamName(nextTeamIndex())});
  }

  let hostBox,audienceBox;
  function render(){
    const pct=Math.max(0,Math.min(100,(timer.remaining/timer.duration)*100)),current=teamName(state().activeTeam||0),next=teamName(nextTeamIndex());
    if(hostBox){hostBox.querySelector('[data-time]').textContent=fmt(timer.remaining);hostBox.querySelector('.speed-progress i').style.width=pct+'%';hostBox.classList.toggle('urgent',timer.remaining<=5&&timer.running);hostBox.querySelector('[data-current]').textContent=current;hostBox.querySelector('[data-next]').textContent=next;hostBox.querySelector('[data-qno]').textContent=`Question ${timer.questionNo}`;hostBox.querySelector('[data-speedstate]').innerHTML=timer.mode==='speed'?`<strong>${timer.running?'Live':'Ready'}:</strong> ${timer.autoNext?'auto-next':'manual next'} • ${timer.autoSwap?'team rotates':'same team'}`:'Standard countdown';hostBox.querySelector('#timerStart').textContent=timer.running?'▶ Running':'▶ Start';}
    if(audienceBox){audienceBox.querySelector('[data-time]').textContent=fmt(timer.remaining);audienceBox.querySelector('[data-label]').textContent=timer.label;audienceBox.querySelector('[data-team]').textContent=current;audienceBox.querySelector('.fill').style.width=pct+'%';audienceBox.classList.toggle('show',timer.running||timer.remaining!==timer.duration||timer.mode==='speed');audienceBox.classList.toggle('urgent',timer.remaining<=5&&timer.running)}
  }
  function handle(msg){if(msg.type==='confetti')burst();if(msg.type==='strikeVisual')strikeOverlay();if(msg.type==='timerState'&&!isHost){timer={...timer,...msg.timer};render()}}

  if(isHost){
    const panel=document.createElement('section');panel.className='timer-panel panel';panel.innerHTML=`
      <div class="speed-head"><div><small>Automatic game flow</small><h3>⚡ Speed Round Control</h3></div><div class="speed-clock" data-time>0:15</div></div>
      <div class="speed-progress"><i></i></div>
      <div class="speed-team"><div class="speed-team-card"><small>Playing now</small><strong data-current>—</strong></div><div class="speed-arrow">➜</div><div class="speed-team-card"><small>Up next</small><strong data-next>—</strong></div></div>
      <div class="speed-round-count" data-qno>Question 1</div>
      <div class="speed-settings"><label class="field"><span>Seconds per question</span><select id="roundTimerLength"><option value="10">10 seconds</option><option value="15" selected>15 seconds</option><option value="20">20 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option></select></label><label class="field"><span>Mode</span><select id="roundTimerLabel"><option>Speed Round</option><option>Tie-breaker</option><option>Face-off</option><option>Team answer</option><option>Fast Money</option></select></label></div>
      <div class="speed-switches"><button class="btn gold" id="speedMode">⚡ Speed Round On</button><button class="btn green" id="speedAuto">➡ Auto-next On</button><button class="btn green" id="speedSwap">🔄 Team swap On</button><button class="btn" id="speedNext">⏭ Next now</button></div>
      <div class="speed-controls"><button class="btn green" id="timerStart">▶ Start</button><button class="btn" id="timerPause">⏸ Pause</button><button class="btn ghost" id="timerReset">↺ Reset</button></div>
      <div class="speed-state" data-speedstate><strong>Ready:</strong> auto-next • team rotates</div>`;
    const left=document.querySelector('.host-left-column');if(left)left.prepend(panel);else document.querySelector('main')?.appendChild(panel);hostBox=panel;
    const duration=panel.querySelector('#roundTimerLength'),label=panel.querySelector('#roundTimerLabel'),speed=panel.querySelector('#speedMode'),auto=panel.querySelector('#speedAuto'),swap=panel.querySelector('#speedSwap');
    duration.onchange=e=>setDuration(e.target.value);
    label.onchange=e=>{timer.label=e.target.value;timer.mode=e.target.value==='Speed Round'?'speed':'standard';speed.textContent=timer.mode==='speed'?'⚡ Speed Round On':'⚡ Enable Speed Round';speed.classList.toggle('gold',timer.mode==='speed');syncTimer()};
    speed.onclick=()=>{timer.mode=timer.mode==='speed'?'standard':'speed';timer.label=timer.mode==='speed'?'Speed Round':'Team answer';label.value=timer.label;speed.textContent=timer.mode==='speed'?'⚡ Speed Round On':'⚡ Enable Speed Round';speed.classList.toggle('gold',timer.mode==='speed');syncTimer()};
    auto.onclick=()=>{timer.autoNext=!timer.autoNext;auto.textContent=`➡ Auto-next ${timer.autoNext?'On':'Off'}`;auto.classList.toggle('green',timer.autoNext);syncTimer()};
    swap.onclick=()=>{timer.autoSwap=!timer.autoSwap;swap.textContent=`🔄 Team swap ${timer.autoSwap?'On':'Off'}`;swap.classList.toggle('green',timer.autoSwap);syncTimer()};
    panel.querySelector('#timerStart').onclick=startTimer;panel.querySelector('#timerPause').onclick=pauseTimer;panel.querySelector('#timerReset').onclick=resetTimer;panel.querySelector('#speedNext').onclick=advanceSpeedRound;

    const baseReveal=window.reveal;if(typeof baseReveal==='function')window.reveal=function(i){const s=state();if(s.roundAwarded||(s.revealed||[]).includes(i))return;baseReveal(i);setTimeout(()=>{window.KiwiAudio?.correct?.();emit('confetti')},35)};
    const baseStrike=window.strike;if(typeof baseStrike==='function')window.strike=function(){const before=state().strikes||0;baseStrike();setTimeout(()=>{const after=state().strikes||0;if(after>before||state().phase==='steal')emit('strikeVisual')},25)};
    window.KiwiSpeedRound={start:startTimer,pause:pauseTimer,reset:resetTimer,next:advanceSpeedRound};
  }else{
    audienceBox=document.createElement('div');audienceBox.className='audience-timer';audienceBox.innerHTML='<div data-label style="font-weight:1000;color:#ffd24b;font-size:13px;text-transform:uppercase">Speed Round</div><div data-time style="font-weight:1000;font-size:48px;line-height:1">0:15</div><div class="audience-team" data-team>Team</div><div class="bar"><div class="fill"></div></div>';document.body.appendChild(audienceBox);
  }
  render();
})();