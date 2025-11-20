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
    // Додайте тут свої шляхи до фонових зображень
    const backgroundImages = ['photo1.jpg', 'photo2.jpg']; 
    let currentBackgroundImage = ''; 
    
    // 4. Змінні для свайпу
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    
    const THRESHOLD = 50; // Мінімальний рух у пікселях для перемикання слайда (для мобільного)

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
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    function dragStart(e) {
        startX = getPositionX(e);
        isDragging = true;
        slideWrapper.style.transition = 'none'; 
    }

    function drag(e) {
        if (!isDragging) return;
        
        const currentX = getPositionX(e);
        const deltaX = currentX - startX; // Рух у пікселях
        
        // Перетворюємо рух у пікселях у відсотки, враховуючи, що у нас 2 слайди
        const translationPercentage = (deltaX / swipeContainer.offsetWidth) * 100 * (100 / totalSlides);
        
        currentTranslate = prevTranslate + translationPercentage;
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const finalX = getPositionX(e.type.includes('mouse') ? e : e.changedTouches[0]);
        const movedDistance = finalX - startX; // Загальна відстань руху в пікселях
        
        if (movedDistance < -THRESHOLD) { // Рух вліво (наступний слайд)
            goToSlide(currentSlide + 1);
        } else if (movedDistance > THRESHOLD) { // Рух вправо (попередній слайд)
            goToSlide(currentSlide - 1);
        } else {
            // Повертаємо на поточний слайд, якщо рух недостатній
            goToSlide(currentSlide);
        }
    }
    
    // --- ПІДКЛЮЧЕННЯ ПОДІЙ ---
    
    // Дотик (Touch) - Основний для мобільного
    swipeContainer.addEventListener('touchstart', dragStart);
    swipeContainer.addEventListener('touchmove', drag);
    swipeContainer.addEventListener('touchend', dragEnd);
    
    // Мишка (Mouse) - Для десктопу
    swipeContainer.addEventListener('mousedown', dragStart);
    swipeContainer.addEventListener('mousemove', drag);
    swipeContainer.addEventListener('mouseup', dragEnd);
    
    // Ініціалізація
    setRandomBackground(); // Встановлюємо перший випадковий фон
    goToSlide(0); 
});
