const shelf = document.getElementById('music-shelf');
const sortSelect = document.getElementById('sort-select');
const playerFrame = document.getElementById('player-frame');

let albumList = [];

fetch('albums.json')
  .then(response => response.json())
  .then(data => {
    albumList = data;        
    renderShelf(albumList);  
  })
  .catch(err => console.error('Failed to load JSON file:', err));

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
      if (playerFrame) {
        playerFrame.src = `Player/index.html?album=${album.id}`;
      }
    });

    shelf.appendChild(card);
  });
}

// 3. The sort system event listener
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
