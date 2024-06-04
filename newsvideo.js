  // Replace 'YOUR_API_KEY' and 'PLAYLIST_ID' with your actual API key and playlist ID
  const apiKey = 'AIzaSyCaloVzVDnSmcwjtgy5fefBz7F60ubdL14';
  const playlistId = 'PLHd-8ma4m21gAQsyuU041u8Iv_aOJJLHe';

  // Fetch latest videos from the playlist
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet,contentDetails&order=date&maxResults=10`)
    .then(response => response.json())
    .then(data => {
      const videosContainer = document.getElementById('videos-container');
      
      // Iterate through the playlist items and display the videos
      data.items.forEach(item => {
        const videoId = item.contentDetails.videoId;
        const videoTitle = item.snippet.title;
        const videoThumbnail = item.snippet.thumbnails.default.url;

        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
          <h2 class="videoTitle" title="${videoTitle}">${videoTitle}</h2>
          <iframe class="vid" src="https://www.youtube.com/embed/${videoId}" frameborder="0" denyfullscreen></iframe>
        `;
        videoElement.setAttribute('id', 'videoDiv');

        videosContainer.appendChild(videoElement);
      });
    })
    .catch(error => console.error('Error fetching playlist videos:', error));