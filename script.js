// ====== НАСТРОЙКА СТАНЦИЙ ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({
        id: i,
        name: `Station ${i}`,
        icon: `assets/icons/${i}.png`,
        mp3: `http://your-nas-ip/mp3/${i}.mp3` // заменить на реальные URL mp3
    });
}

// ====== HTML ЭЛЕМЕНТЫ ======
const carousel = document.querySelector('.carousel');
const stationIcon = document.getElementById('station-icon');
const stationName = document.getElementById('station-name');

// ====== ЛОГИКА КАРУСЕЛИ ======
let currentStationIndex = 0;

// Создаём элементы карусели
function populateCarousel() {
    carousel.innerHTML = '';
    const prevIndex = (currentStationIndex - 1 + stations.length) % stations.length;
    const nextIndex = (currentStationIndex + 1) % stations.length;

    const indices = [prevIndex, currentStationIndex, nextIndex];

    indices.forEach((i) => {
        const stationDiv = document.createElement('div');
        stationDiv.classList.add('station');
        if (i === currentStationIndex) stationDiv.classList.add('active');

        const img = document.createElement('img');
        img.src = stations[i].icon;

        const p = document.createElement('p');
        p.innerText = stations[i].name;

        stationDiv.appendChild(img);
        stationDiv.appendChild(p);
        carousel.appendChild(stationDiv);
    });

    // Обновляем центральную станцию
    updateCurrentStation();
}

function updateCurrentStation() {
    const station = stations[currentStationIndex];
    stationIcon.src = station.icon;
    stationName.innerText = station.name;
}

// ====== ПРОКРУТКА ПАЛЬЦЕМ ======
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

    if (delta > 30) { // свайп влево → следующая станция
        currentStationIndex = (currentStationIndex + 1) % stations.length;
        populateCarousel();
        startX = currentX;
        navigator.vibrate?.(15);
    } else if (delta < -30) { // свайп вправо → предыдущая станция
        currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
        populateCarousel();
        startX = currentX;
        navigator.vibrate?.(15);
    }
});

carousel.addEventListener('touchend', () => {
    isDragging = false;
});

// ====== ИНИЦИАЛИЗАЦИЯ ======
populateCarousel();
