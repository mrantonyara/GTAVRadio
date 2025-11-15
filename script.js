// ====== Настройка станций ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({ id: i, icon: `assets/icons/${i}.png` });
}

// ====== Элементы ======
const carousel = document.querySelector('.carousel');

// ====== Переменные ======
let currentStationIndex = Math.floor(Math.random() * stations.length); // случайная станция
let startY = 0;
let velocity = 0;
let isDragging = false;
let lastMoveTime = 0;
let animationFrame;

// ====== Создание 5 видимых станций ======
function populateCarousel() {
    carousel.innerHTML = '';

    for (let offset = -2; offset <= 2; offset++) {
        const index = (currentStationIndex + offset + stations.length) % stations.length;
        const div = document.createElement('div');
        div.classList.add('station');

        if (offset === 0) div.classList.add('active');
        else if (offset === -1) div.classList.add('prev');
        else if (offset === 1) div.classList.add('next');

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
        const offset = i - 2;
        const scale = i === 2 ? 1.8 : 1.2;
        const opacity = 1 - Math.abs(offset) * 0.4;
        const translateY = offset * 150; // больше расстояние, чтобы не касались
        item.style.transform = `translateY(${translateY}px) scale(${scale})`;
        item.style.opacity = opacity;
        item.style.zIndex = 10 - Math.abs(offset);
    });
}

// ====== Плавная инерция ======
function animateInertia() {
    if (Math.abs(velocity) < 0.02) return; // мягкая остановка
    let delta = velocity > 0 ? -1 : 1;

    currentStationIndex = (currentStationIndex + delta + stations.length) % stations.length;
    populateCarousel();

    // Ограничение скорости и постепенное снижение
    velocity *= 0.90;
    if (velocity > 1) velocity = 1;
    if (velocity < -1) velocity = -1;

    animationFrame = requestAnimationFrame(animateInertia);
}

// ====== Свайпы ======
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
    const now = Date.now();
    const dt = now - lastMoveTime;

    velocity = deltaY / dt * 0.5; // ограничение скорости

    if (deltaY > 15) {
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        startY = currentY;
        populateCarousel();
    } else if (deltaY < -15) {
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        startY = currentY;
        populateCarousel();
    }

    lastMoveTime = now;
});

carousel.addEventListener('touchend', () => {
    isDragging = false;
    animateInertia();
});

// ====== Инициализация ======
populateCarousel();
