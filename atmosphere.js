(()=>{
  let ctx=null, master=null, musicGain=null, musicTimer=null, enabled=false;
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('kiwi-feud-sound-v1'):null;

  function ensure(){
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);
    musicGain=ctx.createGain();musicGain.gain.value=.13;musicGain.connect(master);
  }
  async function unlock(){ensure();if(ctx.state==='suspended')await ctx.resume()}
  function tone(freq,dur=.12,type='sine',vol=.15,when=0,dest){
    if(!enabled)return;ensure();
    const t=ctx.currentTime+when,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);o.connect(g);g.connect(dest||master);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.start(t);o.stop(t+dur+.03);
  }
  function chord(notes,dur=.7,vol=.025){notes.forEach((n,i)=>tone(n,dur,i%2?'triangle':'sine',vol,0,musicGain))}
  function startMusic(){
    stopMusic();let step=0;
    const progression=[[261.6,329.6,392],[220,277.2,329.6],[174.6,220,261.6],[196,246.9,293.7]];
    const tick=()=>{if(!enabled)return;const c=progression[step++%progression.length];chord(c,1.75,.022);tone(c[0]/2,.2,'sine',.03,0,musicGain);tone(c[1],.08,'triangle',.018,.7,musicGain)};
    tick();musicTimer=setInterval(tick,1800);
  }
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
  function ping(){tone(659,.09,'triangle',.2);tone(880,.18,'triangle',.18,.08)}
  function buzzer(){tone(118,.48,'sawtooth',.28);tone(78,.62,'square',.13,.03)}
  function win(){[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.14,i*.1))}
  function question(){tone(392,.1,'triangle',.11);tone(523,.16,'triangle',.12,.09)}
  async function setEnabled(value){await unlock();enabled=!!value;if(enabled){startMusic();ping()}else stopMusic();return enabled}
  function handle(msg){if(!msg)return;if(msg.type==='enable')setEnabled(msg.value);if(msg.type==='ping')ping();if(msg.type==='buzzer')buzzer();if(msg.type==='win')win();if(msg.type==='question')question()}
  if(channel)channel.onmessage=e=>handle(e.data);
  window.KiwiAudio={
    enable:async value=>{const on=await setEnabled(value);if(channel)channel.postMessage({type:'enable',value:on});return on},
    ping:()=>{ping();if(channel)channel.postMessage({type:'ping'})},
    buzzer:()=>{buzzer();if(channel)channel.postMessage({type:'buzzer'})},
    win:()=>{win();if(channel)channel.postMessage({type:'win'})},
    question:()=>{question();if(channel)channel.postMessage({type:'question'})},
    isEnabled:()=>enabled
  };
})();