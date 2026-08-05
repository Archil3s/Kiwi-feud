(()=>{
  const isHost=document.title.includes('Host');
  const modeChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-modes-v1'):null;
  const timerChannel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-effects-v1'):null;
  let active={running:false,duration:20,remaining:20,mode:'standard'};

  const style=document.createElement('style');
  style.id='timerVisualLayoutStyle';
  style.textContent=`
    :root{--timer-hue:120;--timer-strength:0}
    body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:hsla(var(--timer-hue),82%,42%,calc(var(--timer-strength)*.16));transition:background .22s linear}
    body>main,body>.stage{position:relative;z-index:1}
    .board,.host-question-card,.card{transition:box-shadow .22s linear,filter .22s linear,background-color .22s linear}
    body.timer-colour-active .board,body.timer-colour-active .host-question-card,body.timer-colour-active .card{box-shadow:0 0 0 3px hsla(var(--timer-hue),90%,55%,.72),0 20px 70px hsla(var(--timer-hue),90%,40%,.25)!important}
    .audience-timer{position:static!important;left:auto!important;top:auto!important;transform:none!important;width:100%!important;min-width:0!important;margin:0 0 12px!important;border-color:hsl(var(--timer-hue),90%,55%)!important;box-shadow:0 10px 30px #0005!important}
    .audience-timer .fill{background:hsl(var(--timer-hue),90%,52%)!important}
    .mode-stage{position:static!important;left:auto!important;right:auto!important;top:auto!important;z-index:auto!important;margin:0 0 12px!important;width:100%!important}
    .mode-stage .mode-banner{border-color:hsl(var(--timer-hue),90%,55%)!important;background:linear-gradient(135deg,hsla(var(--timer-hue),70%,25%,.98),#061b2df5)!important}
    .mode-progress>i,.speed-progress>i{background:hsl(var(--timer-hue),90%,52%)!important;transition:width .2s linear,background .22s linear!important}
    .timer-panel,.mode-panel{position:static!important;inset:auto!important;transform:none!important;max-width:none!important;width:100%!important}
    @media(max-width:700px){.audience-timer,.mode-stage{margin-bottom:8px!important}.audience-timer [data-time]{font-size:36px!important}}
    @media(prefers-reduced-motion:reduce){body::before,.board,.host-question-card,.card{transition:none!important}}
  `;
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);

  function mountTimers(){
    if(isHost)return;
    const board=document.querySelector('.board')||document.querySelector('.shell')||document.querySelector('main');
    if(!board)return;
    const question=board.querySelector('.question');
    const mode=document.querySelector('.mode-stage');
    const timer=document.querySelector('.audience-timer');
    const anchor=question||board.firstElementChild;
    if(mode&&mode.parentElement!==board)board.insertBefore(mode,anchor);
    if(timer&&timer.parentElement!==board)board.insertBefore(timer,mode?.nextSibling||anchor);
  }

  function applyTimerState(next){
    if(!next)return;
    active={...active,...next};
    const duration=Math.max(1,Number(active.duration)||1);
    const remaining=Math.max(0,Number(active.remaining)||0);
    const ratio=Math.max(0,Math.min(1,remaining/duration));
    const hue=Math.round(ratio*120); // 120 green -> 0 red
    const strength=active.running||remaining<duration?1-ratio*.25:0;
    document.documentElement.style.setProperty('--timer-hue',String(hue));
    document.documentElement.style.setProperty('--timer-strength',String(strength));
    document.body.classList.toggle('timer-colour-active',!!active.running&&active.mode!=='standard');
    mountTimers();
  }

  if(modeChannel)modeChannel.onmessage=e=>{
    if(e.data?.type==='modeState')applyTimerState(e.data.controller);
  };
  if(timerChannel)timerChannel.onmessage=e=>{
    if(e.data?.type==='timerState')applyTimerState(e.data.timer);
  };

  const observer=new MutationObserver(mountTimers);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),12000);
  mountTimers();
})();
