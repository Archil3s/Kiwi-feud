(()=>{
  if(!document.title.includes('Host'))return;
  const style=document.createElement('style');
  style.textContent=`
    .question-assist .rules-launch{margin:0;padding:0;background:transparent;border:0;box-shadow:none;display:block}
    .question-assist .rules-launch>div{display:none}
    .question-assist .rules-launch .btn{white-space:nowrap;padding:9px 11px;border-radius:10px;font-size:12px}
    .qa-top .rules-launch{margin-left:auto;align-self:flex-start}
    @media(max-width:560px){.qa-top .rules-launch{width:100%;margin-left:0}.qa-top .rules-launch .btn{width:100%}}
  `;
  document.head.appendChild(style);
  function place(){
    const launcher=document.querySelector('.rules-launch');
    const top=document.querySelector('.question-assist .qa-top');
    if(!launcher||!top)return false;
    launcher.querySelector('#openCompleteRules')?.replaceChildren(document.createTextNode('📘 Open Rules'));
    top.appendChild(launcher);
    return true;
  }
  if(!place()){
    const observer=new MutationObserver(()=>{if(place())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }
})();