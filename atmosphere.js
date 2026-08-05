(()=>{
  let ctx=null, master=null, musicGain=null, musicTimer=null, enabled=false, lastState=null;
  const overlay=document.createElement('button');
  overlay.id='soundToggle';
  overlay.textContent='🔊 Start Game Sound';
  Object.assign(overlay.style,{position:'fixed',right:'14px',bottom:'14px',zIndex:'9999',border:'1px solid #ffe68a',borderRadius:'14px',padding:'12px 16px',fontWeight:'900',background:'linear-gradient(#ffe177,#e6a51f)',color:'#251700',boxShadow:'0 10px 30px #0008',cursor:'pointer'});
  document.body.appendChild(overlay);

  function ensure(){
    if(ctx) return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain(); master.gain.value=.52; master.connect(ctx.destination);
    musicGain=ctx.createGain(); musicGain.gain.value=.16; musicGain.connect(master);
  }
  function tone(freq,dur=.12,type='sine',vol=.15,when=0,dest=master){
    if(!enabled) return;
    ensure();
    const t=ctx.currentTime+when,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);o.connect(g);g.connect(dest||master);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.start(t);o.stop(t+dur+.02);
  }
  function chord(notes,dur=.55,vol=.045,when=0){notes.forEach((n,i)=>tone(n,dur,i%2?'triangle':'sine',vol,when,musicGain));}
  function startMusic(){
    stopMusic();
    const progression=[[261.6,329.6,392],[220,277.2,329.6],[174.6,220,261.6],[196,246.9,293.7]];
    let step=0;
    const tick=()=>{
      if(!enabled)return;
      const c=progression[step%progression.length];
      chord(c,1.7,.028,0);
      tone(c[0]/2,.22,'sine',.038,0,musicGain);
      tone(c[0],.09,'triangle',.025,.42,musicGain);
      tone(c[1],.09,'triangle',.022,.84,musicGain);
      step++;
    };
    tick();musicTimer=setInterval(tick,1800);
  }
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}}
  function revealSfx(){tone(523,.09,'triangle',.18);tone(659,.12,'triangle',.16,.08);tone(784,.2,'triangle',.15,.17)}
  function strikeSfx(){tone(120,.42,'sawtooth',.24);tone(82,.55,'square',.12,.04)}
  function awardSfx(){[523,659,784,1047].forEach((f,i)=>tone(f,.28,'triangle',.14,i*.1))}
  function newQuestionSfx(){tone(392,.12,'triangle',.12);tone(523,.16,'triangle',.13,.1)}

  overlay.addEventListener('click',async()=>{
    ensure();await ctx.resume();enabled=!enabled;
    overlay.textContent=enabled?'🔇 Mute Game Sound':'🔊 Start Game Sound';
    if(enabled){startMusic();awardSfx()}else stopMusic();
  });

  if(window.KiwiSync){
    KiwiSync.subscribe(s=>{
      if(lastState&&enabled){
        if(s.questionIndex!==lastState.questionIndex)newQuestionSfx();
        if((s.revealed?.length||0)>(lastState.revealed?.length||0))revealSfx();
        if((s.strikes||0)>(lastState.strikes||0))strikeSfx();
        if(s.roundAwarded&&!lastState.roundAwarded)awardSfx();
      }
      lastState=s;
    });
  }
})();