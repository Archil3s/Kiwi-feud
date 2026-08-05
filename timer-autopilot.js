(()=>{
  if(!document.title.includes('Host')) return;

  const waitForTimer=()=>{
    const panel=document.querySelector('.timer-panel');
    if(!panel) return false;
    if(panel.dataset.autopilotReady) return true;
    panel.dataset.autopilotReady='1';

    const css=document.createElement('style');
    css.textContent=`
      .timer-autopilot{display:grid;gap:8px;margin-top:10px;padding:10px;border-radius:12px;background:#061b2d;border:1px solid #ffffff18}
      .timer-auto-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.timer-auto-head strong{color:#ffd24b}.timer-auto-state{font-size:11px;color:#b9cedb;text-align:center;padding:7px;border-radius:9px;background:#ffffff08}
      .timer-auto-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.timer-auto-grid .btn{min-height:42px}
      .timer-step{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.timer-step span{height:6px;border-radius:99px;background:#ffffff14}.timer-step span.on{background:#ffd24b}.timer-step span.done{background:#238b59}
      @media(max-width:620px){.timer-auto-grid{grid-template-columns:1fr}.timer-step{grid-template-columns:repeat(4,1fr)}}
    `;
    document.head.appendChild(css);

    const box=document.createElement('div');
    box.className='timer-autopilot';
    box.innerHTML=`
      <div class="timer-auto-head"><strong>⚙ Timer Autopilot</strong><button class="btn green" id="timerAutoToggle">Autopilot On</button></div>
      <div class="timer-step"><span data-step="ready"></span><span data-step="running"></span><span data-step="paused"></span><span data-step="complete"></span></div>
      <div class="timer-auto-grid">
        <label class="field"><span>Start behaviour</span><select id="timerAutoStart"><option value="question">Start with each new question</option><option value="control">Start when team gains control</option><option value="manual">Manual start only</option></select></label>
        <label class="field"><span>Correct answer</span><select id="timerCorrectFlow"><option value="continue">Keep counting</option><option value="reset">Reset for next answer</option><option value="pause">Pause after reveal</option></select></label>
      </div>
      <div class="timer-auto-grid"><button class="btn" id="timerNextAnswer">↻ Reset for Next Answer</button><button class="btn gold" id="timerQuickSpeed">⚡ Start 60s Speed Round</button></div>
      <div class="timer-auto-state" id="timerAutoState">Ready — the timer will manage itself.</div>`;
    panel.appendChild(box);

    const get=id=>panel.querySelector(id);
    const start=get('#timerStart'),pause=get('#timerPause'),reset=get('#timerReset'),length=get('#roundTimerLength'),label=get('#roundTimerLabel');
    const toggle=get('#timerAutoToggle'),startMode=get('#timerAutoStart'),correctFlow=get('#timerCorrectFlow'),stateText=get('#timerAutoState');
    let enabled=true,lastQuestion=-1,lastPhase='',pausedByFlow=false;

    const setState=(name,text)=>{
      stateText.textContent=text;
      const order=['ready','running','paused','complete'],idx=order.indexOf(name);
      box.querySelectorAll('[data-step]').forEach((el,i)=>{el.classList.toggle('on',i===idx);el.classList.toggle('done',i<idx)});
    };
    const click=el=>el&&!el.disabled&&el.click();
    const restart=()=>{click(reset);setTimeout(()=>click(start),80);pausedByFlow=false;setState('running','Timer running for the current answer.');};
    const pauseFlow=(text)=>{click(pause);pausedByFlow=true;setState('paused',text);};

    toggle.onclick=()=>{enabled=!enabled;toggle.textContent=enabled?'Autopilot On':'Autopilot Off';toggle.classList.toggle('green',enabled);setState(enabled?'ready':'paused',enabled?'Ready — the timer will manage itself.':'Autopilot is off. Manual controls still work.');};
    get('#timerNextAnswer').onclick=restart;
    get('#timerQuickSpeed').onclick=()=>{
      length.value='60';length.dispatchEvent(new Event('change',{bubbles:true}));
      label.value='Speed Round';label.dispatchEvent(new Event('change',{bubbles:true}));
      const speed=get('#speedMode');if(speed&&!speed.classList.contains('gold'))speed.click();
      const auto=get('#speedAuto');if(auto&&!auto.classList.contains('green'))auto.click();
      restart();
    };

    const originalReveal=window.reveal;
    if(typeof originalReveal==='function') window.reveal=function(i){
      const before=KiwiSync.get();
      if((before.revealed||[]).includes(i)||before.roundAwarded)return;
      originalReveal(i);
      if(!enabled)return;
      setTimeout(()=>{
        if(correctFlow.value==='reset') restart();
        else if(correctFlow.value==='pause') pauseFlow('Correct answer revealed — press Reset for Next Answer when ready.');
        else setState('running','Correct answer revealed — countdown continues.');
      },1400);
    };

    const originalStrike=window.strike;
    if(typeof originalStrike==='function') window.strike=function(){
      originalStrike();
      if(!enabled)return;
      pauseFlow('Strike animation playing — timer paused automatically.');
      setTimeout(()=>{
        const s=KiwiSync.get();
        if(s.phase==='steal') restart();
        else {click(start);pausedByFlow=false;setState('running','Strike finished — countdown resumed.');}
      },1350);
    };

    KiwiSync.subscribe(s=>{
      if(!enabled)return;
      const questionChanged=s.questionIndex!==lastQuestion;
      const phaseChanged=s.phase!==lastPhase;
      if(questionChanged){
        lastQuestion=s.questionIndex;
        if(s.questionIndex>=0&&startMode.value==='question') setTimeout(restart,220);
      }
      if(phaseChanged){
        lastPhase=s.phase;
        if(s.phase==='play'&&startMode.value==='control') setTimeout(restart,180);
        if(s.phase==='steal') {length.value='15';length.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(restart,180);setState('running','Steal timer started automatically.');}
        if(s.roundAwarded){click(pause);setState('complete','Round complete — timer stopped.');}
      }
    });

    const timerObserver=new MutationObserver(()=>{
      const txt=panel.querySelector('[data-time]')?.textContent?.trim();
      if(!enabled||!txt)return;
      if(txt==='0:00')setState('complete','Time is up — awaiting the next question.');
      else if(!pausedByFlow&&txt!==`0:${String(Number(length.value)||20).padStart(2,'0')}`)setState('running','Timer running automatically.');
    });
    timerObserver.observe(panel,{subtree:true,characterData:true,childList:true});
    setState('ready','Ready — the timer will manage itself.');
    return true;
  };

  if(!waitForTimer()){
    const observer=new MutationObserver(()=>{if(waitForTimer())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),7000);
  }
})();
