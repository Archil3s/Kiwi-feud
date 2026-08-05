(()=>{
  const isHost=document.title.includes('Host');
  const modeChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-modes-v1'):null;
  const beatChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-heartbeat-v1'):null;
  const storageKey='kiwi-feud-heartbeat-enabled';
  let enabled=localStorage.getItem(storageKey)!=='off';
  let timerState={running:false,remaining:0,duration:20,mode:'standard'};
  let audioCtx=null,nextBeatAt=0;

  function ensureAudio(){
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    return audioCtx;
  }

  const style=document.createElement('style');
  style.textContent=`
    @keyframes heartbeatTimerPulse{
      0%,100%{filter:none;box-shadow:inherit}
      16%{filter:brightness(1.3) saturate(1.3);box-shadow:0 0 0 4px #ff466455,0 0 36px #ff294faa}
      34%{filter:none;box-shadow:inherit}
      50%{filter:brightness(1.18) saturate(1.18);box-shadow:0 0 0 2px #ff46643d,0 0 22px #ff294f78}
      70%{filter:none;box-shadow:inherit}
    }
    @keyframes heartbeatNumberPulse{
      0%{transform:scale(.96)}
      14%{transform:scale(1.28)}
      30%{transform:scale(.98)}
      47%{transform:scale(1.16)}
      66%{transform:scale(1)}
      100%{transform:scale(1)}
    }
    .heartbeat-pulse{animation:heartbeatTimerPulse .46s ease-out!important}
    .heartbeat-number-pulse{
      display:inline-block!important;
      position:relative!important;
      z-index:4!important;
      transform-origin:center center!important;
      will-change:transform!important;
      animation:heartbeatNumberPulse .46s cubic-bezier(.2,.9,.25,1.15)!important;
    }
    .heartbeat-setting{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:10px;background:#061b2d;color:#c9dce8}
    .heartbeat-setting button.on{background:#238b59}
    @media(prefers-reduced-motion:reduce){.heartbeat-pulse,.heartbeat-number-pulse{animation:none!important}}
  `;
  document.head.appendChild(style);

  function visible(elements){return [...elements].filter(el=>el&&el.getClientRects().length)}
  function timerNumbers(){
    return visible(document.querySelectorAll([
      '.mode-stage b',
      '[data-mode-time]',
      '.mode-time',
      '.audience-timer-inline strong',
      '.audience-timer-inline b',
      '.speed-time',
      '[data-speed-time]',
      '.timer-value',
      '.countdown-value'
    ].join(',')));
  }

  function pulseVisual(){
    const containers=visible(document.querySelectorAll('.mode-banner,.audience-timer-inline,.mode-clock,.speed-round-control,.timer-panel'));
    const numbers=timerNumbers();
    containers.forEach(el=>{el.classList.remove('heartbeat-pulse');void el.offsetWidth;el.classList.add('heartbeat-pulse')});
    numbers.forEach(el=>{el.classList.remove('heartbeat-number-pulse');void el.offsetWidth;el.classList.add('heartbeat-number-pulse')});
    setTimeout(()=>{
      containers.forEach(el=>el.classList.remove('heartbeat-pulse'));
      numbers.forEach(el=>el.classList.remove('heartbeat-number-pulse'));
    },500);
  }

  function playThump(force=false){
    if(!force&&(isHost||!enabled||!timerState.running||timerState.mode==='standard'))return;
    pulseVisual();
    if(isHost)return;
    if(window.KiwiAudio?.isEnabled&&!window.KiwiAudio.isEnabled())return;
    const ctx=ensureAudio(),now=ctx.currentTime;
    const hit=(when,freq,volume,duration)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
      osc.type='sine';osc.frequency.setValueAtTime(freq,when);osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.58),when+duration);
      filter.type='lowpass';filter.frequency.value=170;
      gain.gain.setValueAtTime(.001,when);gain.gain.exponentialRampToValueAtTime(volume,when+.012);gain.gain.exponentialRampToValueAtTime(.001,when+duration);
      osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(when);osc.stop(when+duration+.03);
    };
    hit(now,78,.24,.19);hit(now+.19,64,.17,.16);
  }

  function intervalMs(){
    const ratio=timerState.duration?timerState.remaining/timerState.duration:1;
    if(timerState.remaining<=5)return 430;
    if(ratio<=.25)return 590;
    if(ratio<=.5)return 820;
    return 1120;
  }

  function loop(now){
    if(!nextBeatAt)nextBeatAt=now+250;
    if(timerState.running&&timerState.mode!=='standard'&&now>=nextBeatAt){playThump();nextBeatAt=now+intervalMs()}
    if(!timerState.running)nextBeatAt=0;
    requestAnimationFrame(loop);
  }

  function applyEnabled(value,broadcast=true){
    enabled=!!value;localStorage.setItem(storageKey,enabled?'on':'off');
    document.querySelectorAll('[data-heartbeat-toggle]').forEach(b=>{b.classList.toggle('on',enabled);b.textContent=enabled?'💓 Heartbeat On':'♡ Heartbeat Off'});
    if(broadcast)beatChannel?.postMessage({type:'enabled',enabled});
  }

  if(beatChannel)beatChannel.onmessage=e=>{
    if(e.data?.type==='enabled')applyEnabled(e.data.enabled,false);
    if(e.data?.type==='test')playThump(true);
  };

  if(modeChannel)modeChannel.onmessage=e=>{
    if(e.data?.type!=='modeState')return;
    const c=e.data.controller||{};
    timerState={running:!!c.running,remaining:Number(c.remaining)||0,duration:Number(c.duration)||20,mode:c.mode||'standard'};
    if(!timerState.running)nextBeatAt=0;
  };

  addEventListener('pointerdown',ensureAudio,{once:true,capture:true});
  requestAnimationFrame(loop);

  if(isHost){
    const mount=()=>{
      const panel=document.querySelector('.mode-panel');if(!panel||panel.querySelector('.heartbeat-setting'))return false;
      const row=document.createElement('div');row.className='heartbeat-setting';
      row.innerHTML='<span><strong>Timer heartbeat</strong><br><small>Countdown text visibly contracts and expands with each double thump.</small></span><div style="display:flex;gap:7px"><button class="btn" data-heartbeat-test>Test</button><button class="btn" data-heartbeat-toggle></button></div>';
      const details=panel.querySelector('details');details?panel.insertBefore(row,details):panel.appendChild(row);
      row.querySelector('[data-heartbeat-toggle]').onclick=()=>applyEnabled(!enabled);
      row.querySelector('[data-heartbeat-test]').onclick=()=>{pulseVisual();beatChannel?.postMessage({type:'test'})};
      applyEnabled(enabled,false);return true;
    };
    if(!mount()){const obs=new MutationObserver(()=>{if(mount())obs.disconnect()});obs.observe(document.body,{childList:true,subtree:true})}
  }
})();