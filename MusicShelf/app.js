const shelf = document.getElementById('music-shelf');
const sortSelect = document.getElementById('sort-select');
const playerContainer = document.getElementById('player-container');
const playerFrame = document.getElementById('player-frame');
const closePlayerBtn = document.getElementById('close-player-btn');
const tabButtons = document.querySelectorAll('.tab-btn');

let albumList = [];

let currentActiveFile = localStorage.getItem('selectedTab') || 'albums.json';
const savedSortOption = localStorage.getItem('selectedSort') || 'id';

if (sortSelect) {
  sortSelect.value = savedSortOption;
}

if (tabButtons) {
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-file') === currentActiveFile) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function loadMediaDatabase(fileName) {
  currentActiveFile = fileName;

  localStorage.setItem('selectedTab', fileName);
  
  const cacheBusterUrl = `${fileName}?_=${new Date().getTime()}`;
  
  fetch(cacheBusterUrl)
    .then(response => response.json())
    .then(data => {
      albumList = data;
      
      applySortingAndRender();
    })
    .catch(err => console.error('Error loading database:', err));
}

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
        playerFrame.src = `Player/index.html?album=${album.id}&type=${currentActiveFile}`;
        playerContainer.style.display = 'flex'; 
      }
    });

    shelf.appendChild(card);
  });
}

if (closePlayerBtn) {
  closePlayerBtn.addEventListener('click', () => {
    if (playerContainer && playerFrame) {
      playerContainer.style.display = 'none';
      playerFrame.src = 'about:blank'; 
    }
  });
}

if (tabButtons) {
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const targetFile = e.target.getAttribute('data-file');
      loadMediaDatabase(targetFile);
    });
  });
}

function applySortingAndRender() {
  const sortBy = sortSelect.value;
  localStorage.setItem('selectedSort', sortBy);
  
  let sortedAlbums = [...albumList];
  if (sortBy === 'artist') {
    sortedAlbums.sort((a, b) => a.artist.localeCompare(b.artist));
  } else if (sortBy === 'id') {
    sortedAlbums.sort((a, b) => a.id - b.id);
  }
  renderShelf(sortedAlbums);
}

sortSelect.addEventListener('change', applySortingAndRender);
