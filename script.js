document.addEventListener('DOMContentLoaded', () => {
    const swipeContainer = document.querySelector('.swipe-container');
    const slideWrapper = document.querySelector('.slide-wrapper');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const transitionPhoto = document.getElementById('transition-photo'); 
    
    const totalSlides = slides.length;
    let currentSlide = 0;
    
    // ДОДАЙТЕ БІЛЬШЕ ФОТОГРАФІЙ У ЦЕЙ СПИСОК
    const backgroundImages = ['photo1.jpg', 'photo2.jpg']; 
    let currentBackgroundImage = ''; 
    
    // Змінні для свайпу
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    
    // --- ЗМІНА ФОНУ (рандом) ---
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

    // Оновлення крапок-індикаторів
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    function setPositionByIndex() {
        currentTranslate = currentSlide * (-100 / totalSlides); 
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides; 
        setPositionByIndex();
        updateDots();
        
        setRandomBackground(); 
    }
    
    // --- ОСНОВНІ ФУНКЦІЇ СВАЙПУ ---
    function dragStart(e) {
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        isDragging = true;
        slideWrapper.style.transition = 'none'; 
    }

    function drag(e) {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        currentTranslate = prevTranslate + (deltaX / swipeContainer.offsetWidth * 100) * (100 / totalSlides);
        slideWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        slideWrapper.style.transition = 'transform 0.4s ease-out';
        
        const movedByPercent = currentTranslate - prevTranslate;
        
        if (movedByPercent < -10) { 
            goToSlide(currentSlide + 1);
        } else if (movedByPercent > 10) { 
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide);
        }
        
        prevTranslate = currentTranslate;
    }
    
    // --- ПІДКЛЮЧЕННЯ ПОДІЙ ---
    
    // Підтримка мишки
    swipeContainer.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('mousemove', drag);
    
    // Підтримка дотику
    swipeContainer.addEventListener('touchstart', dragStart);
    window.addEventListener('touchend', dragEnd);
    window.addEventListener('touchmove', drag);
    
    // Ініціалізація
    setRandomBackground(); 
    goToSlide(0); 
    prevTranslate = currentTranslate;
});