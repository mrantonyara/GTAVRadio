const playlistId = 'PLLvWV__Bn2_PwR92FfrxjsZCAM7zyxzze';

// Manually mapping available icons to their YouTube playlist index
const stations = [
  { name: "Space 103.2", icon: "assets/icons/Space 103.2.png", ytIndex: 0 },
  { name: "Non-Stop-Pop FM", icon: "assets/icons/Non-Stop-Pop FM.png", ytIndex: 1 },
  { name: "Los Santos Rock Radio", icon: "assets/icons/Los Santos Rock Radio.png", ytIndex: 2 },
  { name: "Radio Los Santos", icon: "assets/icons/Radio Los Santos.png", ytIndex: 3 },
  { name: "West Coast Classics", icon: "assets/icons/West Coast Classics.png", ytIndex: 4 },
  { name: "The Lowdown 91.1", icon: "assets/icons/The Lowdown 91.1.png", ytIndex: 6 },
  { name: "Blue Ark", icon: "assets/icons/Blue Ark.png", ytIndex: 7 },
  { name: "Worldwide FM", icon: "assets/icons/Worldwide FM.png", ytIndex: 8 },
  { name: "East Los FM", icon: "assets/icons/East Los FM.png", ytIndex: 9 },
  { name: "Channel X", icon: "assets/icons/Channel X.png", ytIndex: 10 },
  { name: "Radio Mirror Park", icon: "assets/icons/Radio Mirror Park.png", ytIndex: 11 },
  { name: "Soulwax FM", icon: "assets/icons/Soulwax FM.png", ytIndex: 12 },
  { name: "FlyLo FM", icon: "assets/icons/FlyLo FM.png", ytIndex: 13 },
  { name: "Vinewood Boulevard Radio", icon: "assets/icons/Vinewood Boulevard Radio.png", ytIndex: 14 },
  { name: "The Lab", icon: "assets/icons/The Lab.png", ytIndex: 15 },
  { name: "Los Santos Underground Radio", icon: "assets/icons/Los Santos Underground Radio.png", ytIndex: 16 },
  { name: "Music Locker Radio", icon: "assets/icons/Music Locker Radio.png", ytIndex: 20 },
  { name: "blonded Los Santos 97.8 FM", icon: "assets/icons/blonded Los Santos 97.8 FM.png", ytIndex: 23 },
  { name: "Radio Off", icon: "assets/icons/mute.png", ytIndex: -1 }
];

const totalStations = stations.length;
const theta = 360 / totalStations;
const radius = Math.round((250 / 2) / Math.tan(Math.PI / totalStations)) + 50;

const carousel = document.getElementById('carousel');
const stationNameEl = document.getElementById('station-name');
let player = null;
let isPlayerReady = false;

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytplayer', {
        height: '100',
        width: '100',
        playerVars: {
            listType: 'playlist',
            list: playlistId,
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    event.target.setVolume(100);
    // Play initial station if it's not mute
    playCurrentStation();
}

function onPlayerStateChange(event) {
    // Keep it playing or loop if needed
}

document.getElementById('btn-play').addEventListener('click', () => {
    if (isPlayerReady && stations[currentStationIndex].ytIndex !== -1) {
        player.playVideo();
    }
});

document.getElementById('btn-pause').addEventListener('click', () => {
    if (isPlayerReady) player.pauseVideo();
});

// Setup DOM elements once
stations.forEach((station, i) => {
    const div = document.createElement('div');
    div.classList.add('station');
    div.id = `station-${i}`;
    
    const img = document.createElement('img');
    img.src = station.icon;
    // fallback if image not found
    img.onerror = () => { img.src = 'assets/icons/mute.png'; };
    
    div.appendChild(img);
    carousel.appendChild(div);
});

let currentRotation = 0;
let currentStationIndex = 0;
let isDragging = false;
let startX = 0;
let startRotation = 0;
let velocity = 0;
let lastX = 0;
let lastTime = 0;
let raf;

function updateCarousel(rotation) {
    // Normalize index
    let normalizedRot = rotation % 360;
    if (normalizedRot < 0) normalizedRot += 360;
    
    let activeIndex = Math.round(normalizedRot / theta) % totalStations;
    // The visual active index is opposite to the rotation direction
    activeIndex = (totalStations - activeIndex) % totalStations;

    if (activeIndex !== currentStationIndex) {
        currentStationIndex = activeIndex;
        stationNameEl.innerText = stations[currentStationIndex].name;
    }

    // Apply 3D transforms
    for (let i = 0; i < totalStations; i++) {
        const itemRot = i * theta + rotation;
        const div = document.getElementById(`station-${i}`);
        div.style.transform = `rotateY(${itemRot}deg) translateZ(${radius}px)`;
        
        if (i === activeIndex) {
            div.classList.add('active');
        } else {
            div.classList.remove('active');
        }
    }
}

// Initial draw
updateCarousel(currentRotation);

// Play logic
let playTimeout;
function playCurrentStation() {
    clearTimeout(playTimeout);
    playTimeout = setTimeout(() => {
        if (!isPlayerReady) return;
        const s = stations[currentStationIndex];
        if (s.ytIndex === -1) {
            player.pauseVideo();
        } else {
            // Check if playing correct index, if not playVideoAt
            // Note: YouTube playlist index is 0-based
            player.playVideoAt(s.ytIndex);
        }
    }, 400); // Wait a bit after wheel stops spinning
}

// Input Handling
function onStart(x) {
    isDragging = true;
    startX = x;
    startRotation = currentRotation;
    velocity = 0;
    lastX = x;
    lastTime = Date.now();
    cancelAnimationFrame(raf);
}

function onMove(x) {
    if (!isDragging) return;
    const deltaX = x - startX;
    const now = Date.now();
    const dt = now - lastTime;
    
    currentRotation = startRotation + (deltaX * 0.4);
    updateCarousel(currentRotation);
    
    if (dt > 0) {
        velocity = (x - lastX) / dt;
    }
    lastX = x;
    lastTime = now;
}

function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // Inertia & Snap
    let speed = velocity * 15;
    
    function animate() {
        if (Math.abs(speed) > 0.1) {
            currentRotation += speed;
            speed *= 0.92; // friction
            updateCarousel(currentRotation);
            raf = requestAnimationFrame(animate);
        } else {
            // Snap to nearest station
            const snapRotation = Math.round(currentRotation / theta) * theta;
            const diff = snapRotation - currentRotation;
            
            if (Math.abs(diff) > 0.5) {
                currentRotation += diff * 0.1;
                updateCarousel(currentRotation);
                raf = requestAnimationFrame(animate);
            } else {
                currentRotation = snapRotation;
                updateCarousel(currentRotation);
                playCurrentStation();
            }
        }
    }
    raf = requestAnimationFrame(animate);
}

// Mouse
document.addEventListener('mousedown', e => onStart(e.clientX));
document.addEventListener('mousemove', e => onMove(e.clientX));
document.addEventListener('mouseup', onEnd);

// Touch
document.addEventListener('touchstart', e => onStart(e.touches[0].clientX), {passive: false});
document.addEventListener('touchmove', e => {
    e.preventDefault(); // prevent scrolling
    onMove(e.touches[0].clientX);
}, {passive: false});
document.addEventListener('touchend', onEnd);
