const songImage = document.getElementById("song-image");
const songName = document.getElementById("song-name");
const songArtist = document.getElementById("song-artist");
const songSlider = document.getElementById("slider-song");
const playpauseButton = document.getElementById("playpause-song");
const prevSongButton = document.getElementById("prev-song");
const nextSongButton = document.getElementById("next-song");
const vinylSpin = document.querySelector('#vinyl-spin');

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

const urlParams = new URLSearchParams(window.location.search);
let requestedAlbumId = parseInt(urlParams.get('album')); 
let requestedFileType = urlParams.get('type') || 'albums.json'; 

if (isNaN(requestedAlbumId)) {
    requestedAlbumId = 1; 
}

fetch(`../${requestedFileType}`) 
    .then(response => {
        if (!response.ok) throw new Error(`Could not find the target storage database configuration file: ${requestedFileType}`);
        return response.json();
    })
    .then(albums => {
        let currentAlbum = albums.find(a => a.id === requestedAlbumId);
        
        if (!currentAlbum) {
            currentAlbum = albums[0]; 
        }

        if (currentAlbum) {
            albumArtistName = currentAlbum.artist;
            songs = currentAlbum.tracks;
            currentSongIndex = 0;

            updateSong(true);
        }
    })
    .catch(err => {
        console.error("Critical Music Player Crash:", err);
    });

prevSongButton.addEventListener("click", function() {
    if (currentSongIndex == 0) return;
    currentSongIndex--;
    updateSong();
});

nextSongButton.addEventListener("click", function() {
    if (currentSongIndex == songs.length - 1) return;
    currentSongIndex++;
    updateSong();
});

playpauseButton.addEventListener("click", function() {
    if (!audio.paused) {
        audio.pause();
        if (vinylSpin) vinylSpin.style.animationPlayState = 'paused';
    } else {
        audio.play().catch(err => console.log("Context initialized. Audio playing."));
        if (vinylSpin) vinylSpin.style.animationPlayState = 'running';
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
    } else {
        currentSongIndex = 0;
        updateSong(true); 
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
    } else {
        audio.play().catch(err => console.warn("Autoplay block condition intercepted:", err));
        if (vinylSpin) vinylSpin.style.animationPlayState = 'running';
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

setInterval(moveSlider, 1000);
