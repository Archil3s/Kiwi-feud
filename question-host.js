(()=>{
  if(!document.title.includes('Host')) return;

  const css=document.createElement('style');
  css.textContent=`
    .question-assist{background:#102f4e;border:2px solid #ffffff16;border-radius:18px;padding:14px;margin:0 0 14px;display:grid;gap:12px;box-shadow:0 16px 45px #0006}
    .qa-top{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
    .qa-kicker{font-size:11px;font-weight:1000;letter-spacing:.12em;text-transform:uppercase;color:#9eb7c8}
    .qa-title{font-size:clamp(20px,4vw,29px);font-weight:1000;line-height:1.18;color:#fff;margin-top:3px}
    .qa-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.qa-chip{background:#061b2d;border:1px solid #ffffff18;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;color:#cce0ed}
    .qa-tools{display:grid;grid-template-columns:1fr auto auto;gap:8px}.qa-search{width:100%;min-width:0;padding:13px 14px;border-radius:12px;border:2px solid #ffffff22;background:#061b2d;color:#fff;font-size:16px}.qa-search:focus{outline:none;border-color:#ffd24b;box-shadow:0 0 0 3px #ffd24b20}
    .qa-match{background:#061b2d;border-radius:13px;padding:11px;display:none;gap:8px;align-items:center;grid-template-columns:1fr auto}.qa-match.show{display:grid}.qa-match strong{color:#ffd24b}.qa-match small{display:block;color:#a9c3d5;margin-top:3px}
    .qa-aliases{background:#061b2d;border-radius:13px;padding:10px 12px}.qa-aliases summary{cursor:pointer;font-weight:950;color:#ffd24b}.qa-alias-grid{display:grid;gap:8px;margin-top:10px}.qa-alias-row{display:grid;grid-template-columns:minmax(110px,.7fr) 1.3fr;gap:9px;padding:8px;border-radius:9px;background:#ffffff08;font-size:13px}.qa-alias-row b{color:#fff}.qa-alias-row span{color:#b9cfdd}
    .qa-shortcuts{font-size:11px;text-align:center;color:#8da8b9}.qa-empty{color:#9eb7c8;text-align:center;padding:8px}
    .answer{cursor:pointer;position:relative;transition:.16s}.answer::after{content:'REVEAL';position:absolute;right:67px;top:50%;transform:translateY(-50%);font-size:9px;letter-spacing:.08em;color:#6e5b2b;background:#fff4c7;border-radius:999px;padding:4px 6px;opacity:.8}.answer.done::after{content:'REVEALED';color:#fff;background:#238b59}.answer.qa-highlight{outline:4px solid #ffd24b;box-shadow:0 0 22px #ffd24b66;transform:scale(1.01)}
    @media(max-width:620px){.qa-tools{grid-template-columns:1fr 1fr}.qa-search{grid-column:1/-1}.qa-alias-row{grid-template-columns:1fr}.answer::after{display:none}}
  `;
  document.head.appendChild(css);

  const section=document.createElement('section');
  section.className='question-assist';
  section.innerHTML=`
    <div class="qa-top">
      <div style="min-width:0;flex:1">
        <div class="qa-kicker">Question assistant</div>
        <div class="qa-title" id="qaTitle">Start a question to use host assistance</div>
        <div class="qa-meta" id="qaMeta"></div>
      </div>
    </div>
    <div class="qa-tools">
      <input id="qaSearch" class="qa-search" type="search" autocomplete="off" placeholder="Type the contestant's answer…">
      <button class="btn" id="qaSpeak">🔊 Read Question</button>
      <button class="btn ghost" id="qaClear">Clear</button>
    </div>
    <div class="qa-match" id="qaMatch"><div><strong id="qaMatchTitle"></strong><small id="qaMatchWhy"></small></div><button class="btn green" id="qaRevealMatch">✅ Reveal</button></div>
    <details class="qa-aliases"><summary>Accepted answers and synonyms</summary><div class="qa-alias-grid" id="qaAliases"></div></details>
    <div class="qa-shortcuts">Keyboard: 1–8 reveal answer • X strike • U undo strike • A award • N next question</div>`;

  const card=document.querySelector('.card');
  card?.before(section);

  const input=section.querySelector('#qaSearch');
  const matchBox=section.querySelector('#qaMatch');
  const matchTitle=section.querySelector('#qaMatchTitle');
  const matchWhy=section.querySelector('#qaMatchWhy');
  const revealBtn=section.querySelector('#qaRevealMatch');
  let state=KiwiSync.get(),matchedIndex=null;

  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const tokens=v=>norm(v).split(' ').filter(Boolean);
  function aliasesFor(q,label){return q?.aliases?.[label]||[]}
  function scoreGuess(guess,candidate){
    const g=norm(guess),c=norm(candidate);if(!g||!c)return 0;if(g===c)return 100;if(c.includes(g)||g.includes(c))return 82;
    const gt=tokens(g),ct=tokens(c),shared=gt.filter(x=>ct.includes(x)).length;
    return shared?Math.round(55*shared/Math.max(gt.length,ct.length)):0;
  }
  function findMatch(text){
    const q=KIWI_FEUD_BANK[state.questionIndex];if(!q||!text.trim())return null;
    let best=null;
    q.a.forEach((a,i)=>{
      const choices=[a[0],...aliasesFor(q,a[0])];
      choices.forEach(choice=>{const score=scoreGuess(text,choice);if(!best||score>best.score)best={i,label:a[0],choice,score,points:a[1]}});
    });
    return best&&best.score>=45?best:null;
  }
  function clearHighlights(){document.querySelectorAll('.answer.qa-highlight').forEach(x=>x.classList.remove('qa-highlight'))}
  function updateMatch(){
    clearHighlights();const found=findMatch(input.value);matchedIndex=found?.i??null;
    if(!found){matchBox.classList.remove('show');return}
    matchTitle.textContent=`Likely match: ${found.label} — ${found.points} points`;
    matchWhy.textContent=norm(found.choice)===norm(found.label)?'Matched the board answer.':`Accepted synonym: “${found.choice}”`;
    matchBox.classList.add('show');
    document.querySelectorAll('.answer')[found.i]?.classList.add('qa-highlight');
    revealBtn.disabled=(state.revealed||[]).includes(found.i)||state.roundAwarded;
    revealBtn.textContent=revealBtn.disabled?'Already Revealed':'✅ Reveal Match';
  }
  input.addEventListener('input',updateMatch);
  section.querySelector('#qaClear').onclick=()=>{input.value='';matchedIndex=null;matchBox.classList.remove('show');clearHighlights();input.focus()};
  revealBtn.onclick=()=>{
    if(matchedIndex===null)return;
    window.reveal?.(matchedIndex);
    input.value='';matchBox.classList.remove('show');clearHighlights();input.focus();
  };
  section.querySelector('#qaSpeak').onclick=()=>{
    const q=KIWI_FEUD_BANK[state.questionIndex];if(!q)return;
    if(!('speechSynthesis' in window))return alert('Question reading is not supported by this browser.');
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(q.q);u.lang='en-NZ';u.rate=.92;speechSynthesis.speak(u);
  };

  function render(s){
    state=s;const q=KIWI_FEUD_BANK[s.questionIndex];
    const title=section.querySelector('#qaTitle'),meta=section.querySelector('#qaMeta'),aliasGrid=section.querySelector('#qaAliases');
    input.disabled=!q||s.roundAwarded;
    section.querySelector('#qaSpeak').disabled=!q;
    if(!q){title.textContent='Start a question to use host assistance';meta.innerHTML='<span class="qa-chip">No active question</span>';aliasGrid.innerHTML='<div class="qa-empty">Accepted answers will appear here.</div>';return}
    title.textContent=q.q;
    meta.innerHTML=`<span class="qa-chip">${q.c}</span><span class="qa-chip">Question ${s.questionIndex+1}</span><span class="qa-chip">${(s.revealed||[]).length}/${q.a.length} revealed</span><span class="qa-chip">${q.difficulty||'medium'} difficulty</span>`;
    aliasGrid.innerHTML=q.a.map((a,i)=>{
      const aliases=aliasesFor(q,a[0]);
      return `<div class="qa-alias-row"><b>${i+1}. ${a[0]} (${a[1]})</b><span>${aliases.length?aliases.join(', '):'No extra synonyms stored'}</span></div>`;
    }).join('');
    updateMatch();
  }

  addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const q=KIWI_FEUD_BANK[state.questionIndex];if(!q)return;
    if(/^[1-8]$/.test(e.key)){const i=Number(e.key)-1;if(q.a[i])window.reveal?.(i)}
    else if(e.key.toLowerCase()==='x')window.strike?.();
    else if(e.key.toLowerCase()==='u')window.undoStrike?.();
    else if(e.key.toLowerCase()==='a')window.award?.();
    else if(e.key.toLowerCase()==='n')window.nextQuestion?.();
  });

  KiwiSync.subscribe(render);
})();
