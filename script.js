const app = document.getElementById('app');
const openArea = document.getElementById('openArea');
const invite = document.getElementById('invite');
const musicBtn = document.getElementById('musicBtn');
const reveals = document.querySelectorAll('.reveal');
let opened = false;
let audioCtx, master, notesTimer;

function openInvitation(){
  if(opened) return;
  opened = true;
  app.classList.add('opened');
  setTimeout(()=> invite.scrollIntoView({behavior:'smooth'}), 1200);
}
openArea.addEventListener('click', openInvitation);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('show'); });
},{threshold:.18});
reveals.forEach(el => observer.observe(el));

function playTone(freq, start, dur){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(.07, start + .06);
  gain.gain.exponentialRampToValueAtTime(.001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + .05);
}
function startMusic(){
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  master = master || audioCtx.createGain();
  master.gain.value = .7;
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
