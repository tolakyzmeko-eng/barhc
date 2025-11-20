// Mobile-friendly slider + background randomizer + dots
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('slideWrapper');
  const slides = Array.from(wrapper.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const bg = document.getElementById('transition-photo');
  const yearA = document.getElementById('yearA');
  const yearB = document.getElementById('yearB');
  if (yearA) yearA.textContent = new Date().getFullYear();
  if (yearB) yearB.textContent = new Date().getFullYear();

  // Background images array (replace with your paths)
  const backgrounds = [
    'url("bg1.jpg")',
    'url("bg2.jpg")',
    'url("bg3.jpg")'
  ];
  // Random initial background
  if (bg && backgrounds.length) {
    bg.style.backgroundImage = backgrounds[Math.floor(Math.random()*backgrounds.length)];
  }

  let index = 0;
  function goTo(i){
    index = Math.max(0, Math.min(i, slides.length - 1));
    const shift = index * wrapper.clientWidth;
    wrapper.style.transform = `translateX(-${shift}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
  }

  // Dots click
  dots.forEach(d => d.addEventListener('click', () => {
    goTo(Number(d.dataset.index || d.getAttribute('data-index') || Array.from(dots).indexOf(d)));
  }));

  // Touch swipe (horizontal) for mobile
  let startX = 0, dx = 0, dragging = false;
  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    wrapper.style.transition = 'none';
  }, {passive:true});

  wrapper.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    dx = e.touches[0].clientX - startX;
    wrapper.style.transform = `translateX(${-index * wrapper.clientWidth + -dx}px)`;
  }, {passive:true});

  wrapper.addEventListener('touchend', (e) => {
    dragging = false;
    wrapper.style.transition = '';
    if (Math.abs(dx) > 60) {
      if (dx < 0 && index < slides.length - 1) index++;
      if (dx > 0 && index > 0) index--;
    }
    dx = 0;
    goTo(index);
  });

  // Keyboard arrows
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && index < slides.length - 1) goTo(index + 1);
    if (e.key === 'ArrowLeft' && index > 0) goTo(index - 1);
  });

  // Resize handler to recalc translate
  window.addEventListener('resize', () => goTo(index));

  // Initialize
  setTimeout(() => goTo(0), 60);
});
