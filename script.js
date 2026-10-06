const playlistId = 'PLLvWV__Bn2_PwR92FfrxjsZCAM7zyxzze';

const stations = [
  { name: "Los Santos Underground Radio", icon: "assets/icons/Los%20Santos%20Underground%20Radio.png", ytIndex: 16 },
  { name: "blonded Los Santos 97.8 FM", icon: "assets/icons/blonded%20Los%20Santos%2097.8%20FM.png", ytIndex: 23 },
  { name: "Music Locker Radio", icon: "assets/icons/Music%20Locker%20Radio.png", ytIndex: 20 },
  { name: "Los Santos Rock Radio", icon: "assets/icons/Los%20Santos%20Rock%20Radio.png", ytIndex: 2 },
  { name: "Non-Stop-Pop FM", icon: "assets/icons/Non-Stop-Pop%20FM.png", ytIndex: 1 },
  { name: "Radio Los Santos", icon: "assets/icons/Radio%20Los%20Santos.png", ytIndex: 3 },
  { name: "Channel X", icon: "assets/icons/Channel%20X.png", ytIndex: 10 },
  { name: "Soulwax FM", icon: "assets/icons/Soulwax%20FM.png", ytIndex: 12 },
  { name: "East Los FM", icon: "assets/icons/East%20Los%20FM.png", ytIndex: 9 },
  { name: "West Coast Classics", icon: "assets/icons/West%20Coast%20Classics.png", ytIndex: 4 },
  { name: "Radio Off", icon: "assets/icons/mute.png", ytIndex: -1 },
  { name: "Blue Ark", icon: "assets/icons/Blue%20Ark.png", ytIndex: 7 },
  { name: "Worldwide FM", icon: "assets/icons/Worldwide%20FM.png", ytIndex: 8 },
  { name: "FlyLo FM", icon: "assets/icons/FlyLo%20FM.png", ytIndex: 13 },
  { name: "The Lowdown 91.1", icon: "assets/icons/The%20Lowdown%2091.1.png", ytIndex: 6 },
  { name: "The Lab", icon: "assets/icons/The%20Lab.png", ytIndex: 15 },
  { name: "Radio Mirror Park", icon: "assets/icons/Radio%20Mirror%20Park.png", ytIndex: 11 },
  { name: "Space 103.2", icon: "assets/icons/Space%20103.2.png", ytIndex: 0 },
  { name: "Vinewood Boulevard Radio", icon: "assets/icons/Vinewood%20Boulevard%20Radio.png", ytIndex: 14 }
];

const totalStations = stations.length;
const angleStep = 360 / totalStations;
const wheel = document.getElementById('wheel-container');

let player = null;
let isPlayerReady = false;
let hasInteracted = false;
let isSwitchingStation = false;
let currentStationIndex = -1;

let currentRotation = 0;
let radius = 0;
let w = window.innerWidth;
let h = window.innerHeight;

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

function calculateLayout() {
    w = window.innerWidth;
    h = window.innerHeight;
    
    // We want the wheel center to be far below the screen.
    // The visible arc should pass near the center of the screen.
    // Let's use a very large radius so it looks like a shallow arc.
    radius = Math.max(w, h) * 0.6; 
    // Wait, to keep it consistently at the same screen height:
    // If center is at 120vh, radius should be based on window height so the top arc is always visible.
    // E.g., if radius = h * 0.8, top is at 40vh.
    radius = h * 0.85; // Active item at 35vh (slightly above center)
    
    updateCarousel(currentRotation);
}

function updateCarousel(rotation) {
    let normalizedRot = rotation % 360;
    if (normalizedRot < 0) normalizedRot += 360;
    
    let activeIndex = Math.round(normalizedRot / angleStep) % totalStations;
    activeIndex = (totalStations - activeIndex) % totalStations;

    if (activeIndex !== currentStationIndex) {
        currentStationIndex = activeIndex;
        playCurrentStation();
    }

    stations.forEach((s, i) => {
        const itemRot = i * angleStep + rotation;
        const div = document.getElementById(`station-${i}`);
        
        // 2D Rotation: container rotates, moves up by radius, then icon counter-rotates to stay upright
        // The origin of the wheel is at center-x, and 1.2 * h
        const originX = w / 2;
        const originY = h * 1.2;
        let transformStr = `translate(${originX}px, ${originY}px) translate(-50%, -50%) rotate(${itemRot}deg) translateY(${-radius}px) rotate(${-itemRot}deg)`;
        
        div.style.webkitTransform = transformStr;
        div.style.transform = transformStr;
        
        if (i === activeIndex) {
            div.classList.add('active');
            div.style.opacity = '1';
            div.style.zIndex = '10';
            div.style.pointerEvents = 'auto';
        } else {
            div.classList.remove('active');
            div.style.zIndex = '1';
            div.style.pointerEvents = 'none';
            
            // Fade out items that are further away in the rotation
            // The shortest angular distance to the top (which is 0deg visually for the container)
            let angleDiff = Math.abs((itemRot % 360 + 360) % 360);
            if (angleDiff > 180) angleDiff = 360 - angleDiff;
            
            // If it's more than ~40 degrees away, fade it out completely
            if (angleDiff > 45) {
                div.style.opacity = '0';
            } else {
                div.style.opacity = '0.6';
            }
        }
    });
}

