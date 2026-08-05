(()=>{
  const isHost=document.title.includes('Host');
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-effects-v1'):null;
  let timer={duration:20,remaining:20,running:false,endAt:0,label:'Tie-breaker'};
  let tickId=null;

  const send=(type,data={})=>{handle({type,...data});channel?.postMessage({type,...data})};
  channel&&(channel.onmessage=e=>handle(e.data));

  function burst(){
    const layer=document.createElement('div');
    layer.style.cssText='position:fixed;inset:0;z-index:30000;pointer-events:none;overflow:hidden';
    const chars=['●','■','▲','★','◆'];
    for(let i=0;i<70;i++){
      const p=document.createElement('span');
      p.textContent=chars[i%chars.length];
      const x=Math.random()*100,drift=(Math.random()-.5)*220,delay=Math.random()*.16,dur=.9+Math.random()*.75;
      p.style.cssText=`position:absolute;left:${x}%;top:-24px;font-size:${10+Math.random()*17}px;color:hsl(${Math.random()*360} 88% 58%);transform:rotate(${Math.random()*360}deg);animation:kiwiConfetti ${dur}s ${delay}s cubic-bezier(.18,.7,.3,1) forwards`;
      p.style.setProperty('--drift',`${drift}px`);layer.appendChild(p);
    }
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),2100);
  }
  if(!document.getElementById('kiwiConfettiStyle')){
    const s=document.createElement('style');s.id='kiwiConfettiStyle';s.textContent='@keyframes kiwiConfetti{to{transform:translate(var(--drift),105vh) rotate(820deg);opacity:.15}}';document.head.appendChild(s);
  }

  function syncTimer(){
    if(timer.running)timer.remaining=Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));
    if(timer.remaining<=0&&timer.running){timer.running=false;window.KiwiAudio?.buzzer?.();}
    renderTimer();
    if(isHost)channel?.postMessage({type:'timerState',timer});
  }
  function startTimer(){timer.running=true;timer.endAt=Date.now()+timer.remaining*1000;clearInterval(tickId);tickId=setInterval(syncTimer,250);syncTimer()}
  function pauseTimer(){syncTimer();timer.running=false;clearInterval(tickId);tickId=null;syncTimer()}
  function resetTimer(){timer.running=false;clearInterval(tickId);tickId=null;timer.remaining=timer.duration;syncTimer()}
  function setDuration(v){timer.duration=Number(v)||20;timer.remaining=timer.duration;timer.running=false;clearInterval(tickId);tickId=null;syncTimer()}
  function fmt(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}

  let hostBox,audienceBox;
  function renderTimer(){
    const text=fmt(timer.remaining);
    if(hostBox){hostBox.querySelector('[data-time]').textContent=text;hostBox.classList.toggle('urgent',timer.remaining<=5)}
    if(audienceBox){audienceBox.querySelector('[data-time]').textContent=text;audienceBox.querySelector('[data-label]').textContent=timer.label;audienceBox.classList.toggle('show',timer.running||timer.remaining!==timer.duration);audienceBox.classList.toggle('urgent',timer.remaining<=5)}
  }
  function handle(msg){
    if(msg.type==='confetti')burst();
    if(msg.type==='timerState'&&!isHost){timer={...timer,...msg.timer};renderTimer()}
  }

  if(isHost){
    const panel=document.createElement('section');panel.className='timer-panel panel';
    panel.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><strong style="color:#ffd24b">⏱ Round & Tie-breaker Timer</strong><strong data-time style="font-size:30px">0:20</strong></div><div class="grid"><div class="field"><label>Timer length</label><select id="roundTimerLength"><option value="10">10 seconds</option><option value="15">15 seconds</option><option value="20" selected>20 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option><option value="90">90 seconds</option></select></div><div class="field"><label>Round type</label><select id="roundTimerLabel"><option>Tie-breaker</option><option>Face-off</option><option>Team answer</option><option>Fast Money</option><option>Custom round</option></select></div></div><div class="grid"><button class="btn green" id="timerStart">▶ Start</button><button class="btn" id="timerPause">⏸ Pause</button></div><div class="grid"><button class="btn ghost" id="timerReset">↺ Reset</button><button class="btn gold" id="timerConfetti">🎉 Confetti</button></div><div class="status">Suggested: 10–15 sec face-off, 20 sec tie-breaker, 30–45 sec team answer, 60 sec Fast Money.</div>`;
    const sound=document.querySelector('.soundboard-panel');
    if(sound)sound.before(panel);else document.querySelector('main')?.appendChild(panel);
    hostBox=panel;
    panel.querySelector('#roundTimerLength').onchange=e=>setDuration(e.target.value);
    panel.querySelector('#roundTimerLabel').onchange=e=>{timer.label=e.target.value;syncTimer()};
    panel.querySelector('#timerStart').onclick=startTimer;panel.querySelector('#timerPause').onclick=pauseTimer;panel.querySelector('#timerReset').onclick=resetTimer;panel.querySelector('#timerConfetti').onclick=()=>send('confetti');

    const baseReveal=window.reveal;
    if(typeof baseReveal==='function')window.reveal=function(i){
      const s=KiwiSync.get();if(s.roundAwarded||(s.revealed||[]).includes(i))return;
      baseReveal(i);setTimeout(()=>{window.KiwiAudio?.correct?.();send('confetti')},40);
    };
  }else{
    audienceBox=document.createElement('div');audienceBox.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:12000;background:#061b2df2;border:3px solid #ffd24b;border-radius:18px;padding:10px 18px;text-align:center;color:#fff;display:none;min-width:180px;box-shadow:0 18px 50px #0009';
    audienceBox.innerHTML='<div data-label style="font-weight:1000;color:#ffd24b;font-size:13px;text-transform:uppercase">Tie-breaker</div><div data-time style="font-weight:1000;font-size:44px;line-height:1">0:20</div>';
    document.body.appendChild(audienceBox);audienceBox.classList.toggle=function(name,on){if(name==='show')this.style.display=on?'block':'none';else HTMLElement.prototype.classList.toggle.call(this.classList,name,on)};
  }
  renderTimer();
})();