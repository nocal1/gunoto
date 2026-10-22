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
