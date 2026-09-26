const songImage = document.getElementById("song-image");
const songName = document.getElementById("song-name");
const songArtist = document.getElementById("song-artist");
const songSlider = document.getElementById("slider-song");
const playpauseButton = document.getElementById("playpause-song");
const prevSongButton = document.getElementById("prev-song");
const nextSongButton = document.getElementById("next-song");
const vinylSpin = document.querySelector('#vinyl-spin');
const vinylInner = document.querySelector('#vinyl-inner');

const audio = document.createElement("audio");

const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");

let savedVolume = localStorage.getItem('userVolume');
let currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.4;
let lastVolume = currentVolume > 0 ? currentVolume : 0.4;

audio.volume = currentVolume;
if (volumeSlider) {
    volumeSlider.value = currentVolume;
}

if (volumeBtn) {
    if (currentVolume === 0) {
        volumeBtn.className = "bi bi-volume-mute-fill";
    } else if (currentVolume < 0.7) {
        volumeBtn.className = "bi bi-volume-down-fill";
    } else {
        volumeBtn.className = "bi bi-volume-up-fill";
    }
}

let songs = [];
let currentSongIndex = 0;
let albumArtistName = "";
let currentVinylTextUrl = "";

const urlParams = new URLSearchParams(window.location.search);
let requestedAlbumId = parseInt(urlParams.get('album')); 
let requestedFileType = urlParams.get('type') || 'albums.json'; 

if (isNaN(requestedAlbumId)) {
    requestedAlbumId = 1; 
}

// FIXED: Cleaned up the duplicate .then() blocks and made it crash-proof
fetch(`../${requestedFileType}`) 
    .then(response => {
        if (!response.ok) throw new Error(`Could not find the target storage database configuration file: ${requestedFileType}`);
        return response.json();
    })
    .then(albums => {
        // Safety check to ensure the file returned valid data
        if (!albums || !Array.isArray(albums) || albums.length === 0) {
            throw new Error(`The file ${requestedFileType} returned empty or invalid data format.`);
        }

        let currentAlbum = albums.find(a => a.id === requestedAlbumId);
        
        // Fallback to the first album if the ID isn't found
        if (!currentAlbum) {
            currentAlbum = albums[0]; 
        }

        if (currentAlbum) {
            albumArtistName = currentAlbum.artist || "Unknown Artist";
            songs = currentAlbum.tracks || [];
            currentSongIndex = 0;
            
            // Save the unique record sticker art globally here
            currentVinylTextUrl = currentAlbum.vTextUrl || ""; 

            updateSong(true);
            setInnerVinyl(); // Run it once at startup to set the initial vinyl face
        }
    })
    .catch(err => {
        console.error("Critical Music Player Crash:", err);
    });

prevSongButton.addEventListener("click", function() {
    if (currentSongIndex == 0) return;
    currentSongIndex--;
    updateSong();
    setInnerVinyl(); 
});

nextSongButton.addEventListener("click", function() {
    if (currentSongIndex == songs.length - 1) return;
    currentSongIndex++;
    updateSong();
    setInnerVinyl(); 
});

playpauseButton.addEventListener("click", function() {
    if (!audio.paused) {
        audio.pause();
        if (vinylSpin) vinylSpin.style.animationPlayState = 'paused';
        if (vinylInner) vinylInner.style.animationPlayState = 'paused';
    } else {
        audio.play().catch(err => console.log("Context initialized. Audio playing."));
        if (vinylSpin) vinylSpin.style.animationPlayState = 'running';
        if (vinylInner) vinylInner.style.animationPlayState = 'running';
    }
});

if (volumeSlider) {
    volumeSlider.addEventListener("input", function() {
        const volumeValue = parseFloat(volumeSlider.value);
        audio.volume = volumeValue;
        
        localStorage.setItem('userVolume', volumeValue);

        if (volumeValue === 0) {
            volumeBtn.className = "bi bi-volume-mute-fill";
        } else if (volumeValue < 0.7) {
            volumeBtn.className = "bi bi-volume-down-fill";
        } else {
            volumeBtn.className = "bi bi-volume-up-fill";
        }
    });
}

if (volumeBtn) {
    volumeBtn.addEventListener("click", function() {
        if (audio.volume > 0) {
            lastVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            localStorage.setItem('userVolume', 0);
            volumeBtn.className = "bi bi-volume-mute-fill";
        } else {
            audio.volume = lastVolume;
            volumeSlider.value = lastVolume;
            localStorage.setItem('userVolume', lastVolume);
            volumeBtn.className = lastVolume < 0.7 ? "bi bi-volume-down-fill" : "bi bi-volume-up-fill";
        }
    });
}

audio.addEventListener("ended", function() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        updateSong();
        setInnerVinyl(); 
    } else {
        currentSongIndex = 0;
        updateSong(true); 
        setInnerVinyl();
    }
});

function updateSong(isInitialLoad = false) {
    if (!songs || songs.length === 0) return;

    const song = songs[currentSongIndex];
    console.log("🎯 Currently loading track data:", song);

    const nameEl = document.getElementById("song-name") || document.getElementById("Song");
    const artistEl = document.getElementById("song-artist") || document.getElementById("Artist");

    if (nameEl) nameEl.innerText = song.title || "Unknown Title";
    if (artistEl) artistEl.innerText = albumArtistName || "Unknown Artist";

    if (song.audioUrl) {
        audio.src = `../${song.audioUrl}`;
    }
    
    audio.onloadedmetadata = function() {
        songSlider.value = 0;
        songSlider.max = audio.duration;
    };

    if (isInitialLoad) {
        audio.pause();
        if (vinylSpin) vinylSpin.style.animationPlayState = 'paused';
        if (vinylInner) vinylInner.style.animationPlayState = 'paused';
    } else {
        audio.play().catch(err => console.warn("Autoplay block condition intercepted:", err));
        if (vinylSpin) vinylSpin.style.animationPlayState = 'running';
        if (vinylInner) vinylInner.style.animationPlayState = 'running';
    }
}

songSlider.addEventListener("change", function() {
    audio.currentTime = songSlider.value;
});

function moveSlider() {
    if (!audio.paused && audio.currentTime) {
        songSlider.value = audio.currentTime;
    }
}

function setInnerVinyl() {
    if (vinylInner && currentVinylTextUrl) {
        vinylInner.src = `../${currentVinylTextUrl}`; 
    }
}

setInterval(moveSlider, 1000);
