// ====== Настройка станций ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({ id: i, icon: `assets/icons/${i}.png` });
}

// ====== Элементы ======
const carousel = document.querySelector('.carousel');
const clickSound = document.getElementById('click-sound');

// ====== Переменные ======
let currentStationIndex = 0;

// ====== Создание карусели ======
function populateCarousel() {
    carousel.innerHTML = '';

    // Показываем 5 элементов: 2 сверху, центр, 2 снизу
    for (let offset = -2; offset <= 2; offset++) {
        let index = (currentStationIndex + offset + stations.length) % stations.length;
        const div = document.createElement('div');
        div.classList.add('station');
        if (offset === 0) div.classList.add('active');

        const img = document.createElement('img');
        img.src = stations[index].icon;
        div.appendChild(img);
        carousel.appendChild(div);
    }

    updatePositions();
}

// ====== Анимация вертикального барабана ======
function updatePositions() {
    const items = carousel.querySelectorAll('.station');
    items.forEach((item, i) => {
        const offset = i - 2; // центр на 0
        const scale = 1 - Math.abs(offset) * 0.25;
        const opacity = 1 - Math.abs(offset) * 0.4;
        const translateY = offset * 80; // расстояние между элементами
        item.style.transform = `translateY(${translateY}px) scale(${scale})`;
        item.style.opacity = opacity;
        if (offset === 0) item.classList.add('active');
        else item.classList.remove('active');
    });
}

// ====== Свайпы ======
let startY = 0;
let isDragging = false;

carousel.addEventListener('touchstart', e => {
    isDragging = true;
    startY = e.touches[0].clientY;
});

carousel.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = startY - currentY;

    if (delta > 20) { // свайп вверх → следующая
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        populateCarousel();
        startY = currentY;
        navigator.vibrate?.(15);
        clickSound.currentTime = 0;
        clickSound.play();
    } else if (delta < -20) { // свайп вниз → предыдущая
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        populateCarousel();
        startY = currentY;
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
