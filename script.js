// ====== Настройка станций ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({ id: i, icon: `assets/icons/${i}.png` });
}

// ====== Элементы ======
const carousel = document.querySelector('.carousel');

// ====== Переменные ======
let currentStationIndex = 0;
let startY = 0;
let velocity = 0;
let isDragging = false;
let lastMoveTime = 0;
let animationFrame;

// ====== Создание карусели ======
function populateCarousel() {
    carousel.innerHTML = '';

    // Показываем 5 элементов: 2 сверху, центр, 2 снизу
    for (let offset = -2; offset <= 2; offset++) {
        const index = (currentStationIndex + offset + stations.length) % stations.length;
        const div = document.createElement('div');
        div.classList.add('station');

        const img = document.createElement('img');
        img.src = stations[index].icon;
        div.appendChild(img);
        carousel.appendChild(div);
    }

    updatePositions();
}

// ====== Обновление позиции и масштаба ======
function updatePositions() {
    const items = carousel.querySelectorAll('.station');
    items.forEach((item, i) => {
        const offset = i - 2; // центр = 0
        // Чем дальше от центра, тем меньше масштаб
        let scale = 2.2 - Math.abs(offset) * 0.3; 
        scale = Math.max(scale, 1); // минимальный размер боковых
        const opacity = 1 - Math.abs(offset) * 0.3;
        const translateY = offset * 100; // расстояние между элементами
        item.style.transform = `translateY(${translateY}px) scale(${scale})`;
        item.style.opacity = opacity;
        item.style.zIndex = 10 - Math.abs(offset);
        item.classList.toggle('active', offset === 0);
    });
}

// ====== Свайпы с фиксированной скоростью и плавной инерцией ======
function animateInertia() {
    if (Math.abs(velocity) < 0.05) return;
    const delta = velocity > 0 ? -1 : 1;
    currentStationIndex = (currentStationIndex + delta + stations.length) % stations.length;
    populateCarousel();
    velocity *= 0.90; // мягкая остановка
    animationFrame = requestAnimationFrame(animateInertia);
}

carousel.addEventListener('touchstart', e => {
    isDragging = true;
    startY = e.touches[0].clientY;
    velocity = 0;
    cancelAnimationFrame(animationFrame);
    lastMoveTime = Date.now();
});

carousel.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;

    // С фиксированной скоростью независимо от позиции
    if (deltaY > 20) {
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        velocity = 1;
        startY = currentY;
        populateCarousel();
    } else if (deltaY < -20) {
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        velocity = -1;
        startY = currentY;
        populateCarousel();
    }
});

carousel.addEventListener('touchend', () => {
    isDragging = false;
    animateInertia();
});

// ====== Инициализация ======
populateCarousel();
