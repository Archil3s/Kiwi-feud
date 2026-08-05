(()=>{
  const KEY='kiwi-feud-contestant-tutorial-seen-v1';
  let step=0;
  const slides=[
    {icon:'🎉',title:'Welcome to Kiwi Feud!',body:'Work with your team to guess the most popular answers on the board.',demo:'The most popular answer is worth the most points.'},
    {icon:'🎤',title:'Face-Off',body:'One player from each team answers first. The player with the higher-ranked answer wins control of the board.',demo:'The host then chooses which team is in control.'},
    {icon:'✅',title:'Your Team’s Turn',body:'Give one answer at a time. If it matches the board, the host reveals it and its points go into the round pot.',demo:'Example: PIE — 28 points'},
    {icon:'❌',title:'Three Strikes',body:'A wrong answer earns a strike. After three strikes, the next team gets one chance to steal.',demo:'STRIKE 1  •  STRIKE 2  •  STRIKE 3'},
    {icon:'🎯',title:'Steal Chance',body:'The stealing team gets one answer. A correct answer wins the whole round pot. A miss gives the pot back to the original team.',demo:'One guess. Whole board on the line.'},
    {icon:'⭐',title:'Single, Double & Triple',body:'Every revealed answer adds to the pot. Later rounds may multiply the entire pot by two or three.',demo:'46 points × 2 = 92 points'},
    {icon:'🏆',title:'How to Win',body:'The team with the highest total score at the end of the game wins.',demo:'Listen closely, back your team, and have fun!'}
  ];

  const style=document.createElement('style');
  style.textContent=`
    #contestantTutorial{position:fixed;inset:0;z-index:12000;background:radial-gradient(circle at 50% 0,#226e9f,#071c30 58%,#02070d);display:grid;place-items:center;padding:18px;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
    #contestantTutorial[hidden]{display:none}
    .ct-card{width:min(760px,100%);border:3px solid #ffd24b;border-radius:26px;background:linear-gradient(180deg,#123e62,#071b2d);box-shadow:0 30px 100px #000c,0 0 50px #ffd24b22;overflow:hidden}
    .ct-top{padding:16px 18px;background:linear-gradient(#ffe47b,#e6a318);color:#241700;font-weight:1000;display:flex;justify-content:space-between;align-items:center}
    .ct-progress{height:7px;background:#ffffff20}.ct-progress span{display:block;height:100%;background:#ffd24b;transition:width .3s ease}
    .ct-body{text-align:center;padding:28px 24px 20px;min-height:360px;display:grid;place-items:center;align-content:center;gap:15px}
    .ct-icon{font-size:72px;filter:drop-shadow(0 8px 12px #0008);animation:ctPop .35s ease}
    .ct-title{font-size:clamp(30px,6vw,50px);font-weight:1000;color:#ffd24b;text-transform:uppercase;line-height:1}
    .ct-copy{font-size:clamp(18px,3vw,25px);line-height:1.35;max-width:640px}
    .ct-demo{padding:13px 18px;border-radius:14px;background:#031321;border:1px solid #ffffff25;color:#d7ebf7;font-weight:900;font-size:clamp(15px,2vw,20px)}
    .ct-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:16px;background:#061522}
    .ct-btn{border:0;border-radius:12px;padding:13px 16px;font-weight:1000;cursor:pointer;background:#174e78;color:#fff;font-size:16px}.ct-btn.primary{background:linear-gradient(#ffe47b,#e6a318);color:#241700}.ct-btn.ghost{background:#ffffff12}
    #contestantRulesReplay{position:fixed;left:12px;bottom:12px;z-index:9000;border:0;border-radius:12px;padding:10px 13px;font-weight:900;background:#102f4e;color:#fff;border:1px solid #ffffff2b;cursor:pointer}
    @keyframes ctPop{from{transform:scale(.65);opacity:0}to{transform:scale(1);opacity:1}}
    @media(max-width:600px){.ct-body{min-height:330px;padding:22px 15px}.ct-actions{grid-template-columns:1fr 1fr}.ct-actions .skip{grid-column:1/3}.ct-icon{font-size:58px}}
  `;
  document.head.appendChild(style);

  const modal=document.createElement('section');
  modal.id='contestantTutorial';
  modal.innerHTML=`
    <div class="ct-card" role="dialog" aria-modal="true" aria-label="Contestant rules">
      <div class="ct-top"><span>🥝 CONTESTANT RULES</span><span id="ctCount"></span></div>
      <div class="ct-progress"><span id="ctProgress"></span></div>
      <div class="ct-body">
        <div class="ct-icon" id="ctIcon"></div>
        <div class="ct-title" id="ctTitle"></div>
        <div class="ct-copy" id="ctCopy"></div>
        <div class="ct-demo" id="ctDemo"></div>
      </div>
      <div class="ct-actions">
        <button class="ct-btn ghost" id="ctBack">← Back</button>
        <button class="ct-btn primary" id="ctNext">Next →</button>
        <button class="ct-btn ghost skip" id="ctSkip">Skip Tutorial</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const replay=document.createElement('button');
  replay.id='contestantRulesReplay';
  replay.textContent='📘 Replay Rules';
  document.body.appendChild(replay);

  const $=id=>document.getElementById(id);
  function render(){
    const s=slides[step];
    $('ctCount').textContent=`${step+1} / ${slides.length}`;
    $('ctProgress').style.width=`${((step+1)/slides.length)*100}%`;
    $('ctIcon').textContent=s.icon;
    $('ctTitle').textContent=s.title;
    $('ctCopy').textContent=s.body;
    $('ctDemo').textContent=s.demo;
    $('ctBack').disabled=step===0;
    $('ctNext').textContent=step===slides.length-1?'🎉 Ready to Play':'Next →';
  }
  function open(){step=0;modal.hidden=false;render();}
  function close(){modal.hidden=true;try{sessionStorage.setItem(KEY,'1')}catch(e){}}
  $('ctBack').onclick=()=>{if(step>0){step--;render();}};
  $('ctNext').onclick=()=>{if(step<slides.length-1){step++;render();}else close();};
  $('ctSkip').onclick=close;
  replay.onclick=open;

  let firstState=true;
  if(window.KiwiSync){
    KiwiSync.subscribe(s=>{
      if(firstState){
        firstState=false;
        let seen=false;try{seen=sessionStorage.getItem(KEY)==='1'}catch(e){}
        if(s.questionIndex<0&&!seen)open();else modal.hidden=true;
      }
      if(s.questionIndex>=0)modal.hidden=true;
    });
  }else open();
})();