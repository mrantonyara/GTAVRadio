// ====== НАСТРОЙКА СТАНЦИЙ ======
const stations = [];
for (let i = 0; i <= 21; i++) {
    stations.push({
        id: i,
        name: `Station ${i}`,
        icon: `assets/icons/${i}.png`,
        mp3: `http://your-nas-ip/mp3/${i}.mp3` // пока заглушка
    });
}

// ====== HTML ЭЛЕМЕНТЫ ======
const stationIcon = document.getElementById("station-icon");
const stationName = document.getElementById("station-name");

// ====== ПЕРЕМЕННЫЕ ДЛЯ ВРАЩЕНИЯ ======
let currentStationIndex = 0;
let startY = 0;
let isDragging = false;

// ====== ОБНОВЛЕНИЕ СТАНЦИИ ======
function updateStation(index) {
    currentStationIndex = (index + stations.length) % stations.length;
    const station = stations[currentStationIndex];

    // меняем иконку и название
    stationIcon.src = station.icon;
    stationName.innerText = station.name;

    // haptic feedback
    if ("vibrate" in navigator) navigator.vibrate(15);

    // проигрывание mp3 (пока placeholder)
    // const audio = new Audio(station.mp3);
    // audio.play();
}

// ====== ОБРАБОТЧИКИ ДЛЯ СВАЙПОВ ======
const wheelContainer = document.querySelector(".wheel-container");

wheelContainer.addEventListener("touchstart", (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
});

wheelContainer.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const delta = startY - currentY;

    // если свайп вверх — следующая станция, вниз — предыдущая
    if (delta > 30) {        // порог свайпа
        updateStation(currentStationIndex + 1);
        startY = currentY;
    } else if (delta < -30) {
        updateStation(currentStationIndex - 1);
        startY = currentY;
    }
});

wheelContainer.addEventListener("touchend", () => {
    isDragging = false;
});
