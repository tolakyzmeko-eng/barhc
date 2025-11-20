document.addEventListener('DOMContentLoaded', () => {
    // 1. Отримання елементів DOM
    const swipeContainer = document.querySelector('.swipe-container');
    const slideWrapper = document.querySelector('.slide-wrapper');
    const dots = document.querySelectorAll('.dot');
    
    // 2. Налаштування слайдера
    const totalSlides = 2; 
    let currentSlide = 0;
    
    // 3. Змінні для свайпу
    let startX = 0;
    let startY = 0; // Додаємо вертикальну координату для перевірки напрямку
    let isDragging = false;
    let isHorizontalSwipe = false; // Прапор для визначення, чи це горизонтальний свайп
    let currentTranslate = 0;
    let prevTranslate = 0;
    
    const THRESHOLD_PERCENT = 10; // 10% руху для перемикання слайда
    const DIRECTION_THRESHOLD = 5; // Початковий рух у пікселях, щоб визначити напрямок

    // --- ФУНКЦІЇ ЛОГІКИ ---

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    function setPositionByIndex(animate = true) {
        currentTranslate = currentSlide * (-100 / totalSlides); 
        slideWrapper.style.transition = animate ? 'transform 0.4s ease-out' : 'none';
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
        prevTranslate = currentTranslate; 
    }

    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides; 
        setPositionByIndex(true);
        updateDots();
    }
    
    // --- ОБРОБНИКИ ПОДІЙ ---

    function getPosition(e) {
        if (e.type.includes('mouse')) {
            return { x: e.clientX, y: e.clientY };
        } else {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    function dragStart(e) {
        if (e.type.includes('mouse') && e.button !== 0) return; 
        
        const pos = getPosition(e);
        startX = pos.x;
        startY = pos.y;
        isDragging = true;
        isHorizontalSwipe = false; // Скидаємо прапор
        slideWrapper.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        
        const currentPos = getPosition(e);
        const deltaX = currentPos.x - startX; 
        const deltaY = currentPos.y - startY;
        
        // КРОК 1: Визначаємо напрямок руху, якщо він ще не визначений
        if (e.type.includes('touch') && !isHorizontalSwipe) {
            // Перевіряємо, чи горизонтальний рух значно більший за вертикальний
            if (Math.abs(deltaX) > DIRECTION_THRESHOLD || Math.abs(deltaY) > DIRECTION_THRESHOLD) {
                 if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    isHorizontalSwipe = true;
                } else {
                    // Якщо рух переважно вертикальний, ігноруємо подальший свайп
                    isDragging = false; 
                    return;
                }
            }
        }
        
        // КРОК 2: Якщо це горизонтальний свайп, блокуємо скрол
        if (isHorizontalSwipe) {
            e.preventDefault(); 
        }

        // Забезпечуємо, що drag спрацює для миші
        if (e.type.includes('mouse') && Math.abs(deltaX) > 0) {
            isHorizontalSwipe = true;
        }

        if (!isHorizontalSwipe && e.type.includes('touch')) return;


        // КРОК 3: Обчислення зміщення
        const translationPercentage = (deltaX / swipeContainer.offsetWidth) * 100 * (100 / totalSlides);
        
        currentTranslate = prevTranslate + translationPercentage;
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function dragEnd() {
        if (!isDragging || !isHorizontalSwipe) {
             // Скидаємо прапори, навіть якщо свайп був вертикальний
             isDragging = false;
             isHorizontalSwipe = false;
             return; 
        }
        
        isDragging = false;
        isHorizontalSwipe = false;

        const movedByPercent = currentTranslate - prevTranslate;
        
        if (movedByPercent < -THRESHOLD_PERCENT) { 
            goToSlide(currentSlide + 1);
        } else if (movedByPercent > THRESHOLD_PERCENT) { 
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide);
        }
    }
    
    // --- ПІДКЛЮЧЕННЯ ПОДІЙ ---
    
    // Дотик (Touch)
    swipeContainer.addEventListener('touchstart', dragStart);
    swipeContainer.addEventListener('touchmove', drag, { passive: false }); // {passive: false} важливий для e.preventDefault()
    swipeContainer.addEventListener('touchend', dragEnd);
    
    // Мишка (Mouse)
    swipeContainer.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', dragEnd);
    
    // Ініціалізація
    setPositionByIndex(false); 
    updateDots();
});
