let currentIndex = 0;

function showSlide(index) {
    const carouselInner = document.querySelector('.carousel-inner');
    const totalItems = document.querySelectorAll('.carousel-item').length;
    
    if (index >= totalItems) {
        currentIndex = 0;
    } else if (index < 0) {
        currentIndex = totalItems - 1;
    } else {
        currentIndex = index;
    }

    const offset = -currentIndex * 100;
    carouselInner.style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

// Optional: Auto-play the carousel
setInterval(nextSlide, 3000);