// Initial calculation
let randomStartIndex = Math.floor(Math.random() * totalStations);
if (stations[randomStartIndex].ytIndex === -1) {
    randomStartIndex = (randomStartIndex + 1) % totalStations;
}
currentRotation = -randomStartIndex * angleStep;

calculateLayout();
window.addEventListener('resize', calculateLayout);

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
    if (event.data === YT.PlayerState.ENDED) {
        const s = stations[currentStationIndex];
        if (s && s.ytIndex !== -1) {
            player.playVideoAt(s.ytIndex);
        }
    }
}

let playTimeout;
function playCurrentStation() {
    clearTimeout(playTimeout);
    playTimeout = setTimeout(() => {
        if (!isPlayerReady || currentStationIndex === -1) return;
        
        if (!hasInteracted) return; // Only play if user has interacted
        
        const s = stations[currentStationIndex];
        if (s.ytIndex === -1) {
            player.pauseVideo();
        } else {
            const syncTime = Math.floor(Date.now() / 1000) % 3600; 
            player.loadPlaylist({
                listType: 'playlist',
                list: playlistId,
                index: s.ytIndex,
                startSeconds: syncTime
            });
            player.setVolume(100);
        }
    }, 50); 
}

// Input Handling
let isDragging = false;
let startPos = 0;
let startRotation = 0;
let velocity = 0;
let lastPos = 0;
let lastTime = 0;
let raf;

function handleFirstInteraction() {
    if (!hasInteracted && isPlayerReady) {
        hasInteracted = true;
        playCurrentStation();
    }
}

function getClientPos(e) {
    if (e.touches && e.touches.length > 0) {
        return e.touches[0].clientX; // Always use horizontal swipe for the arc
    }
    return e.clientX;
}

function onStart(e) {
    handleFirstInteraction();
    isDragging = true;
    const pos = getClientPos(e);
    startPos = pos;
    startRotation = currentRotation;
    velocity = 0;
    lastPos = pos;
    lastTime = Date.now();
    cancelAnimationFrame(raf);
}

function onMove(e) {
    if (!isDragging) return;
    const pos = getClientPos(e);
    const deltaPos = pos - startPos;
    const now = Date.now();
    const dt = now - lastTime;
    
    // Convert horizontal pixel movement to degrees of rotation
    const directionMult = 0.15; 
    
    currentRotation = startRotation + (deltaPos * directionMult);
    updateCarousel(currentRotation);
    
    if (dt > 0) {
        velocity = ((pos - lastPos) / dt) * directionMult;
    }
    lastPos = pos;
    lastTime = now;
}

function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    let speed = velocity * 15;
    
    function animate() {
        if (Math.abs(speed) > 0.1) {
            currentRotation += speed;
            speed *= 0.92;
            updateCarousel(currentRotation);
            raf = requestAnimationFrame(animate);
        } else {
            const snapRotation = Math.round(currentRotation / angleStep) * angleStep;
            const diff = snapRotation - currentRotation;
            
            if (Math.abs(diff) > 0.5) {
                currentRotation += diff * 0.15;
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
document.addEventListener('mousedown', onStart);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);

// Touch
document.addEventListener('touchstart', onStart, {passive: false});
document.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    onMove(e);
}, {passive: false});
document.addEventListener('touchend', onEnd);

// Mouse wheel
let wheelTimeout;
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    handleFirstInteraction();
    
    const delta = e.deltaY || e.deltaX;
    currentRotation += delta * 0.1;
    updateCarousel(currentRotation);
    
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        const snapRotation = Math.round(currentRotation / angleStep) * angleStep;
        
        function snapAnim() {
            const diff = snapRotation - currentRotation;
            if (Math.abs(diff) > 0.5) {
                currentRotation += diff * 0.15;
                updateCarousel(currentRotation);
                raf = requestAnimationFrame(snapAnim);
            } else {
                currentRotation = snapRotation;
                updateCarousel(currentRotation);
                playCurrentStation();
            }
        }
        cancelAnimationFrame(raf);
        snapAnim();
    }, 150);
}, {passive: false});
