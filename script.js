const app = document.getElementById('app');
const openArea = document.getElementById('openArea');
const invite = document.getElementById('invite');
const musicBtn = document.getElementById('musicBtn');
const reveals = document.querySelectorAll('.reveal');
const petals = document.getElementById('petals');
let opened = false;
let audioCtx, master, notesTimer;

function openInvitation(){
  if(opened) return;
  opened = true;
  app.classList.add('opened');
  setTimeout(()=> invite.scrollIntoView({behavior:'smooth'}), 1150);
}
openArea.addEventListener('click', openInvitation);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('show'); });
},{threshold:.18});
reveals.forEach(el => observer.observe(el));

function makePetals(){
  const symbols = ['❀','✿','❁','♡','✧'];
  for(let i=0;i<34;i++){
    const p = document.createElement('span');
    p.textContent = symbols[i % symbols.length];
    p.style.left = Math.random()*100 + '%';
    p.style.animationDelay = (Math.random()*12) + 's';
    p.style.animationDuration = (10 + Math.random()*12) + 's';
    p.style.fontSize = (10 + Math.random()*16) + 'px';
    p.style.opacity = .25 + Math.random()*.45;
    petals.appendChild(p);
  }
}
makePetals();

function playTone(freq, start, dur){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(.06, start + .08);
  gain.gain.exponentialRampToValueAtTime(.001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + .05);
}
function startMusic(){
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  master = master || audioCtx.createGain();
  master.gain.value = .65;
  master.connect(audioCtx.destination);
  const seq = [523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
  let i = 0;
  notesTimer = setInterval(()=>{
    const now = audioCtx.currentTime;
    playTone(seq[i % seq.length], now, 1.15);
    playTone(seq[(i+2) % seq.length]/2, now+.05, 1.35);
    i++;
  }, 900);
  musicBtn.textContent = '♪';
}
function stopMusic(){ clearInterval(notesTimer); notesTimer=null; musicBtn.textContent='♫'; }
musicBtn.addEventListener('click',()=> notesTimer ? stopMusic() : startMusic());

function updateTimer(){
  const target = new Date('2026-12-13T18:00:00+05:00').getTime();
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff/86400000); diff %= 86400000;
  const h = Math.floor(diff/3600000); diff %= 3600000;
  const m = Math.floor(diff/60000); diff %= 60000;
  const s = Math.floor(diff/1000);
  const vals = [d,h,m,s].map(v => String(v).padStart(2,'0'));
  document.querySelectorAll('#timer strong').forEach((el,i)=> el.textContent = vals[i]);
}
updateTimer(); setInterval(updateTimer,1000);

function initScratch(){
  const canvas = document.getElementById('scratchCanvas');
  if(!canvas) return;
  const wrap = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  let drawing = false;

  function resize(){
    const r = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    paintCover(r.width, r.height);
  }
  function paintCover(w,h){
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#d7b06a');
    g.addColorStop(.55,'#f4dfaa');
    g.addColorStop(1,'#b98536');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,.38)';
    for(let i=0;i<16;i++){
      ctx.beginPath();
      ctx.ellipse(Math.random()*w, Math.random()*h, 35+Math.random()*55, 5+Math.random()*12, Math.random()*Math.PI, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = '#6f513e';
    ctx.font = '11px Montserrat';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('SCRATCH HERE', w/2, h/2+4);
  }
  function pos(e){
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {x:t.clientX-r.left, y:t.clientY-r.top};
  }
  function scratch(e){
    if(!drawing) return;
    e.preventDefault();
    const {x,y} = pos(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x,y,24,0,Math.PI*2);
    ctx.fill();
  }
  function start(e){ drawing=true; scratch(e); }
  function end(){ drawing=false; }

  resize(); window.addEventListener('resize', resize);
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', scratch);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', scratch, {passive:false});
  window.addEventListener('touchend', end);
}
initScratch();
