(()=>{
  if(!document.title.includes('Host')) return;

  const css=document.createElement('style');
  css.textContent=`
    :root{--host-gap:8px}
    html,body{overflow-x:hidden}
    body{padding:8px 8px 76px!important}
    main{width:min(1180px,100%)!important;max-width:1180px!important;margin:auto!important;padding:0!important}
    .top{position:static!important;padding:4px 0 7px!important;margin-bottom:7px!important;min-height:48px}
    .top h1{font-size:clamp(21px,3vw,30px)!important;line-height:1.05}

    /* Remove duplicate floating status strip; the card now owns round status. */
    .host-status-top{display:none!important}

    .host-workspace{display:grid!important;grid-template-columns:minmax(0,1.18fr) minmax(300px,.82fr)!important;gap:var(--host-gap)!important;align-items:start!important;margin:0 0 9px!important}
    .host-left-column{display:contents!important}
    .host-question-card{grid-column:1!important;grid-row:1!important;position:static!important;top:auto!important;max-height:calc(100dvh - 138px)!important;overflow:hidden!important;width:100%!important;border-radius:13px!important}
    .simple-host{grid-column:2!important;grid-row:1!important;display:grid!important;gap:7px!important;align-content:start!important;position:sticky!important;top:8px!important}

    .host-question-card .head{padding:7px 9px!important;font-size:10px!important}
    .host-question-card .question{padding:9px 11px!important;font-size:clamp(17px,1.75vw,24px)!important;line-height:1.12!important;min-height:0!important;max-height:74px!important;overflow:auto!important}
    .question-points-target,.points-target-strip{margin:0!important;border-radius:0!important;padding:7px 10px!important;min-height:34px!important;font-size:13px!important}
    .host-question-card .answers{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important;padding:6px!important;overflow:auto!important;max-height:calc(100dvh - 270px)!important}
    .host-question-card .answer{grid-template-columns:28px minmax(0,1fr) 38px!important;min-height:38px!important;font-size:12px!important;border-radius:8px!important}
    .host-question-card .answer span{padding:4px!important}
    .host-question-card .answer .label{line-height:1.08!important;overflow-wrap:anywhere!important;word-break:normal!important}
    .host-question-card .answer::after{display:none!important}

    .phase-pill{display:none!important}
    .host-focus{padding:9px!important;border-radius:12px!important}
    .host-focus small{font-size:9px!important}
    .host-focus h2{font-size:clamp(17px,1.8vw,22px)!important;line-height:1.08!important;margin:2px 0!important}
    .host-focus p{font-size:12px!important;line-height:1.2!important}
    .strike-card{padding:7px!important;border-radius:10px!important}
    .strike-card h3{font-size:11px!important;margin-bottom:3px!important}
    .strike-dot{width:30px!important;height:30px!important;font-size:20px!important}
    .strike-note{font-size:9px!important;margin-top:3px!important}
    .main-action{min-height:50px!important;font-size:15px!important}
    .secondary-row{gap:5px!important}.secondary-row .btn{min-height:38px!important;padding:8px!important;font-size:12px!important}
    .advanced{padding:6px!important}.advanced summary{font-size:11px!important}.advanced-grid{gap:5px!important;margin-top:5px!important}

    /* Keep search useful without forcing extra scrolling. */
    .question-assist{grid-column:2!important;grid-row:2!important;margin:0!important;padding:8px!important;gap:7px!important;border-radius:12px!important}
    .qa-top{display:none!important}
    .qa-tools{grid-template-columns:minmax(0,1fr) auto!important;gap:5px!important}
    .qa-search{padding:10px!important;font-size:14px!important}
    #qaSpeak{display:none!important}
    #qaClear{padding:8px 10px!important}
    .qa-match{padding:8px!important;font-size:12px!important}
    .qa-aliases,.qa-shortcuts{display:none!important}

    /* Panels below the live game are setup tools, not live controls. */
    main>.panel,.host-wide-panel{position:static!important;width:100%!important;max-width:none!important;margin:8px 0 0!important}
    .soundboard-panel{position:static!important;float:none!important;margin:8px 0 0!important}
    .soundboard-panel details{margin:0!important}

    .host-bottom{padding:6px!important}.host-bottom .btn{min-height:48px!important;font-size:14px!important}

    @media(max-width:900px){
      body{padding:6px 6px 72px!important}
      .host-workspace{grid-template-columns:1fr!important}
      .host-question-card{grid-column:1!important;grid-row:1!important;max-height:none!important;overflow:visible!important}
      .simple-host{grid-column:1!important;grid-row:2!important;position:static!important}
      .question-assist{grid-column:1!important;grid-row:3!important}
      .host-question-card .question{max-height:none!important;overflow:visible!important;font-size:18px!important}
      .host-question-card .answers{max-height:none!important;overflow:visible!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }

    @media(max-width:560px){
      .top{min-height:42px!important}.top h1{font-size:21px!important}.top .btn{font-size:11px!important;padding:8px!important}
      .host-question-card .question{font-size:17px!important;padding:8px!important}
      .host-question-card .answers{grid-template-columns:1fr!important;gap:4px!important;padding:5px!important}
      .host-question-card .answer{grid-template-columns:27px minmax(0,1fr) 36px!important;min-height:35px!important;font-size:12px!important}
      .simple-host{gap:6px!important}.secondary-row{grid-template-columns:1fr 1fr!important}
      .question-assist{padding:7px!important}.qa-tools{grid-template-columns:1fr auto!important}
    }
  `;
  document.head.appendChild(css);

  function arrange(){
    const workspace=document.querySelector('.host-workspace');
    const card=document.querySelector('.host-question-card');
    const ui=document.querySelector('.simple-host');
    const assistant=document.querySelector('.question-assist');
    if(!workspace||!card||!ui)return false;
    workspace.append(card,ui);
    if(assistant)workspace.appendChild(assistant);

    const oldStatus=document.querySelector('.host-status-top');
    if(oldStatus)oldStatus.setAttribute('aria-hidden','true');

    document.querySelectorAll('section').forEach(section=>{
      if(section.textContent?.includes('ORIGINAL GAME-SHOW SOUNDBOARD')) section.classList.add('soundboard-panel');
    });
    return true;
  }

  if(!arrange()){
    const observer=new MutationObserver(()=>{if(arrange())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }
})();
