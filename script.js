// Mobil menü
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Mobil alt çubuk: açılıştaki ana düğme ekrandan çıkınca göster
const dock = document.getElementById('dock');
const heroCta = document.querySelector('.hero__cta');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    dock.classList.toggle('is-visible', !entry.isIntersecting);
  }).observe(heroCta);
} else {
  dock.classList.add('is-visible');
}

// Kaydırınca başlığa gölge
const header = document.querySelector('.header');
addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 8), { passive: true });

// Hakkımızda galerisi: kendiliğinden sağdan sola kayar, oklar, klavye ve kaydırmayla elle değişir
const gallery = document.getElementById('galeri');
const track = document.getElementById('galeriTrack');
const slides = track.querySelectorAll('img');
const count = document.getElementById('galeriCount');
const bar = document.getElementById('galeriBar');
const DELAY = 4500;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let current = 0;
let timer = null;
let hovered = false;
let inView = false;

let anim = null;

const pad = (n) => String(n).padStart(2, '0');

// Kaydırmayı kendimiz canlandırıyoruz; her tarayıcıda aynı hız ve yumuşaklık
function slideTo(left) {
  cancelAnimationFrame(anim);
  const from = track.scrollLeft;
  if (reduceMotion || Math.abs(left - from) < 1) { track.scrollLeft = left; return; }
  const start = performance.now();
  const dur = 650;
  track.style.scrollSnapType = 'none';
  const step = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    track.scrollLeft = from + (left - from) * ease;
    if (t < 1) { anim = requestAnimationFrame(step); return; }
    anim = null;
    track.style.scrollSnapType = '';
  };
  anim = requestAnimationFrame(step);
}

function goTo(i, move = true) {
  current = (i + slides.length) % slides.length;
  if (move) slideTo(current * track.clientWidth);
  count.textContent = pad(current + 1) + ' / ' + pad(slides.length);
  restart();
}

function restart() {
  clearTimeout(timer);
  bar.classList.remove('is-running');
  const play = !reduceMotion && !hovered && inView && !document.hidden;
  gallery.classList.toggle('is-paused', !play);
  if (!play) return;
  void bar.offsetWidth; // çubuk animasyonunu baştan başlat
  bar.classList.add('is-running');
  timer = setTimeout(() => goTo(current + 1), DELAY);
}

gallery.style.setProperty('--gallery-delay', DELAY + 'ms');
document.getElementById('galeriPrev').addEventListener('click', () => goTo(current - 1));
document.getElementById('galeriNext').addEventListener('click', () => goTo(current + 1));
track.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
});

// Parmakla kaydırınca sayacı güncelle
let scrollEnd;
track.addEventListener('scroll', () => {
  if (anim) return;
  clearTimeout(scrollEnd);
  scrollEnd = setTimeout(() => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current) goTo(i, false);
  }, 120);
}, { passive: true });
track.addEventListener('pointerdown', () => { cancelAnimationFrame(anim); anim = null; track.style.scrollSnapType = ''; });

// Fare üstündeyken, sekme gizliyken ya da galeri ekranda değilken dur
gallery.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = true; restart(); } });
gallery.addEventListener('pointerleave', () => { hovered = false; restart(); });
document.addEventListener('visibilitychange', restart);
addEventListener('resize', () => { track.scrollLeft = current * track.clientWidth; });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; restart(); }, { threshold: 0.4 }).observe(gallery);
} else {
  inView = true;
  restart();
}

// Açık / kapalı durumu (Antalya saatiyle). Pzt-Cmt 08:30-18:00, Pazar kapalı.
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const OPEN = 8 * 60 + 30;
const CLOSE = 18 * 60;

function istanbulNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) % 24 * 60 + Number(get('minute')) };
}

function nextOpening(day, minutes) {
  if (day !== 0 && minutes < OPEN) return 'bugün 08:30';
  const next = (day + 1) % 7 === 0 ? 1 : (day + 1) % 7;
  return (next === (day + 1) % 7 ? 'yarın' : DAYS[next]) + ' 08:30';
}

function updateStatus() {
  const el = document.getElementById('openStatus');
  const { day, minutes } = istanbulNow();
  const open = day !== 0 && minutes >= OPEN && minutes < CLOSE;
  el.classList.toggle('is-open', open);
  el.lastChild.textContent = open
    ? 'Açık · 18:00\'e kadar'
    : 'Kapalı · ' + nextOpening(day, minutes) + '\'da açılır';
  const row = document.querySelector('.hours tr[data-day="' + day + '"]');
  if (row) row.classList.add('is-today');
}
updateStatus();
setInterval(updateStatus, 60000);

// Yıl
document.getElementById('year').textContent = new Date().getFullYear();

// Plaka alanını büyük harfe çevir
const plaka = document.getElementById('f-plaka');
plaka.addEventListener('input', () => { plaka.value = plaka.value.toLocaleUpperCase('tr-TR'); });

// Form. Önizlemede ve yerelde talep kimseye iletilmez; ziyaretçi aramaya yönlendirilir.
// İşletme onaylayınca PREVIEW = false yapın ve formu bir form servisine bağlayın.
const PREVIEW = true;
const form = document.getElementById('teklifForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  if (PREVIEW || location.protocol === 'file:') {
    e.preventDefault();
    note.textContent = 'Bu sayfa bir tasarım önizlemesi, form talepleri henüz iletilmiyor. Teklif için lütfen arayın: 0242 345 55 15';
  }
});
