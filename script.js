const playlistId = 'PLLvWV__Bn2_PwR92FfrxjsZCAM7zyxzze';

const stations = [
  { name: "Space 103.2", icon: "assets/icons/Space%20103.2.png", ytIndex: 0 },
  { name: "Non-Stop-Pop FM", icon: "assets/icons/Non-Stop-Pop%20FM.png", ytIndex: 1 },
  { name: "Los Santos Rock Radio", icon: "assets/icons/Los%20Santos%20Rock%20Radio.png", ytIndex: 2 },
  { name: "Radio Los Santos", icon: "assets/icons/Radio%20Los%20Santos.png", ytIndex: 3 },
  { name: "West Coast Classics", icon: "assets/icons/West%20Coast%20Classics.png", ytIndex: 4 },
  { name: "The Lowdown 91.1", icon: "assets/icons/The%20Lowdown%2091.1.png", ytIndex: 6 },
  { name: "Blue Ark", icon: "assets/icons/Blue%20Ark.png", ytIndex: 7 },
  { name: "Worldwide FM", icon: "assets/icons/Worldwide%20FM.png", ytIndex: 8 },
  { name: "East Los FM", icon: "assets/icons/East%20Los%20FM.png", ytIndex: 9 },
  { name: "Channel X", icon: "assets/icons/Channel%20X.png", ytIndex: 10 },
  { name: "Radio Mirror Park", icon: "assets/icons/Radio%20Mirror%20Park.png", ytIndex: 11 },
  { name: "Soulwax FM", icon: "assets/icons/Soulwax%20FM.png", ytIndex: 12 },
  { name: "FlyLo FM", icon: "assets/icons/FlyLo%20FM.png", ytIndex: 13 },
  { name: "Vinewood Boulevard Radio", icon: "assets/icons/Vinewood%20Boulevard%20Radio.png", ytIndex: 14 },
  { name: "The Lab", icon: "assets/icons/The%20Lab.png", ytIndex: 15 },
  { name: "Los Santos Underground Radio", icon: "assets/icons/Los%20Santos%20Underground%20Radio.png", ytIndex: 16 },
  { name: "Music Locker Radio", icon: "assets/icons/Music%20Locker%20Radio.png", ytIndex: 20 },
  { name: "blonded Los Santos 97.8 FM", icon: "assets/icons/blonded%20Los%20Santos%2097.8%20FM.png", ytIndex: 23 },
  { name: "Radio Off", icon: "assets/icons/mute.png", ytIndex: -1 }
];

const totalStations = stations.length;
const angleStep = (2 * Math.PI) / totalStations;

const wheel = document.getElementById('wheel-container');
const stationNameEl = document.getElementById('station-name');

let player = null;
let isPlayerReady = false;
let hasInteracted = false;
let isSwitchingStation = false;
let currentStationIndex = -1;

// Setup DOM elements
stations.forEach((station, i) => {
    const div = document.createElement('div');
    div.classList.add('station');
    div.id = `station-${i}`;
    
    const img = document.createElement('img');
    img.src = station.icon;
    img.onerror = function() {
        if (this.src.indexOf('mute.png') === -1) {
            this.src = 'assets/icons/mute.png';
        }
    };
    
    div.appendChild(img);
    wheel.appendChild(div);
});

function arrangeStations() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    const radius = size * 0.38; // Distance from center
    
    stations.forEach((s, i) => {
        const div = document.getElementById(`station-${i}`);
        // Offset by -90deg (-PI/2) so index 0 is at the top
        const angle = i * angleStep - (Math.PI / 2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        div.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Initial draw calculations
arrangeStations();
window.addEventListener('resize', arrangeStations);

// YouTube API
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
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && isSwitchingStation) {
        isSwitchingStation = false;
        
        let duration = player.getDuration();
        if (duration > 0) {
            const nowSeconds = Math.floor(Date.now() / 1000);
            let syncTime = nowSeconds % Math.floor(duration);
            player.seekTo(syncTime, true);
        }
        
        setTimeout(() => {
            player.setVolume(100);
        }, 150);
    } else if (event.data === YT.PlayerState.ENDED) {
        const s = stations[currentStationIndex];
        if (s && s.ytIndex !== -1) {
            isSwitchingStation = true;
            player.setVolume(0);
            player.playVideoAt(s.ytIndex);
        }
    }
}

let playTimeout;
function playCurrentStation() {
    clearTimeout(playTimeout);
    playTimeout = setTimeout(() => {
        if (!isPlayerReady || currentStationIndex === -1) return;
        
        const s = stations[currentStationIndex];
        if (s.ytIndex === -1) {
            player.pauseVideo();
        } else {
            isSwitchingStation = true;
            player.setVolume(0); 
            player.playVideoAt(s.ytIndex);
        }
    }, 300); // 300ms debounce
}

function setActiveStation(index) {
    if (index === currentStationIndex) return;
    
    if (currentStationIndex !== -1) {
        document.getElementById(`station-${currentStationIndex}`).classList.remove('active');
    }
    
    currentStationIndex = index;
    document.getElementById(`station-${currentStationIndex}`).classList.add('active');
    stationNameEl.innerText = stations[currentStationIndex].name;
    
    if (!hasInteracted && isPlayerReady) {
        hasInteracted = true;
    }
    
    playCurrentStation();
}

// Initial active station
setActiveStation(stations.length - 1); // Start with "Radio Off"

// Input Handling
let isInteracting = false;

function updatePointer(clientX, clientY) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calculate angle in radians
    let angle = Math.atan2(dy, dx);
    
    // Shift angle by +90deg (PI/2) to make 0 at the top, and wrap to 0-2PI
    angle += Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    // Find closest station index
    let index = Math.round(angle / angleStep) % totalStations;
    
    setActiveStation(index);
}

document.addEventListener('mousedown', (e) => {
    isInteracting = true;
    updatePointer(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
    if (isInteracting) {
        updatePointer(e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', () => {
    isInteracting = false;
});

// Touch support
document.addEventListener('touchstart', (e) => {
    isInteracting = true;
    updatePointer(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    if (isInteracting) {
        e.preventDefault();
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
}, {passive: false});

document.addEventListener('touchend', () => {
    isInteracting = false;
});
