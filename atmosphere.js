(()=>{
  let ctx=null,master=null,musicGain=null,musicTimer=null,enabled=false;
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-sound-v1'):null;
  function ensure(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);musicGain=ctx.createGain();musicGain.gain.value=.13;musicGain.connect(master)}
  async function unlock(){ensure();if(ctx.state==='suspended')await ctx.resume()}
  function tone(freq,dur=.12,type='sine',vol=.15,when=0,dest){if(!enabled)return;ensure();const t=ctx.currentTime+when,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.connect(g);g.connect(dest||master);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.start(t);o.stop(t+dur+.03)}
  function chord(notes,dur=.7,vol=.025){notes.forEach((n,i)=>tone(n,dur,i%2?'triangle':'sine',vol,0,musicGain))}
  function startMusic(){stopMusic();let step=0;const p=[[261.6,329.6,392],[220,277.2,329.6],[174.6,220,261.6],[196,246.9,293.7]];const tick=()=>{if(!enabled)return;const c=p[step++%p.length];chord(c,1.75,.022);tone(c[0]/2,.2,'sine',.03,0,musicGain);tone(c[1],.08,'triangle',.018,.7,musicGain)};tick();musicTimer=setInterval(tick,1800)}
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
  function ping(){tone(659,.09,'triangle',.2);tone(880,.18,'triangle',.18,.08)}
  function buzzer(){tone(118,.48,'sawtooth',.28);tone(78,.62,'square',.13,.03)}
  function win(){[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.14,i*.1))}
  function question(){tone(392,.1,'triangle',.11);tone(523,.16,'triangle',.12,.09)}
  async function setEnabled(value){await unlock();enabled=!!value;if(enabled){startMusic();ping()}else stopMusic();updateButton();return enabled}
  function handle(msg){if(!msg)return;if(msg.type==='enable')setEnabled(msg.value);if(msg.type==='ping')ping();if(msg.type==='buzzer')buzzer();if(msg.type==='win')win();if(msg.type==='question')question()}
  if(channel)channel.onmessage=e=>handle(e.data);
  function send(type,data={}){handle({type,...data});if(channel)channel.postMessage({type,...data})}
  window.KiwiAudio={enable:async value=>{const on=await setEnabled(value);if(channel)channel.postMessage({type:'enable',value:on});return on},ping:()=>send('ping'),buzzer:()=>send('buzzer'),win:()=>send('win'),question:()=>send('question'),isEnabled:()=>enabled};
  let toggle;
  function updateButton(){if(toggle)toggle.textContent=enabled?'🔇 Sound On — Tap to Mute':'🔊 Enable Game Sound'}
  if(document.title.includes('Host')){
    const panel=document.createElement('section');panel.style.cssText='position:sticky;bottom:8px;z-index:9999;margin:12px auto 0;max-width:820px;background:#102f4e;border:1px solid #ffffff24;border-radius:14px;padding:10px;box-shadow:0 15px 40px #0009';
    panel.innerHTML='<div style="font-weight:1000;color:#ffd24b;margin-bottom:8px">🔊 GAME SOUNDS</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><button id="audioToggle" class="btn gold">🔊 Enable Game Sound</button><button id="audioPing" class="btn green">✅ Correct — PING</button><button id="audioBuzz" class="btn red">❌ Wrong — BUZZER</button></div><div style="font-size:11px;color:#b6ccda;text-align:center;margin-top:7px">Sound plays on the host and audience screen. Browsers require one tap to enable audio.</div>';
    document.querySelector('main')?.appendChild(panel);toggle=panel.querySelector('#audioToggle');
    toggle.onclick=()=>window.KiwiAudio.enable(!enabled);panel.querySelector('#audioPing').onclick=()=>window.KiwiAudio.ping();panel.querySelector('#audioBuzz').onclick=()=>window.KiwiAudio.buzzer();
  } else {
    const unlockBtn=document.createElement('button');unlockBtn.textContent='🔊 Enable Audience Sound';unlockBtn.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;border:0;border-radius:12px;padding:10px 13px;font-weight:900;background:#ffd24b;color:#251700';document.body.appendChild(unlockBtn);unlockBtn.onclick=async()=>{await setEnabled(true);unlockBtn.remove()};
  }
})();