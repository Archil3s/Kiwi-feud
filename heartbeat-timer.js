(()=>{
  const isHost=document.title.includes('Host');
  const modeChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-modes-v1'):null;
  const beatChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-heartbeat-v1'):null;
  const storageKey='kiwi-feud-heartbeat-enabled';
  let enabled=localStorage.getItem(storageKey)!=='off';
  let timerState={running:false,remaining:0,duration:20,mode:'standard'};
  let audioCtx=null,nextBeatAt=0,raf=0;

  function ensureAudio(){
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    return audioCtx;
  }
  function thump(){
    if(isHost||!enabled||!timerState.running||timerState.mode==='standard')return;
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
    document.querySelector('.mode-stage,.audience-timer-inline')?.classList.add('heartbeat-pulse');
    setTimeout(()=>document.querySelectorAll('.heartbeat-pulse').forEach(x=>x.classList.remove('heartbeat-pulse')),330);
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
    if(timerState.running&&timerState.mode!=='standard'&&now>=nextBeatAt){thump();nextBeatAt=now+intervalMs()}
    if(!timerState.running)nextBeatAt=0;
    raf=requestAnimationFrame(loop);
  }

  const style=document.createElement('style');
  style.textContent=`
    @keyframes heartbeatTimerPulse{0%,100%{transform:scale(1)}18%{transform:scale(1.025)}36%{transform:scale(1)}52%{transform:scale(1.014)}70%{transform:scale(1)}}
    .heartbeat-pulse{animation:heartbeatTimerPulse .34s ease-out!important}
    .heartbeat-setting{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:10px;background:#061b2d;color:#c9dce8}
    .heartbeat-setting button.on{background:#238b59}
  `;
  document.head.appendChild(style);

  function applyEnabled(value,broadcast=true){
    enabled=!!value;localStorage.setItem(storageKey,enabled?'on':'off');
    document.querySelectorAll('[data-heartbeat-toggle]').forEach(b=>{b.classList.toggle('on',enabled);b.textContent=enabled?'💓 Heartbeat On':'♡ Heartbeat Off'});
    if(broadcast)beatChannel?.postMessage({type:'enabled',enabled});
  }
  beatChannel&&(beatChannel.onmessage=e=>{if(e.data?.type==='enabled')applyEnabled(e.data.enabled,false);if(e.data?.type==='test'&&!isHost){ensureAudio();thump()}});
  modeChannel&&(modeChannel.onmessage=e=>{
    if(e.data?.type!=='modeState')return;
    const c=e.data.controller||{};
    timerState={running:!!c.running,remaining:Number(c.remaining)||0,duration:Number(c.duration)||20,mode:c.mode||'standard'};
    if(!timerState.running)nextBeatAt=0;
  });

  addEventListener('pointerdown',ensureAudio,{once:true,capture:true});
  requestAnimationFrame(loop);

  if(isHost){
    const mount=()=>{
      const panel=document.querySelector('.mode-panel');if(!panel||panel.querySelector('.heartbeat-setting'))return false;
      const row=document.createElement('div');row.className='heartbeat-setting';
      row.innerHTML='<span><strong>Timer heartbeat</strong><br><small>Thumps faster as time runs out on the audience screen.</small></span><div style="display:flex;gap:7px"><button class="btn" data-heartbeat-test>Test</button><button class="btn" data-heartbeat-toggle></button></div>';
      const details=panel.querySelector('details');details?panel.insertBefore(row,details):panel.appendChild(row);
      row.querySelector('[data-heartbeat-toggle]').onclick=()=>applyEnabled(!enabled);
      row.querySelector('[data-heartbeat-test]').onclick=()=>{beatChannel?.postMessage({type:'test'});window.KiwiAudio?.countdown?.()};
      applyEnabled(enabled,false);return true;
    };
    if(!mount()){const obs=new MutationObserver(()=>{if(mount())obs.disconnect()});obs.observe(document.body,{childList:true,subtree:true})}
  }
})();