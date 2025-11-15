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

// ====== Обновление позиции и масштаба ======
function updatePositions() {
    const items = carousel.querySelectorAll('.station');
    items.forEach((item, i) => {
        const offset = i - 2; // центр = 0
        const scale = i === 2 ? 2 : 1 - Math.abs(offset) * 0.3;
        const opacity = i === 2 ? 1 : 1 - Math.abs(offset) * 0.7;
        const translateY = offset * 100; // расстояние между элементами
        item.style.transform = `translateY(${translateY}px) scale(${scale})`;
        item.style.opacity = opacity;
        if (i === 2) item.classList.add('active');
        else item.classList.remove('active');
    });
}

// ====== Свайпы с инерцией ======
function animateInertia() {
    if (Math.abs(velocity) < 0.1) return;
    const delta = velocity > 0 ? -1 : 1;
    currentStationIndex = (currentStationIndex + delta + stations.length) % stations.length;
    populateCarousel();
    velocity *= 0.95; // трение
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
    const now = Date.now();
    const dt = now - lastMoveTime;
    velocity = deltaY / dt * 10; // скорость для инерции

    if (deltaY > 20) { // свайп вверх
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        startY = currentY;
        navigator.vibrate?.(15);
        clickSound.currentTime = 0;
        clickSound.play();
        populateCarousel();
    } else if (deltaY < -20) { // свайп вниз
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        startY = currentY;
        navigator.vibrate?.(15);
        clickSound.currentTime = 0;
        clickSound.play();
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
