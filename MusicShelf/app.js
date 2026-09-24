const shelf = document.getElementById('music-shelf');
const sortSelect = document.getElementById('sort-select');

// New Container & Button Selectors
const playerContainer = document.getElementById('player-container');
const playerFrame = document.getElementById('player-frame');
const closePlayerBtn = document.getElementById('close-player-btn');

// FIXED: Added the missing selector to target your tab layout buttons!
const tabButtons = document.querySelectorAll('.tab-btn');

let albumList = [];
let currentActiveFile = 'albums.json'; 

function loadMediaDatabase(fileName) {
  currentActiveFile = fileName;
  
  fetch(fileName)
    .then(response => response.json())
    .then(data => {
      albumList = data;
      sortSelect.value = 'id'; 
      renderShelf(albumList);
    })
    .catch(err => console.error('Error loading database:', err));
}

// Initial Boot
loadMediaDatabase(currentActiveFile);

function renderShelf(albums) {
  shelf.innerHTML = '';

  albums.forEach(album => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <img src="${album.coverUrl}" alt="${album.title} cover">
      <div class="album-title">${album.title}</div>
      <div class="album-artist">${album.artist}</div>
    `;

    card.addEventListener('click', () => {
      if (playerFrame && playerContainer) {
        // 1. Load the requested song data parameters
        playerFrame.src = `Player/index.html?album=${album.id}&type=${currentActiveFile}`;
        
        // 2. Reveal the entire player wrapper area smoothly
        playerContainer.style.display = 'flex'; 
        
        // Optional: Scroll down smoothly to the player so the user sees it open
        playerContainer.scrollIntoView({ behavior: 'smooth' });
      }
    });

    shelf.appendChild(card);
  });
}

// THE CLOSE BUTTON EVENT LISTENER
if (closePlayerBtn) {
  closePlayerBtn.addEventListener('click', () => {
    if (playerContainer && playerFrame) {
      // 1. Hide the container layout from the viewport
      playerContainer.style.display = 'none';
      
      // 2. CRITICAL: Wipe out the iframe's source link. 
      // This kills the audio stream instantly so music doesn't keep ghost-playing in the background!
      playerFrame.src = 'about:blank'; 
    }
  });
}

// 4. Tab click handler event logic loops
if (tabButtons) {
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Clean old active states out of tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Highlight the clicked tab element
      e.target.classList.add('active');
      
      // Read the file name target data parameter string and execute loader
      const targetFile = e.target.getAttribute('data-file');
      loadMediaDatabase(targetFile);
    });
  });
}

// 5. The sort system event listener
sortSelect.addEventListener('change', (event) => {
  const sortBy = event.target.value;
  let sortedAlbums = [...albumList];

  if (sortBy === 'artist') {
    sortedAlbums.sort((a, b) => a.artist.localeCompare(b.artist));
  } else if (sortBy === 'id') {
    sortedAlbums.sort((a, b) => a.id - b.id);
  }

  renderShelf(sortedAlbums);
});
