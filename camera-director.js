(()=>{
  const isHost=document.title.includes('Host');
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-camera-v1'):null;
  const key='kiwi-feud-camera-level';
  let level=localStorage.getItem(key)||'standard';
  let previous=null;

  const css=document.createElement('style');
  css.textContent=`
    :root{--cam-dur:.42s;--cam-ease:cubic-bezier(.2,.8,.2,1)}
    body.cam-minimal{--cam-dur:.18s}
    .cam-stage{transform-origin:center center;will-change:transform,filter}
    .cam-question{animation:camQuestion var(--cam-dur) var(--cam-ease)}
    .cam-correct{animation:camCorrect .48s var(--cam-ease)}
    .cam-top-answer{animation:camTop .72s var(--cam-ease)}
    .cam-strike{animation:camStrike .42s ease-out}
    .cam-steal{animation:camSteal 1s ease-in-out 2}
    .cam-winner{animation:camWinner 1.1s var(--cam-ease)}
    .cam-active-team{box-shadow:0 0 0 3px #ffd24b,0 0 28px #ffd24b66!important;transform:scale(1.025)}
    .cam-spotlight{position:fixed;inset:0;pointer-events:none;z-index:25000;background:radial-gradient(circle at 50% 42%,transparent 0 22%,#02060cb8 72%);opacity:0;animation:camSpot .9s ease-out}
    .cam-steal-banner,.cam-win-banner{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:26000;padding:14px 28px;border-radius:999px;font-weight:1000;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 18px 60px #000a;pointer-events:none}
    .cam-steal-banner{background:#8e1730;color:#fff;border:3px solid #ff637e;animation:camBanner .95s ease-out forwards}
    .cam-win-banner{background:#ffd24b;color:#251700;border:3px solid #fff3b0;animation:camBanner 1.2s ease-out forwards}
    @keyframes camQuestion{0%{transform:scale(.97);filter:brightness(.82)}100%{transform:scale(1);filter:brightness(1)}}
    @keyframes camCorrect{0%{transform:scale(1)}40%{transform:scale(1.045);filter:brightness(1.22)}100%{transform:scale(1)}}
    @keyframes camTop{0%{transform:scale(.92)}45%{transform:scale(1.09);filter:drop-shadow(0 0 22px #ffd24b)}100%{transform:scale(1)}}
    @keyframes camStrike{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
    @keyframes camSteal{50%{filter:brightness(.72) saturate(1.25);box-shadow:inset 0 0 55px #c21f3c99}}
    @keyframes camWinner{0%{transform:scale(.96);filter:brightness(.85)}45%{transform:scale(1.035);filter:brightness(1.22)}100%{transform:scale(1)}}
    @keyframes camSpot{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
    @keyframes camBanner{0%{opacity:0;transform:translate(-50%,-30px) scale(.8)}35%{opacity:1;transform:translate(-50%,0) scale(1.06)}100%{opacity:0;transform:translate(-50%,-10px) scale(1)}}
    .camera-panel{display:grid;gap:8px}.camera-options{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.camera-options .btn.on{background:#ffd24b;color:#251700}
    body.cam-minimal .cam-spotlight,body.cam-minimal .cam-steal-banner,body.cam-minimal .cam-win-banner{display:none!important}
    body.cam-minimal .cam-steal,body.cam-minimal .cam-winner{animation:none!important}
    @media(prefers-reduced-motion:reduce){.cam-question,.cam-correct,.cam-top-answer,.cam-strike,.cam-steal,.cam-winner{animation:none!important}.cam-spotlight,.cam-steal-banner,.cam-win-banner{display:none!important}}
  `;
  document.head.appendChild(css);

  function applyLevel(next,broadcast=true){
    level=['minimal','standard','cinematic'].includes(next)?next:'standard';
    document.body.classList.remove('cam-minimal','cam-standard','cam-cinematic');
    document.body.classList.add('cam-'+level);
    localStorage.setItem(key,level);
    document.querySelectorAll('[data-camera-level]').forEach(b=>b.classList.toggle('on',b.dataset.cameraLevel===level));
    if(broadcast)channel?.postMessage({type:'level',level});
  }
  function pulse(el,cls,ms=800){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),ms)}
  function gameStage(){return document.querySelector('.host-question-card,.board,.game,.card')||document.querySelector('main')}
  function answerEls(){return [...document.querySelectorAll('.answer')]}
  function activeTeamEl(index){const rows=[...document.querySelectorAll('.team-row,.team-card,.score-card')];return rows[index]||null}
  function overlay(kind,text){
    if(level==='minimal')return;
    const o=document.createElement('div');o.className=kind==='steal'?'cam-steal-banner':'cam-win-banner';o.textContent=text;document.body.appendChild(o);setTimeout(()=>o.remove(),kind==='steal'?1050:1300);
    if(level==='cinematic'){const s=document.createElement('div');s.className='cam-spotlight';document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}
  }
  function confetti(){if(level!=='cinematic')return;try{window.KiwiEffects?.confetti?.()}catch{} }

  function onState(s){
    if(!previous){previous=JSON.parse(JSON.stringify(s));return}
    const stage=gameStage();
    if(s.questionIndex!==previous.questionIndex&&s.questionIndex>=0)pulse(stage,'cam-question',700);

    const oldRev=previous.revealed||[],now=s.revealed||[];
    if(now.length>oldRev.length){
      const added=now.find(i=>!oldRev.includes(i));
      const el=answerEls()[added];
      pulse(el,added===0?'cam-top-answer':'cam-correct',added===0?800:520);
      if(added===0){overlay('win','Top answer!');confetti()}
    }

    if((s.strikes||0)>(previous.strikes||0))pulse(stage,'cam-strike',500);
    if(s.phase==='steal'&&previous.phase!=='steal'){
      pulse(stage,'cam-steal',2100);overlay('steal','Steal time');
    }
    if(s.roundAwarded&&!previous.roundAwarded){
      pulse(stage,'cam-winner',1200);
      const winner=s.teams?.[s.activeTeam]?.name||'Round winner';
      overlay('win',winner+' wins the round');confetti();
    }
    document.querySelectorAll('.cam-active-team').forEach(el=>el.classList.remove('cam-active-team'));
    activeTeamEl(s.activeTeam)?.classList.add('cam-active-team');
    previous=JSON.parse(JSON.stringify(s));
  }

  if(channel)channel.onmessage=e=>{if(e.data?.type==='level')applyLevel(e.data.level,false)};
  applyLevel(level,false);

  if(isHost){
    const panel=document.createElement('section');panel.className='panel camera-panel';
    panel.innerHTML='<strong style="color:#ffd24b">🎥 Camera Effects</strong><div class="camera-options"><button class="btn" data-camera-level="minimal">Minimal</button><button class="btn" data-camera-level="standard">Standard</button><button class="btn" data-camera-level="cinematic">Cinematic</button></div><div class="status">Effects react automatically to new questions, correct answers, strikes, steals and round wins.</div>';
    const timer=document.querySelector('.timer-panel');
    if(timer)timer.after(panel);else document.querySelector('main')?.appendChild(panel);
    panel.querySelectorAll('[data-camera-level]').forEach(b=>b.onclick=()=>applyLevel(b.dataset.cameraLevel));
    applyLevel(level,false);
  }

  if(window.KiwiSync?.subscribe)KiwiSync.subscribe(onState);
})();
