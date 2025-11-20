// script.js — повна заміна: коректний translateX, динамічний wrapper width, свайп, доти, ресайз
document.addEventListener('DOMContentLoaded', () => {
  const slideWrapper = document.getElementById('slideWrapper') || document.querySelector('.slide-wrapper');
  if (!slideWrapper) return;
  const slides = Array.from(slideWrapper.querySelectorAll('.slide, .main-wrapper.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const bg = document.getElementById('transition-photo');
  const yearA = document.getElementById('yearA') || document.getElementById('year');
  const yearB = document.getElementById('yearB');

  if (yearA) yearA.textContent = new Date().getFullYear();
  if (yearB) yearB.textContent = new Date().getFullYear();

  // optional backgrounds (replace with your images)
  const backgrounds = ['url("bg1.jpg")','url("bg2.jpg")','url("bg3.jpg")'];
  if (bg && backgrounds.length) bg.style.backgroundImage = backgrounds[Math.floor(Math.random()*backgrounds.length)];

  // Init: set wrapper width as slides.length * 100% and per-slide flex basis
  function initLayout() {
    slideWrapper.style.width = `${slides.length * 100}%`;
    slides.forEach(s => {
      s.style.flex = '0 0 100%';
      s.style.minWidth = '100%';
    });
  }
  initLayout();

  // How many slides visible at once (1 on mobile, 2 on wider screens)
  function visibleCount() {
    return window.matchMedia('(min-width:720px)').matches ? 2 : 1;
  }

  function viewportWidth() {
    const container = slideWrapper.parentElement;
    return container ? container.clientWidth : window.innerWidth;
  }

  let index = 0;
  function clamp(i) {
    const maxIndex = Math.max(0, slides.length - visibleCount());
    return Math.min(Math.max(0, i), maxIndex);
  }

  function update(animate = true) {
    index = clamp(index);
    const visible = visibleCount();
    const vw = viewportWidth();
    // width per visible slot (if visible=2, each visible slot is vw/2)
    const slot = vw / visible;
    const shift = Math.round(slot * index);
    if (!animate) slideWrapper.style.transition = 'none';
    else slideWrapper.style.transition = 'transform .38s cubic-bezier(.22,.9,.32,1)';
    slideWrapper.style.transform = `translateX(-${shift}px)`;
    dots.forEach((d,i)=> d.classList.toggle('active', i === index));
  }

  // Dots click
  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      index = clamp(i);
      update(true);
    });
  });

  // Touch / mouse drag
  let startX = 0, dx = 0, dragging = false;
  function onStart(e) {
    if (e.touches && e.touches.length > 1) return;
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    dx = 0;
    slideWrapper.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dx = clientX - startX;
    const visible = visibleCount();
    const vw = viewportWidth();
    const base = (vw / visible) * index;
    slideWrapper.style.transform = `translateX(${-base - dx}px)`;
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;
    slideWrapper.style.transition = '';
    const threshold = Math.max(40, viewportWidth() * 0.08);
    if (Math.abs(dx) > threshold) {
      if (dx < 0 && index < slides.length - visibleCount()) index++;
      if (dx > 0 && index > 0) index--;
    }
    dx = 0;
    update(true);
  }

  slideWrapper.addEventListener('touchstart', onStart, {passive:true});
  slideWrapper.addEventListener('touchmove', onMove, {passive:true});
  slideWrapper.addEventListener('touchend', onEnd);
  // mouse support for desktop drag
  slideWrapper.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    onStart(e);
    const onMoveWin = (ev) => onMove(ev);
    const onUpWin = (ev) => { onEnd(ev); window.removeEventListener('mousemove', onMoveWin); window.removeEventListener('mouseup', onUpWin); };
    window.addEventListener('mousemove', onMoveWin);
    window.addEventListener('mouseup', onUpWin);
  });

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { index = clamp(index + 1); update(true); }
    if (e.key === 'ArrowLeft')  { index = clamp(index - 1); update(true); }
  });

  // resize: recompute layout and keep same logical index
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      initLayout();
      index = clamp(index);
      update(false);
    }, 80);
  });

  // Final init
  setTimeout(() => { initLayout(); index = clamp(index); update(false); }, 60);
});
