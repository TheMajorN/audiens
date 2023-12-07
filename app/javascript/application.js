//= require jquery
//= require jquery_ujs
//= require select2

const players = {};
const loopStates = {};

// Function to create YouTube players and associate volume sliders
function createYouTubePlayers() {
  const playButtons = document.querySelectorAll('.play-btn');
  const volumeSliders = document.querySelectorAll('.volume-slider');
  const loopButtons = document.querySelectorAll('.loop-btn');

  playButtons.forEach(function(button) {
    const videoSource = button.getAttribute('data-video-source');
    const videoId = button.dataset.videoId;
    const playerDiv = document.getElementById(`player-${videoId}`);
    
    if (videoSource === 'youtube') {
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
    }
    
    button.addEventListener('click', function() {
      console.log("Play button clicked");
      const videoId = this.dataset.videoId;
      console.log(videoId);
      const button = document.getElementById("btn-" + videoId);
      const videoSource = button.getAttribute('data-video-source');
      const audioPlayer = document.getElementById(`player-${videoId}`);

      if (videoSource === 'youtube') {
        if (players[videoId].getPlayerState() === 1) {
          players[videoId].pauseVideo();
          togglePauseIcon(button);
        } else {
          players[videoId].playVideo();
          togglePlayIcon(button);
        }
      }
      else if (videoSource === 'upload') {
        if (audioPlayer.paused) {
          audioPlayer.play();
          togglePauseIcon(button);
        } else {
          audioPlayer.pause();
          togglePlayIcon(button);
        }
      }
    });
  });

  volumeSliders.forEach(function(slider) {
    slider.addEventListener('input', function() {
      const videoId = this.dataset.videoId;
      const videoSource = slider.getAttribute('data-video-source');
      const audioPlayer = document.getElementById(`player-${videoId}`);

      if (videoSource === 'youtube') {
        const volume = parseInt(this.value);
        if (players[videoId]) {
          players[videoId].setVolume(volume);
        }
      }
      else if (videoSource === 'upload') {
        audioPlayer.volume = parseFloat(this.value);
      }
    });
  });

  loopButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
      const videoId = this.dataset.videoId;
      const button = document.getElementById("btn-" + videoId);
      const videoSource = button.getAttribute('data-video-source');
      const audioPlayer = document.getElementById(`player-${videoId}`);

      if (videoSource === 'youtube') { 
        const clickedButton = event.target.closest('.loop-btn');
        if (clickedButton) {
          const videoId = clickedButton.dataset.videoId;
          if (players[videoId]) {
            loopStates[videoId] = !loopStates[videoId];
            clickedButton.classList.toggle('loop-enabled', loopStates[videoId]);
          }
        }
      }
      else if (videoSource === 'upload') {
        const clickedButton = event.target.closest('.loop-btn');
        audioPlayer.loop = !audioPlayer.loop;
        clickedButton.classList.toggle('loop-enabled', audioPlayer.loop);
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

function togglePlayIcon(button) {
  button.querySelector('i').classList.remove('fa-play');
  button.querySelector('i').classList.add('fa-pause');
}

function togglePauseIcon(button) {
  button.querySelector('i').classList.remove('fa-pause');
  button.querySelector('i').classList.add('fa-play');
}

$(document).ready(function() {
  $('#new-folder-form').on('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    var formData = $(this).serialize(); // Serialize form data

    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: formData,
      success: function(response) {
        // Handle success response (if needed)
        console.log('Folder created successfully');
        // You can update the folder list here if required
      },
      error: function(xhr, status, error) {
        // Handle error response (if needed)
        console.error('Error creating folder:', error);
      }
    });
  });
});