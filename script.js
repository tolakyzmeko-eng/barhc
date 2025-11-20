document.addEventListener('DOMContentLoaded', () => {
    // 1. Отримання елементів DOM
    const swipeContainer = document.querySelector('.swipe-container');
    const slideWrapper = document.querySelector('.slide-wrapper');
    const dots = document.querySelectorAll('.dot');
    const transitionPhoto = document.getElementById('transition-photo'); 
    
    // 2. Налаштування слайдера
    const totalSlides = 2; // Фіксована кількість слайдів
    let currentSlide = 0;
    
    // 3. Налаштування рандомного фону
    const backgroundImages = ['photo1.jpg', 'photo2.jpg']; // Додайте свої шляхи до фото
    let currentBackgroundImage = ''; 
    
    // 4. Змінні для свайпу
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    
    const THRESHOLD_PERCENT = 10; // 10% руху для перемикання слайда

    // --- ФУНКЦІЇ ЛОГІКИ ---

    function setRandomBackground() {
        if (backgroundImages.length === 0) return;
        
        let randomImage;
        do {
            const randomIndex = Math.floor(Math.random() * backgroundImages.length);
            randomImage = backgroundImages[randomIndex];
        } while (randomImage === currentBackgroundImage && backgroundImages.length > 1); 
        
        transitionPhoto.style.backgroundImage = `url('${randomImage}')`;
        currentBackgroundImage = randomImage;
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    function setPositionByIndex(animate = true) {
        // currentTranslate - це зміщення у відсотках (0% або -50%)
        currentTranslate = currentSlide * (-100 / totalSlides); 
        
        slideWrapper.style.transition = animate ? 'transform 0.4s ease-out' : 'none';
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
        prevTranslate = currentTranslate; // Оновлюємо prevTranslate
    }

    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides; 
        setPositionByIndex(true);
        updateDots();
        setRandomBackground(); 
    }
    
    // --- ОБРОБНИКИ ПОДІЙ ---

    function getPositionX(e) {
        // Перевіряємо, чи це подія дотику (touch) чи миші (mouse)
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    function dragStart(e) {
        // Ігноруємо правий клік миші
        if (e.type.includes('mouse') && e.button !== 0) return; 
        
        startX = getPositionX(e);
        isDragging = true;
        slideWrapper.style.transition = 'none'; 
    }

    function drag(e) {
        if (!isDragging) return;
        
        // КЛЮЧОВЕ ВИПРАВЛЕННЯ: Блокуємо скрол на мобільному
        if (e.type.includes('touch')) {
            e.preventDefault(); 
        }

        const currentX = getPositionX(e);
        const deltaX = currentX - startX; 
        
        // Використовуємо ширину контейнера для обчислення відсотка
        const translationPercentage = (deltaX / swipeContainer.offsetWidth) * 100 * (100 / totalSlides);
        
        currentTranslate = prevTranslate + translationPercentage;
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // Обчислення відсотка, на який ми зрушили
        const movedByPercent = currentTranslate - prevTranslate;
        
        if (movedByPercent < -THRESHOLD_PERCENT) { // Рух вліво (наступний слайд)
            goToSlide(currentSlide + 1);
        } else if (movedByPercent > THRESHOLD_PERCENT) { // Рух вправо (попередній слайд)
            goToSlide(currentSlide - 1);
        } else {
            // Повертаємо на поточний слайд, якщо рух недостатній
            goToSlide(currentSlide);
        }
    }
    
    // --- ПІДКЛЮЧЕННЯ ПОДІЙ ---
    
    // Дотик (Touch)
    swipeContainer.addEventListener('touchstart', dragStart);
    swipeContainer.addEventListener('touchmove', drag);
    swipeContainer.addEventListener('touchend', dragEnd);
    
    // Мишка (Mouse)
    swipeContainer.addEventListener('mousedown', dragStart);
    // Ці події вішаємо на window, щоб відстежувати рух, навіть коли курсор вийшов за межі контейнера
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', dragEnd);
    
    // Ініціалізація
    setRandomBackground(); 
    goToSlide(0); 
});
