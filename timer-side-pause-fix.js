(()=>{
  if(!document.title.includes('Host')) return;

  const css=document.createElement('style');
  css.textContent=`
    .timer-side-panel{
      width:100%!important;
      max-width:none!important;
      margin:0!important;
      position:static!important;
      align-self:stretch;
      box-sizing:border-box;
    }
    .host-left-column>.timer-side-panel{order:3}
    .timer-side-panel>div:first-child{min-height:64px}
    .timer-side-panel [data-time]{font-size:clamp(36px,5vw,58px)!important;line-height:1!important;color:#ffd24b}
    .timer-side-panel .grid,.timer-side-panel .speed-row{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .timer-side-panel .btn{width:100%;white-space:normal;line-height:1.15;min-height:46px}
    .timer-side-panel .speed-status{font-size:13px;padding:11px}
    @media(min-width:1001px){
      .host-left-column{align-content:start}
      .timer-side-panel{min-height:0}
    }
    @media(max-width:620px){
      .timer-side-panel .grid,.timer-side-panel .speed-row{grid-template-columns:1fr!important}
      .timer-side-panel [data-time]{font-size:42px!important}
    }
  `;
  document.head.appendChild(css);

  function dockPanel(){
    const panel=document.querySelector('.timer-panel');
    if(!panel)return false;
    panel.classList.add('timer-side-panel');
    const left=document.querySelector('.host-left-column');
    const controls=document.querySelector('.simple-host');
    if(left){
      if(panel.parentElement!==left)left.appendChild(panel);
      return true;
    }
    if(controls){
      if(panel.parentElement!==controls)controls.appendChild(panel);
      return true;
    }
    return false;
  }

  if(!dockPanel()){
    const observer=new MutationObserver(()=>{if(dockPanel())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }

  let timerRunning=false;
  let lastTimerText='';
  let lastChange=0;

  const watch=setInterval(()=>{
    const panel=document.querySelector('.timer-panel');
    const time=panel?.querySelector('[data-time]')?.textContent||'';
    if(time&&time!==lastTimerText){
      const old=lastTimerText;
      lastTimerText=time;
      lastChange=Date.now();
      if(old&&time!=='0:00')timerRunning=true;
      if(time==='0:00')timerRunning=false;
    }
    if(Date.now()-lastChange>1400&&timerRunning)timerRunning=false;
  },180);

  document.addEventListener('click',e=>{
    const id=e.target?.id;
    if(id==='timerStart')timerRunning=true;
    if(id==='timerPause'||id==='timerReset')timerRunning=false;
  },true);

  function installStrikePause(){
    if(typeof window.strike!=='function'||window.strike.__kiwiPauseWrapped)return false;
    const baseStrike=window.strike;
    const wrapped=function(...args){
      const wasRunning=timerRunning;
      if(wasRunning){
        document.querySelector('#timerPause')?.click();
        timerRunning=false;
      }
      const result=baseStrike.apply(this,args);
      if(wasRunning){
        setTimeout(()=>{
          const text=document.querySelector('.timer-panel [data-time]')?.textContent;
          if(text&&text!=='0:00'){
            document.querySelector('#timerStart')?.click();
            timerRunning=true;
          }
        },1250);
      }
      return result;
    };
    wrapped.__kiwiPauseWrapped=true;
    window.strike=wrapped;
    return true;
  }

  if(!installStrikePause()){
    const id=setInterval(()=>{if(installStrikePause())clearInterval(id)},100);
    setTimeout(()=>clearInterval(id),5000);
  }

  addEventListener('beforeunload',()=>clearInterval(watch));
})();
