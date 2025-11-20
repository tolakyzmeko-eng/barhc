// script.js
// Повна заміна: динамічний wrapper width, коректний translateX, dots, свайп/drag, клавіші, ресайз
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('slideWrapper');                 // .slide-wrapper
  if (!wrapper) return;
  const slides = Array.from(wrapper.querySelectorAll('.slide'));          // .main-wrapper.slide
  const dots = Array.from(document.querySelectorAll('.dot'));             // кнопки-доти
  const bg = document.getElementById('transition-photo');
  const yearA = document.getElementById('yearA');
  const yearB = document.getElementById('yearB');

  if (yearA) yearA.textContent = new Date().getFullYear();
  if (yearB) yearB.textContent = new Date().getFullYear();

  // Зразок фонів (замініть шляхи на свої)
  const backgrounds = ['url("bg1.jpg")','url("bg2.jpg")','url("bg3.jpg")'];
  if (bg && backgrounds.length) bg.style.backgroundImage = backgrounds[Math.floor(Math.random()*backgrounds.length)];

  // Ініціалізація стилів wrapper/slides під кількість слайдів
  function initLayout() {
    // встановлюємо ширину wrapper у відсотках за кількістю слайдів
    wrapper.style.width = `${slides.length * 100}%`;
    // кожен слайд займає 100% видимої області за замовчуванням
    slides.forEach(s => {
      s.style.flex = '0 0 100%';
      s.style.minWidth = '100%';
    });
    // при великих екранах ми показуємо по 2 слайда одночасно — стилі CSS задають flex-basis:50%,
    // але для підрахунків ми враховуємо visibleCount (див. computeVisibleCount)
  }

  initLayout();

  // Певні змінні стану
  let index = 0;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let dx = 0;
  let transitionLocked = false;
  let resizeTimeout = null;

  // Визначаємо, скільки слайдів видно одночасно (для зсуву)
  function computeVisibleCount() {
    return window.matchMedia('(min-width: 720px)').matches ? 2 : 1;
  }

  // Обчислюємо ширину однієї видимої області (viewport для слайду)
  function visibleWidth() {
    // ширина контейнера, який показує слайди (батько wrapper)
    const container = wrapper.parentElement;
    return container ? container.clientWidth : window.innerWidth;
  }

  // Обмеження індексу з урахуванням visibleCount
  function clampIndex(i) {
    const visible = computeVisibleCount();
    const maxIndex = Math.max(0, slides.length - visible);
    return Math.min(Math.max(0, i), maxIndex);
  }

  // Оновлення позиції (translateX) і стану дотів
  function updatePosition(animate = true) {
    if (transitionLocked) return;
    const visible = computeVisibleCount();
    const vw = visibleWidth();
    const shiftPerIndex = vw / visible;
    const clamped = clampIndex(index);
    index = clamped;
    const shift = Math.round(shiftPerIndex * index);
    if (animate) wrapper.style.transition = '';
    // щоб тримати плавну анімацію, трохи включаємо перехід
    if (animate) {
      // дозволяємо CSS transition розв’язуватися; якщо wrapper має inline transition, воно буде використовуватись
      wrapper.style.transition = 'transform .38s cubic-bezier(.22,.9,.32,1)';
    }
    wrapper.style.transform = `translateX(-${shift}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // Налаштування дотів: на випадок якщо їх кількість не співпадає з кількістю видимих станів,
  // ми залишаємо їх як контролери start-index (dots[i] => index = i)
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const requested = Number(d.dataset.index ?? Array.from(dots).indexOf(d)) || 0;
      index = clampIndex(requested);
      updatePosition(true);
    });
  });

  // Touch / Mouse drag handlers
  function onTouchStart(e) {
    if (e.touches && e.touches.length > 1) return;
    isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    currentX = startX;
    dx = 0;
    wrapper.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = clientX - startX;
    const visible = computeVisibleCount();
    const vw = visibleWidth();
    const baseShift = (vw / visible) * index;
    wrapper.style.transform = `translateX(${-baseShift - dx}px)`;
  }

  function onTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.transition = ''; // дозволяємо transition з CSS
    const threshold = Math.max(40, visibleWidth() * 0.08); // мінімальний поріг свайпу
    if (Math.abs(dx) > threshold) {
      if (dx < 0 && index < slides.length - computeVisibleCount()) index++;
      if (dx > 0 && index > 0) index--;
    }
    dx = 0;
    updatePosition(true);
  }

  // Додаємо слушачі для touch + mouse (щоб працювало і на десктопі drag)
  wrapper.addEventListener('touchstart', onTouchStart, {passive: true});
  wrapper.addEventListener('touchmove', onTouchMove, {passive: true});
  wrapper.addEventListener('touchend', onTouchEnd);
  wrapper.addEventListener('mousedown', (e) => {
    // тільки якщо ліва кнопка миші
    if (e.button !== 0) return;
    onTouchStart(e);
    // додаємо глобальні слухачі, поки триває drag
    const onMove = (ev) => onTouchMove(ev);
    const onUp = (ev) => {
      onTouchEnd(ev);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      index = clampIndex(index + 1);
      updatePosition(true);
    } else if (e.key === 'ArrowLeft') {
      index = clampIndex(index - 1);
      updatePosition(true);
    }
  });

  // Ресайз: пересчитать layout і позицію (debounce)
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Якщо змінюється visibleCount — можливо треба підкоригувати index
      index = clampIndex(index);
      // переконаємось, що wrapper width відповідає кількості слайдів
      initLayout();
      updatePosition(false);
    }, 80);
  }
  window.addEventListener('resize', onResize);

  // Ініціалізація позиції та захист від неправильних початкових розмірів
  // Установимо невеликий таймаут, щоб DOM/CSS завершили рендер
  setTimeout(() => {
    initLayout();
    index = clampIndex(index);
    updatePosition(false);
  }, 60);
});
