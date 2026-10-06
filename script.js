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

let player = null;
let isPlayerReady = false;
let hasInteracted = false;
let isSwitchingStation = false;
let currentStationIndex = -1;
let layout = 'wheel';

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

function render() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    layout = w > h ? 'wheel' : 'vertical';
    
    if (layout === 'wheel') {
        const radius = Math.min(w, h) * 0.42; // Increased distance
        
        stations.forEach((s, i) => {
            const div = document.getElementById(`station-${i}`);
            const angle = i * angleStep - (Math.PI / 2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            div.style.transform = `translate(${x}px, ${y}px)`;
            
            if (i === currentStationIndex) {
                div.classList.add('active');
            } else {
                div.classList.remove('active');
            }
        });
    } else {
        // Vertical List Layout
        const itemSpacing = Math.min(w, h) * 0.22; 
        
        stations.forEach((s, i) => {
            const div = document.getElementById(`station-${i}`);
            
            let diff = i - currentStationIndex;
            // Shortest path wrapping
            if (diff > totalStations / 2) diff -= totalStations;
            if (diff < -totalStations / 2) diff += totalStations;
            
            const y = diff * itemSpacing;
            
            div.style.transform = `translate(0px, ${y}px)`;
            
            if (i === currentStationIndex) {
                div.classList.add('active');
            } else {
                div.classList.remove('active');
            }
            
            // Fade out items that are far away in vertical mode
            if (Math.abs(diff) > 3) {
                div.style.opacity = '0';
                div.style.pointerEvents = 'none';
            } else {
                div.style.opacity = ''; // rely on CSS
            }
        });
    }
}

window.addEventListener('resize', render);

// YouTube API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytplayer', {
        height: '1',
        width: '1',
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
        
        player.setVolume(100);
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
    }, 80); // Fast 80ms debounce for snappy switching
}

function setActiveStation(index, forcePlay = false) {
    if (index === currentStationIndex && !forcePlay) return;
    currentStationIndex = index;
    render(); // Re-render handles active classes and vertical positioning
    
    if (!hasInteracted && isPlayerReady) {
        hasInteracted = true;
    }
    
    playCurrentStation();
}

// Initial active station
const randomStartIndex = Math.floor(Math.random() * (totalStations - 1));
setActiveStation(randomStartIndex); // Start with a random station

// Input Handling
let isInteracting = false;
let startY = 0;
let startIndex = 0;

function handleInteractionStart(clientX, clientY) {
    const isFirst = !hasInteracted;
    isInteracting = true;
    if (layout === 'wheel') {
        if (isFirst) setActiveStation(currentStationIndex, true);
        updateWheelPointer(clientX, clientY);
    } else {
        startY = clientY;
        startIndex = currentStationIndex;
        if (isFirst) setActiveStation(currentStationIndex, true);
    }
}

function handleInteractionMove(clientX, clientY) {
    if (!isInteracting) return;
    
    if (layout === 'wheel') {
        updateWheelPointer(clientX, clientY);
    } else {
        // Vertical logic: dragging up/down changes index
        const dy = clientY - startY;
        const itemSpacing = Math.min(window.innerWidth, window.innerHeight) * 0.22;
        
        // How many items scrolled?
        let steps = -Math.round(dy / itemSpacing);
        let newIndex = (startIndex + steps) % totalStations;
        if (newIndex < 0) newIndex += totalStations;
        
        setActiveStation(newIndex);
    }
}

function handleInteractionEnd() {
    isInteracting = false;
}

function updateWheelPointer(clientX, clientY) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let angle = Math.atan2(dy, dx);
    angle += Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    let index = Math.round(angle / angleStep) % totalStations;
    setActiveStation(index);
}

document.addEventListener('mousedown', (e) => {
    handleInteractionStart(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
    handleInteractionMove(e.clientX, e.clientY);
});

document.addEventListener('mouseup', handleInteractionEnd);

document.addEventListener('touchstart', (e) => {
    handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});

document.addEventListener('touchend', handleInteractionEnd);

// Mouse wheel for vertical layout (or wheel)
let wheelTimeout;
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        let steps = e.deltaY > 0 ? 1 : -1;
        let newIndex = (currentStationIndex + steps) % totalStations;
        if (newIndex < 0) newIndex += totalStations;
        setActiveStation(newIndex);
    }, 50); // debounce scroll slightly
}, {passive: false});

