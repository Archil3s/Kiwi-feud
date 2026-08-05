(()=>{
  let ctx=null,master=null,musicGain=null,sfxGain=null,musicTimer=null,enabled=false,musicOn=true;
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-sound-v1'):null;
  function ensure(){
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain(); master.gain.value=.72; master.connect(ctx.destination);
    musicGain=ctx.createGain(); musicGain.gain.value=.13; musicGain.connect(master);
    sfxGain=ctx.createGain(); sfxGain.gain.value=.9; sfxGain.connect(master);
  }
  async function unlock(){ensure();if(ctx.state==='suspended')await ctx.resume()}
  function tone(freq,dur=.12,type='sine',vol=.15,when=0,dest=sfxGain,slide=null){
    if(!enabled)return;ensure();
    const t=ctx.currentTime+when,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    o.connect(g);g.connect(dest||sfxGain);g.gain.setValueAtTime(Math.max(.001,vol),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.start(t);o.stop(t+dur+.04);
  }
  function noise(dur=.22,vol=.08,when=0){
    if(!enabled)return;ensure();const t=ctx.currentTime+when,b=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=900;f.Q.value=.7;g.gain.value=vol;src.connect(f);f.connect(g);g.connect(sfxGain);src.start(t);src.stop(t+dur);
  }
  function brass(notes,start=0,dur=.28,vol=.09){notes.forEach((n,i)=>{tone(n,dur,'sawtooth',vol,start+i*.055,sfxGain,n*1.01);tone(n*2,dur*.72,'square',vol*.18,start+i*.055,sfxGain)})}
  function chord(notes,dur=.65,vol=.024,when=0){notes.forEach((n,i)=>tone(n,dur,i%2?'triangle':'sine',vol,when,musicGain))}
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
  function startMusic(){
    stopMusic();if(!enabled||!musicOn)return;
    let step=0;const p=[[196,246.94,293.66],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,311.13]];
    const tick=()=>{if(!enabled||!musicOn)return;const c=p[step++%p.length];chord(c,1.55,.023);tone(c[0]/2,.18,'sine',.038,0,musicGain);tone(c[1],.07,'triangle',.02,.36,musicGain);tone(c[2],.08,'triangle',.018,.76,musicGain);};
    tick();musicTimer=setInterval(tick,1650);
  }
  function correct(){brass([659.25,783.99,987.77],0,.22,.095);tone(1318.5,.34,'triangle',.15,.18);noise(.12,.025,.08)}
  function buzzer(){tone(145,.52,'sawtooth',.30,0,sfxGain,82);tone(72,.7,'square',.18,.02,sfxGain,55);noise(.42,.12,0)}
  function faceoff(){brass([392,523.25,659.25],0,.18,.075);tone(783.99,.28,'triangle',.10,.18)}
  function win(){brass([523.25,659.25,783.99,1046.5],0,.34,.095);brass([659.25,783.99,987.77,1318.5],.28,.42,.08);noise(.3,.05,.28)}
  function countdown(){tone(880,.08,'square',.08);tone(660,.08,'square',.06,.11)}
  async function setEnabled(value){await unlock();enabled=!!value;if(enabled){startMusic();faceoff()}else stopMusic();updateButtons();return enabled}
  function setMusic(value){musicOn=!!value;if(musicOn)startMusic();else stopMusic();updateButtons()}
  function handle(msg){if(!msg)return;if(msg.type==='enable')setEnabled(msg.value);if(msg.type==='music')setMusic(msg.value);if(msg.type==='correct')correct();if(msg.type==='buzzer')buzzer();if(msg.type==='win')win();if(msg.type==='faceoff')faceoff();if(msg.type==='countdown')countdown()}
  if(channel)channel.onmessage=e=>handle(e.data);
  function send(type,data={}){handle({type,...data});if(channel)channel.postMessage({type,...data})}
  window.KiwiAudio={
    enable:async value=>{const on=await setEnabled(value);if(channel)channel.postMessage({type:'enable',value:on});return on},
    music:value=>{setMusic(value);if(channel)channel.postMessage({type:'music',value:musicOn})},
    ping:()=>send('correct'),correct:()=>send('correct'),buzzer:()=>send('buzzer'),win:()=>send('win'),question:()=>send('faceoff'),faceoff:()=>send('faceoff'),countdown:()=>send('countdown'),isEnabled:()=>enabled
  };
  let toggle,musicToggle;
  function updateButtons(){if(toggle)toggle.textContent=enabled?'🔇 Sound On — Tap to Mute':'🔊 Enable Game Sound';if(musicToggle)musicToggle.textContent=musicOn?'🎵 Background On':'🎵 Background Off'}
  if(document.title.includes('Host')){
    const panel=document.createElement('section');panel.style.cssText='position:sticky;bottom:8px;z-index:9999;margin:12px auto 0;max-width:820px;background:#102f4e;border:1px solid #ffffff24;border-radius:14px;padding:10px;box-shadow:0 15px 40px #0009';
    panel.innerHTML='<div style="font-weight:1000;color:#ffd24b;margin-bottom:8px">🎺 ORIGINAL GAME-SHOW SOUNDBOARD</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"><button id="audioToggle" class="btn gold">🔊 Enable Game Sound</button><button id="musicToggle" class="btn">🎵 Background On</button><button id="audioPing" class="btn green">✅ Correct Answer</button><button id="audioBuzz" class="btn red">❌ Wrong Answer</button><button id="audioFaceoff" class="btn">🎤 Face-Off Cue</button><button id="audioWin" class="btn gold">🏆 Round Win</button></div><div style="font-size:11px;color:#b6ccda;text-align:center;margin-top:7px">Original brassy game-show sounds. No copyrighted TV audio is used.</div>';
    document.querySelector('main')?.appendChild(panel);toggle=panel.querySelector('#audioToggle');musicToggle=panel.querySelector('#musicToggle');
    toggle.onclick=()=>window.KiwiAudio.enable(!enabled);musicToggle.onclick=()=>window.KiwiAudio.music(!musicOn);panel.querySelector('#audioPing').onclick=()=>window.KiwiAudio.correct();panel.querySelector('#audioBuzz').onclick=()=>window.KiwiAudio.buzzer();panel.querySelector('#audioFaceoff').onclick=()=>window.KiwiAudio.faceoff();panel.querySelector('#audioWin').onclick=()=>window.KiwiAudio.win();
    const downloadScript=document.createElement('script');downloadScript.src='downloads.js';document.body.appendChild(downloadScript);
  }else{
    const unlockBtn=document.createElement('button');unlockBtn.textContent='🔊 Enable Audience Sound';unlockBtn.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;border:0;border-radius:12px;padding:10px 13px;font-weight:900;background:#ffd24b;color:#251700';document.body.appendChild(unlockBtn);unlockBtn.onclick=async()=>{await setEnabled(true);unlockBtn.remove()};
  }
})();