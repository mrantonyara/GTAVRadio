// ====== Настройка станций ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({
        id: i,
        icon: `assets/icons/${i}.png`
    });
}

// ====== Элементы ======
const carousel = document.querySelector('.carousel');
const clickSound = document.getElementById('click-sound');

// ====== Переменные ======
let currentStationIndex = 0;

// ====== Создание элементов карусели ======
function populateCarousel() {
    carousel.innerHTML = '';

    // берём 5 элементов: 2 слева, центр, 2 справа для плавного эффекта
    for (let offset = -2; offset <= 2; offset++) {
        let index = (currentStationIndex + offset + stations.length) % stations.length;
        const stationDiv = document.createElement('div');
        stationDiv.classList.add('station');
        if (offset === 0) stationDiv.classList.add('active');

        const img = document.createElement('img');
        img.src = stations[index].icon;
        stationDiv.appendChild(img);
        carousel.appendChild(stationDiv);
    }

    updateCarouselPositions();
}

// ====== Анимация “барабана” ======
function updateCarouselPositions() {
    const items = carousel.querySelectorAll('.station');
    items.forEach((item, i) => {
        const offset = i - 2; // центр на 0
        const scale = 1 - Math.abs(offset) * 0.3;
        const opacity = 1 - Math.abs(offset) * 0.3;
        item.style.transform = `translateX(${offset * 40}px) scale(${scale})`;
        item.style.opacity = opacity;
        if (offset === 0) item.classList.add('active');
        else item.classList.remove('active');
    });
}

// ====== Свайпы ======
let startX = 0;
let isDragging = false;

carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
});

carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const delta = startX - currentX;

    if (delta > 20) { // свайп влево → следующая
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        populateCarousel();
        startX = currentX;
        navigator.vibrate?.(15);
        clickSound.currentTime = 0;
        clickSound.play();
    } else if (delta < -20) { // свайп вправо → предыдущая
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        populateCarousel();
        startX = currentX;
        navigator.vibrate?.(15);
        clickSound.currentTime = 0;
        clickSound.play();
    }
});

carousel.addEventListener('touchend', () => {
    isDragging = false;
});

// ====== Инициализация ======
populateCarousel();
