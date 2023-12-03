const players = {};
const loopStates = {};

// Function to create YouTube players and associate volume sliders
function createYouTubePlayers() {
  const playButtons = document.querySelectorAll('.play-btn');
  const volumeSliders = document.querySelectorAll('.volume-slider');
  const loopButtons = document.querySelectorAll('.loop-btn');

  playButtons.forEach(function(button) {
    const videoId = button.dataset.videoId;
    const playerDiv = document.getElementById(`player-${videoId}`);
    
    players[videoId] = new YT.Player(playerDiv, {
      width: 0,
      height: 0,
      videoId: videoId,
      events: {
        'onReady': function(event) {
          const volumeSlider = document.querySelector(`.volume-slider[data-video-id="${videoId}"]`);
          const initialVolume = parseInt(volumeSlider.value);
          event.target.setVolume(initialVolume);
          onPlayerReady(event);
        }
      }
    });
    
    button.addEventListener('click', function() {
      const videoId = this.dataset.videoId;
      const button = document.getElementById("btn-" + videoId)
      if (players[videoId].getPlayerState() === 1) {
        players[videoId].pauseVideo();
        button.querySelector('i').classList.remove('fa-pause');
        button.querySelector('i').classList.add('fa-play');
      } else {
        players[videoId].playVideo();
        button.querySelector('i').classList.remove('fa-play');
        button.querySelector('i').classList.add('fa-pause');
      }
    });
  });

  volumeSliders.forEach(function(slider) {
    slider.addEventListener('input', function() {
      const videoId = this.dataset.videoId;
      const volume = parseInt(this.value);
      if (players[videoId]) {
        players[videoId].setVolume(volume);
      }
    });
  });

  loopButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
      const clickedButton = event.target.closest('.loop-btn');

      if (clickedButton) {
        const videoId = clickedButton.dataset.videoId;
        if (players[videoId]) {
          loopStates[videoId] = !loopStates[videoId];
          clickedButton.classList.toggle('loop-enabled', loopStates[videoId]);
        }
      }
    });
  });

  // Event listeners for player state changes
  Object.values(players).forEach(player => {
    player.addEventListener('onStateChange', event => {
      const videoId = event.target.h.g.videoId;
      if (players[videoId].getPlayerState() === 0 && loopStates[videoId]) {
        players[videoId].playVideo(); // Play the video again if loop is enabled
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const trackNames = document.querySelectorAll('.track-name');

  trackNames.forEach(function(trackName) {
    trackName.addEventListener('click', function() {
      const currentText = this.textContent;
      const trackId = this.getAttribute('data-track-id');
      
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.value = currentText;

      this.replaceWith(inputField);
      inputField.focus();

      inputField.addEventListener('blur', function() {
        updateTrackName(this, trackId);
      });

      inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          updateTrackName(this, trackId);
        }
      });
    });
  });

  function updateTrackName(inputField, trackId) {
    const newValue = inputField.value;
    const url = `/tracks/${trackId}`;

    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ track: { name: newValue } })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log(data); // Handle success or error messages
      // Replace input field with updated track name
      inputField.replaceWith(createTrackNameSpan(newValue, trackId));
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  function createTrackNameSpan(name, trackId) {
    const span = document.createElement('span');
    span.classList.add('track-name');
    span.setAttribute('data-track-id', trackId);
    span.textContent = name;
    return span;
  }
});

// YouTube API callback function
function onYouTubeIframeAPIReady() {
  createYouTubePlayers();
}

function onPlayerReady(event) {
  // Optional: Do something when the player is ready
}