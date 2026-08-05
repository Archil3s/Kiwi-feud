(()=>{
  const isHost=document.title.includes('Host');
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-effects-v1'):null;
  let timer={duration:20,remaining:20,running:false,endAt:0,label:'Tie-breaker',mode:'standard',autoNext:false};
  let tickId=null,lastSecond=null;

  const send=(type,data={})=>{handle({type,...data});channel?.postMessage({type,...data})};
  channel&&(channel.onmessage=e=>handle(e.data));

  const style=document.createElement('style');
  style.id='kiwiEffectsStyle';
  style.textContent=`
    @keyframes kiwiConfetti{to{transform:translate(var(--drift),105vh) rotate(820deg);opacity:.15}}
    @keyframes kiwiStrikeIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-18deg)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.18) rotate(6deg)}70%{transform:translate(-50%,-50%) scale(.94) rotate(-3deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.06) rotate(0)}}
    @keyframes kiwiPulse{50%{transform:scale(1.06);filter:drop-shadow(0 0 28px #ff334f)}}
    .kiwi-strike-layer{position:fixed;inset:0;z-index:31000;pointer-events:none;background:#05090fcf;backdrop-filter:blur(2px)}
    .kiwi-strike-x{position:absolute;left:50%;top:50%;font:1000 min(52vw,430px)/.8 Arial,sans-serif;color:#ef2946;text-shadow:0 8px 0 #781326,0 0 46px #ff183e;animation:kiwiStrikeIn 1.15s ease-out forwards}
    .timer-panel{position:static!important}.speed-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.speed-status{padding:9px;border-radius:10px;background:#061b2d;color:#bcd1de;font-size:12px;text-align:center}.speed-status strong{color:#ffd24b}
    .audience-timer{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:12000;background:#061b2df5;border:3px solid #ffd24b;border-radius:20px;padding:10px 18px;text-align:center;color:#fff;display:none;min-width:190px;box-shadow:0 18px 50px #0009}
    .audience-timer.show{display:block}.audience-timer.urgent{border-color:#ef2946;animation:kiwiPulse .55s infinite}.audience-timer .bar{height:8px;background:#ffffff18;border-radius:999px;overflow:hidden;margin-top:8px}.audience-timer .fill{height:100%;background:#ffd24b;width:100%;transition:width .2s linear}.audience-timer.urgent .fill{background:#ef2946}
    .speed-flash{position:fixed;inset:0;z-index:30500;pointer-events:none;display:grid;place-items:center;background:#061b2df2;color:#fff;text-align:center;opacity:0;transition:.18s}.speed-flash.show{opacity:1}.speed-flash h2{font-size:clamp(28px,6vw,70px);margin:0;color:#ffd24b}.speed-flash p{font-size:clamp(16px,2vw,28px);margin:8px 0 0}
  `;
  document.getElementById(style.id)?.remove();document.head.appendChild(style);

  function burst(){
    const layer=document.createElement('div');layer.style.cssText='position:fixed;inset:0;z-index:30000;pointer-events:none;overflow:hidden';
    const chars=['●','■','▲','★','◆'];
    for(let i=0;i<70;i++){
      const p=document.createElement('span');p.textContent=chars[i%chars.length];
      const x=Math.random()*100,drift=(Math.random()-.5)*220,delay=Math.random()*.16,dur=.9+Math.random()*.75;
      p.style.cssText=`position:absolute;left:${x}%;top:-24px;font-size:${10+Math.random()*17}px;color:hsl(${Math.random()*360} 88% 58%);transform:rotate(${Math.random()*360}deg);animation:kiwiConfetti ${dur}s ${delay}s cubic-bezier(.18,.7,.3,1) forwards`;
      p.style.setProperty('--drift',`${drift}px`);layer.appendChild(p);
    }
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),2100);
  }

  function strikeOverlay(){
    const old=document.querySelector('.kiwi-strike-layer');old?.remove();
    const layer=document.createElement('div');layer.className='kiwi-strike-layer';layer.innerHTML='<div class="kiwi-strike-x">X</div>';
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),1200);
  }

  function flashNextQuestion(){
    const f=document.createElement('div');f.className='speed-flash';f.innerHTML='<div><h2>Next question!</h2><p>Get ready…</p></div>';document.body.appendChild(f);
    requestAnimationFrame(()=>f.classList.add('show'));setTimeout(()=>f.classList.remove('show'),650);setTimeout(()=>f.remove(),900);
  }

  function nextSpeedQuestion(){
    if(!isHost||timer.mode!=='speed'||!timer.autoNext)return;
    flashNextQuestion();
    setTimeout(()=>{
      window.nextQuestion?.();
      timer.remaining=timer.duration;timer.endAt=Date.now()+timer.duration*1000;timer.running=true;lastSecond=null;syncTimer();
    },650);
  }

  function syncTimer(){
    if(timer.running)timer.remaining=Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));
    if(timer.running&&timer.remaining!==lastSecond){
      lastSecond=timer.remaining;
      if(timer.remaining<=5&&timer.remaining>0)window.KiwiAudio?.countdown?.();
    }
    if(timer.remaining<=0&&timer.running){
      timer.running=false;clearInterval(tickId);tickId=null;window.KiwiAudio?.buzzer?.();send('strikeVisual');
      if(timer.mode==='speed'&&timer.autoNext)setTimeout(nextSpeedQuestion,450);
    }
    renderTimer();
    if(isHost)channel?.postMessage({type:'timerState',timer});
  }
  function startTimer(){timer.running=true;timer.endAt=Date.now()+timer.remaining*1000;clearInterval(tickId);tickId=setInterval(syncTimer,200);lastSecond=null;syncTimer()}
  function pauseTimer(){syncTimer();timer.running=false;clearInterval(tickId);tickId=null;syncTimer()}
  function resetTimer(){timer.running=false;clearInterval(tickId);tickId=null;timer.remaining=timer.duration;lastSecond=null;syncTimer()}
  function setDuration(v){timer.duration=Number(v)||20;timer.remaining=timer.duration;timer.running=false;clearInterval(tickId);tickId=null;lastSecond=null;syncTimer()}
  function fmt(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}

  let hostBox,audienceBox;
  function renderTimer(){
    const text=fmt(timer.remaining),pct=Math.max(0,Math.min(100,(timer.remaining/timer.duration)*100));
    if(hostBox){hostBox.querySelector('[data-time]').textContent=text;hostBox.classList.toggle('urgent',timer.remaining<=5);hostBox.querySelector('[data-speedstate]').innerHTML=timer.mode==='speed'?`<strong>Speed round:</strong> ${timer.autoNext?'auto-next is on':'manual next question'}`:'Standard countdown';}
    if(audienceBox){audienceBox.querySelector('[data-time]').textContent=text;audienceBox.querySelector('[data-label]').textContent=timer.label;audienceBox.querySelector('.fill').style.width=pct+'%';audienceBox.classList.toggle('show',timer.running||timer.remaining!==timer.duration);audienceBox.classList.toggle('urgent',timer.remaining<=5)}
  }
  function handle(msg){
    if(msg.type==='confetti')burst();
    if(msg.type==='strikeVisual')strikeOverlay();
    if(msg.type==='timerState'&&!isHost){timer={...timer,...msg.timer};renderTimer()}
  }

  if(isHost){
    const panel=document.createElement('section');panel.className='timer-panel panel';
    panel.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><strong style="color:#ffd24b">⏱ Round Timer</strong><strong data-time style="font-size:30px">0:20</strong></div>
      <div class="grid"><div class="field"><label>Timer length</label><select id="roundTimerLength"><option value="10">10 seconds</option><option value="15">15 seconds</option><option value="20" selected>20 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option><option value="90">90 seconds</option></select></div><div class="field"><label>Round type</label><select id="roundTimerLabel"><option>Tie-breaker</option><option>Face-off</option><option>Team answer</option><option>Speed Round</option><option>Fast Money</option><option>Custom round</option></select></div></div>
      <div class="speed-row"><button class="btn" id="speedMode">⚡ Enable Speed Round</button><button class="btn" id="speedAuto">➡ Auto-next: Off</button></div>
      <div class="grid"><button class="btn green" id="timerStart">▶ Start</button><button class="btn" id="timerPause">⏸ Pause</button></div>
      <div class="grid"><button class="btn ghost" id="timerReset">↺ Reset</button><button class="btn gold" id="timerConfetti">🎉 Confetti</button></div>
      <div class="speed-status" data-speedstate>Standard countdown</div>
      <div class="status">Speed Round can automatically load a fresh question whenever the timer reaches zero.</div>`;
    const sound=document.querySelector('.soundboard-panel');if(sound)sound.before(panel);else document.querySelector('main')?.appendChild(panel);hostBox=panel;
    const duration=panel.querySelector('#roundTimerLength'),label=panel.querySelector('#roundTimerLabel'),speed=panel.querySelector('#speedMode'),auto=panel.querySelector('#speedAuto');
    duration.onchange=e=>setDuration(e.target.value);
    label.onchange=e=>{timer.label=e.target.value;if(e.target.value==='Speed Round'){timer.mode='speed';speed.textContent='⚡ Speed Round On';speed.classList.add('gold')}syncTimer()};
    speed.onclick=()=>{timer.mode=timer.mode==='speed'?'standard':'speed';speed.textContent=timer.mode==='speed'?'⚡ Speed Round On':'⚡ Enable Speed Round';speed.classList.toggle('gold',timer.mode==='speed');if(timer.mode==='speed')label.value='Speed Round';syncTimer()};
    auto.onclick=()=>{timer.autoNext=!timer.autoNext;auto.textContent=`➡ Auto-next: ${timer.autoNext?'On':'Off'}`;auto.classList.toggle('green',timer.autoNext);syncTimer()};
    panel.querySelector('#timerStart').onclick=startTimer;panel.querySelector('#timerPause').onclick=pauseTimer;panel.querySelector('#timerReset').onclick=resetTimer;panel.querySelector('#timerConfetti').onclick=()=>send('confetti');

    const baseReveal=window.reveal;
    if(typeof baseReveal==='function')window.reveal=function(i){const s=KiwiSync.get();if(s.roundAwarded||(s.revealed||[]).includes(i))return;baseReveal(i);setTimeout(()=>{window.KiwiAudio?.correct?.();send('confetti')},40)};
    const baseStrike=window.strike;
    if(typeof baseStrike==='function')window.strike=function(){const before=KiwiSync.get().strikes||0;baseStrike();setTimeout(()=>{const after=KiwiSync.get().strikes||0;if(after>before||KiwiSync.get().phase==='steal')send('strikeVisual')},25)};
  }else{
    audienceBox=document.createElement('div');audienceBox.className='audience-timer';audienceBox.innerHTML='<div data-label style="font-weight:1000;color:#ffd24b;font-size:13px;text-transform:uppercase">Tie-breaker</div><div data-time style="font-weight:1000;font-size:44px;line-height:1">0:20</div><div class="bar"><div class="fill"></div></div>';document.body.appendChild(audienceBox);
  }
  renderTimer();
})();