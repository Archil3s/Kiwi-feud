(()=>{
  if(!document.title.includes('Host')||!window.KiwiSync)return;
  const KEY='kiwi-feud-last-stable-v1',SETUP='kiwi-feud-setup-done-v1';
  const clone=v=>JSON.parse(JSON.stringify(v));
  let last=KiwiSync.get();

  const css=document.createElement('style');css.textContent=`
    .final-dash{position:sticky;top:6px;z-index:8500;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:8px;border-radius:14px;background:#061b2df2;border:1px solid #ffffff20;box-shadow:0 12px 30px #0007;backdrop-filter:blur(8px)}
    .final-dash div{min-width:0;text-align:center;padding:7px;border-radius:9px;background:#ffffff09}.final-dash small{display:block;color:#9eb7c8;font-size:9px;text-transform:uppercase;font-weight:900}.final-dash b{display:block;color:#ffd24b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .final-action{display:grid;gap:8px;padding:12px;border-radius:14px;background:#102f4e;border:2px solid #ffd24b55}.final-action h3{margin:0;color:#ffd24b}.final-main{min-height:58px;font-size:17px}.final-more{display:none;grid-template-columns:1fr 1fr;gap:7px}.final-more.show{display:grid}
    .final-modal{position:fixed;inset:0;z-index:50000;background:#020810ed;display:grid;place-items:center;padding:14px}.final-box{width:min(680px,100%);max-height:90vh;overflow:auto;background:#102f4e;border:2px solid #ffd24b;border-radius:18px;padding:18px;box-shadow:0 25px 90px #000}.final-box h2{margin:0 0 8px;color:#ffd24b}.final-setup-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.final-box label{display:grid;gap:5px;color:#b9cedb;font-size:12px;font-weight:800}.final-box input,.final-box select{padding:11px;border-radius:9px;border:1px solid #ffffff22;background:#061b2d;color:#fff}.final-box .actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
    @media(max-width:700px){.final-dash{grid-template-columns:repeat(3,1fr)}.final-setup-grid{grid-template-columns:1fr}.final-more{grid-template-columns:1fr}}
  `;document.head.appendChild(css);

  function q(s){return KIWI_FEUD_BANK?.[s.questionIndex]}
  function totals(s){const x=q(s),base=x?(s.revealed||[]).reduce((n,i)=>n+(x.a[i]?.[1]||0),0):0;return{base,total:base*(Number(s.multiplier)||1)}}
  function modeName(){const on=document.querySelector('.mode-grid .on');return on?.textContent?.trim()||'Standard'}
  function phase(s){if(s.roundAwarded)return'Complete';if(s.phase==='steal')return'Steal';if(s.questionIndex<0)return'Setup';if(!('controllingTeam'in s)&&s.strikes===0)return'Face-off';return'Play'}

  const dash=document.createElement('section');dash.className='final-dash';dash.innerHTML='<div><small>Mode</small><b data-f-mode>Standard</b></div><div><small>Phase</small><b data-f-phase>Setup</b></div><div><small>Team</small><b data-f-team>—</b></div><div><small>Pot</small><b data-f-pot>0</b></div><div><small>Multiplier</small><b data-f-mult>×1</b></div><div><small>Strikes</small><b data-f-strikes>0 / 3</b></div>';
  document.querySelector('main')?.prepend(dash);

  const action=document.createElement('section');action.className='final-action';action.innerHTML=`<h3>Host Next Action</h3><div class="status" data-f-help>Set up the game.</div><button class="btn gold final-main" data-f-main>Start a Question</button><button class="btn ghost" data-f-more-toggle>More controls ▾</button><div class="final-more" data-f-more><button class="btn" data-f-undo>Undo Strike</button><button class="btn" data-f-cover>Cover Answers</button><button class="btn" data-f-restore>Emergency Restore</button><button class="btn red" data-f-new>New Game</button></div>`;
  const firstPanel=document.querySelector('.panel');firstPanel?.before(action)||document.querySelector('main')?.appendChild(action);
  action.querySelector('[data-f-more-toggle]').onclick=()=>action.querySelector('[data-f-more]').classList.toggle('show');
  action.querySelector('[data-f-cover]').onclick=()=>window.clearAnswers?.();
  action.querySelector('[data-f-undo]').onclick=()=>{const s=KiwiSync.get();if((s.strikes||0)>0)KiwiSync.set({strikes:s.strikes-1})};
  action.querySelector('[data-f-restore]').onclick=()=>{try{const snap=JSON.parse(localStorage.getItem(KEY)||'null');if(snap&&confirm('Restore the last stable game state?'))KiwiSync.set(snap)}catch{}};
  action.querySelector('[data-f-new]').onclick=()=>{if(confirm('Start a completely new game?')){localStorage.removeItem(SETUP);KiwiSync.reset();location.reload()}};

  function setMain(label,help,fn,cls='gold'){
    const b=action.querySelector('[data-f-main]');b.textContent=label;b.className='btn final-main '+cls;b.onclick=fn;action.querySelector('[data-f-help]').textContent=help;
  }
  function render(s){
    const t=totals(s),team=s.teams?.[s.activeTeam]?.name||'Team',p=phase(s);
    dash.querySelector('[data-f-mode]').textContent=modeName();dash.querySelector('[data-f-phase]').textContent=p;dash.querySelector('[data-f-team]').textContent=team;dash.querySelector('[data-f-pot]').textContent=t.total;dash.querySelector('[data-f-mult]').textContent='×'+(s.multiplier||1);dash.querySelector('[data-f-strikes]').textContent=(s.strikes||0)+' / 3';
    if(s.questionIndex<0)setMain('Start First Question','Choose the opening question and begin the face-off.',()=>window.nextQuestion?.(),'green');
    else if(s.roundAwarded)setMain('Start Next Round','The round is complete. Load the next question.',()=>window.nextQuestion?.(),'green');
    else if(s.phase==='steal')setMain('Resolve the Steal','Use Correct Steal or Steal Missed in the steal controls below.',()=>document.querySelector('.steal-card,.steal-panel')?.scrollIntoView({behavior:'smooth',block:'center'}),'red');
    else if((s.strikes||0)>=2)setMain('Wrong Answer — Strike 3','A third wrong answer starts the steal phase.',()=>window.strike?.(),'red');
    else setMain(`Wrong Answer — Strike ${(s.strikes||0)+1}`,'Reveal a matching answer, or add a strike for a wrong answer.',()=>window.strike?.(),'red');
  }

  // Lightweight guards: do not permit duplicate awards/reveals or strikes after completion.
  const reveal=window.reveal;if(typeof reveal==='function')window.reveal=function(i){const s=KiwiSync.get();if(s.roundAwarded||(s.revealed||[]).includes(i))return;return reveal(i)};
  const strike=window.strike;if(typeof strike==='function')window.strike=function(){const s=KiwiSync.get();if(s.roundAwarded||s.phase==='steal'||(s.strikes||0)>=3)return;return strike()};
  const award=window.award;if(typeof award==='function')window.award=function(){const s=KiwiSync.get();if(s.roundAwarded)return;return award()};

  KiwiSync.subscribe(s=>{last=s;render(s);if(!s.roundAwarded)localStorage.setItem(KEY,JSON.stringify(clone(s)))});

  function setupModal(){
    if(localStorage.getItem(SETUP)||KiwiSync.get().questionIndex>=0)return;
    const m=document.createElement('div');m.className='final-modal';m.innerHTML=`<div class="final-box"><h2>Kiwi Feud — Game Setup</h2><p style="color:#c8dce9">Set the game once, then the Host Console guides each round.</p><div class="final-setup-grid"><label>Team 1<input id="fsTeam1" value="Kea"></label><label>Team 2<input id="fsTeam2" value="Tūī"></label><label>Opening multiplier<select id="fsMult"><option value="1">Single ×1</option><option value="2">Double ×2</option><option value="3">Triple ×3</option></select></label><label>Presentation<select id="fsCamera"><option value="standard">Standard</option><option value="minimal">Minimal</option><option value="cinematic">Cinematic</option></select></label></div><div class="actions"><button class="btn green" id="fsStart">Save & Start</button><button class="btn ghost" id="fsRules">Open Game Rules</button></div></div>`;document.body.appendChild(m);
    m.querySelector('#fsRules').onclick=()=>document.querySelector('[data-open-rules],#openRules,.rules-button')?.click();
    m.querySelector('#fsStart').onclick=()=>{const s=KiwiSync.get(),teams=[{name:m.querySelector('#fsTeam1').value.trim()||'Kea',score:0},{name:m.querySelector('#fsTeam2').value.trim()||'Tūī',score:0}];KiwiSync.set({...s,teams,activeTeam:0,multiplier:Number(m.querySelector('#fsMult').value),strikes:0,revealed:[],roundAwarded:false});localStorage.setItem('kiwi-feud-camera-level',m.querySelector('#fsCamera').value);localStorage.setItem(SETUP,'1');m.remove()};
  }
  setTimeout(setupModal,500);
})();