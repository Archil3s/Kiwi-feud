(()=>{
  if(!document.title.includes('Host')) return;

  const apply=()=>{
    const main=document.querySelector('main');
    const workspace=document.querySelector('.host-workspace');
    const ui=document.querySelector('.simple-host');
    const card=document.querySelector('.host-question-card');
    const assistant=document.querySelector('.question-assist');
    if(!main||!workspace||!ui||!card)return false;

    if(!workspace.querySelector('.host-left-column')){
      const left=document.createElement('div');
      left.className='host-left-column';
      workspace.insertBefore(left,workspace.firstChild);
      if(assistant)left.appendChild(assistant);
      left.appendChild(ui);
    }else if(assistant&&!workspace.querySelector('.host-left-column').contains(assistant)){
      workspace.querySelector('.host-left-column').prepend(assistant);
    }

    main.querySelectorAll(':scope > .panel').forEach(panel=>panel.classList.add('host-wide-panel'));
    return true;
  };

  const css=document.createElement('style');
  css.textContent=`
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{overflow-x:hidden}
    main{width:min(1180px,100%)!important;max-width:1180px!important;padding-inline:clamp(0px,1vw,8px)}
    main *{min-width:0}
    .top{width:100%;max-width:1180px;margin-inline:auto}

    .host-workspace{width:100%;grid-template-columns:minmax(330px,.9fr) minmax(430px,1.1fr)!important;gap:clamp(10px,1.4vw,18px)!important;align-items:start}
    .host-left-column{display:grid;gap:12px;min-width:0}
    .host-left-column>.question-assist,.host-left-column>.simple-host{width:100%;margin:0}

    .host-question-card{width:100%;max-width:none!important;top:72px!important;max-height:calc(100dvh - 88px)!important;overflow:auto!important;overscroll-behavior:contain}
    .host-question-card .question{font-size:clamp(20px,2.15vw,30px)!important;line-height:1.16;padding:clamp(11px,1.5vw,17px)!important}
    .host-question-card .answers{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:9px!important}
    .host-question-card .answer{width:100%;grid-template-columns:36px minmax(0,1fr) 48px!important;min-height:50px!important;font-size:clamp(13px,1.25vw,16px)!important}
    .host-question-card .answer .label{overflow-wrap:anywhere;word-break:normal}
    .host-question-card .answer::after{right:58px}

    .question-assist{padding:12px!important;border-radius:15px!important;gap:10px!important}
    .qa-title{font-size:clamp(18px,2vw,25px)!important}
    .qa-tools{grid-template-columns:minmax(0,1fr) auto!important}
    .qa-tools #qaClear{grid-column:2}
    .qa-tools #qaSpeak{grid-column:2;grid-row:1}
    .qa-search{font-size:16px!important}
    .qa-match{grid-template-columns:minmax(0,1fr) auto!important}
    .qa-alias-row{grid-template-columns:minmax(120px,.8fr) minmax(0,1.2fr)!important}

    .simple-host{width:100%}
    .host-focus h2{font-size:clamp(21px,2.4vw,31px)!important}
    .round-strip{grid-template-columns:minmax(0,1.25fr) repeat(2,minmax(72px,.75fr))!important}
    .main-action,.secondary-row .btn,.advanced-grid .btn{white-space:normal;line-height:1.2}

    .host-wide-panel,main>.panel{width:min(820px,100%)!important;max-width:820px!important;margin-left:auto!important;margin-right:auto!important}
    main>.panel .grid,main>.panel .team-tools{grid-template-columns:repeat(2,minmax(0,1fr))}
    .team-row{grid-template-columns:auto minmax(0,1fr) 76px auto!important}
    .team-name{width:100%!important}
    input,select,button{max-width:100%}

    @media(max-width:1000px){
      main{width:min(840px,100%)!important;max-width:840px!important}
      .host-workspace{grid-template-columns:1fr!important}
      .host-question-card{order:1;position:sticky!important;top:61px!important;max-height:min(58dvh,560px)!important;overflow:auto!important}
      .host-left-column{order:2}
      .host-question-card .answers{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .host-wide-panel,main>.panel{width:100%!important;max-width:840px!important}
    }

    @media(max-width:620px){
      main{padding-inline:0}
      .top{padding-inline:4px}
      .host-workspace{gap:8px!important}
      .host-question-card{top:57px!important;max-height:min(55dvh,500px)!important;border-radius:12px!important}
      .host-question-card .head{font-size:10px!important;padding:7px 8px!important}
      .host-question-card .question{font-size:clamp(17px,5vw,21px)!important;padding:9px!important}
      .host-question-card .answers{grid-template-columns:1fr!important;gap:5px!important;padding:6px!important}
      .host-question-card .answer{grid-template-columns:30px minmax(0,1fr) 40px!important;min-height:39px!important;font-size:13px!important}
      .host-question-card .answer span{padding:5px!important}
      .question-assist{padding:10px!important}
      .qa-tools{grid-template-columns:1fr 1fr!important}
      .qa-search{grid-column:1/-1!important}
      .qa-tools #qaSpeak{grid-column:1!important;grid-row:auto!important}
      .qa-tools #qaClear{grid-column:2!important}
      .qa-match{grid-template-columns:1fr!important}
      .qa-match .btn{width:100%}
      .qa-alias-row{grid-template-columns:1fr!important}
      .round-strip{grid-template-columns:1fr 1fr!important}
      .round-strip .round-box:first-child{grid-column:1/-1}
      main>.panel .grid,main>.panel .team-tools{grid-template-columns:1fr!important}
      .team-row{grid-template-columns:auto minmax(0,1fr) 58px!important}
      .team-actions{grid-column:1/-1!important;justify-content:flex-end;flex-wrap:wrap}
    }

    @media(max-width:380px){
      .host-question-card{max-height:52dvh!important}
      .host-question-card .question{font-size:17px!important}
      .host-question-card .answer{font-size:12px!important}
      .top h1{font-size:21px!important}
      .top .btn{font-size:11px;padding:8px!important}
    }
  `;
  document.head.appendChild(css);

  if(!apply()){
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }
})();
