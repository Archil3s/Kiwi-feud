(()=>{
  if(!document.title.includes('Host'))return;

  const style=document.createElement('style');
  style.textContent=`
    .simple-host .rules-launch{
      margin:0!important;
      padding:10px 11px!important;
      background:linear-gradient(135deg,#173f68,#102f4e)!important;
      border:1px solid #ffffff24!important;
      border-radius:12px!important;
      box-shadow:0 8px 20px #0004!important;
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      align-items:center!important;
      gap:9px!important;
      width:100%!important;
    }
    .simple-host .rules-launch>div{display:block!important;min-width:0}
    .simple-host .rules-launch strong{display:block!important;color:#ffd24b!important;font-size:13px!important;line-height:1.1!important}
    .simple-host .rules-launch small{display:block!important;color:#c6d8e4!important;font-size:10px!important;line-height:1.2!important;margin-top:3px!important}
    .simple-host .rules-launch .btn{
      white-space:nowrap!important;
      min-height:40px!important;
      padding:9px 12px!important;
      border-radius:10px!important;
      font-size:12px!important;
      font-weight:1000!important;
    }
    .question-assist .rules-launch{display:none!important}
    @media(max-width:560px){
      .simple-host .rules-launch{grid-template-columns:1fr!important}
      .simple-host .rules-launch .btn{width:100%!important}
    }
  `;
  document.head.appendChild(style);

  function place(){
    const launcher=document.querySelector('.rules-launch');
    const consoleArea=document.querySelector('.simple-host');
    if(!launcher||!consoleArea)return false;

    launcher.querySelector('strong')?.replaceChildren(document.createTextNode('📘 Complete Game Rules'));
    launcher.querySelector('small')?.replaceChildren(document.createTextNode('All rules, game modes, scoring, timers, strikes, steals and winning flow.'));
    const button=launcher.querySelector('#openCompleteRules');
    if(button)button.replaceChildren(document.createTextNode('Open Rules'));

    const focus=consoleArea.querySelector('.host-focus');
    if(focus)focus.insertAdjacentElement('afterend',launcher);
    else consoleArea.prepend(launcher);
    return true;
  }

  if(!place()){
    const observer=new MutationObserver(()=>{if(place())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();