//= require jquery
//= require jquery_ujs
//= require select2

const players = {};
const loopStates = {};

function createYouTubePlayers() {
  const playButtons = document.querySelectorAll('.play-btn');
  const volumeSliders = document.querySelectorAll('.volume-slider');
  const loopButtons = document.querySelectorAll('.loop-btn');
  const folderSelections = document.querySelectorAll('.folder-choice');

  playButtons.forEach(button => {
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
      const videoId = this.dataset.videoId;
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
      } else if (videoSource === 'upload') {
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

  volumeSliders.forEach(slider => {
    slider.addEventListener('input', function() {
      const videoId = this.dataset.videoId;
      const videoSource = slider.getAttribute('data-video-source');
      const audioPlayer = document.getElementById(`player-${videoId}`);

      if (videoSource === 'youtube') {
        const volume = parseInt(this.value);
        if (players[videoId]) {
          players[videoId].setVolume(volume);
        }
      } else if (videoSource === 'upload') {
        audioPlayer.volume = parseFloat(this.value);
      }
    });
  });

  loopButtons.forEach(button => {
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
      } else if (videoSource === 'upload') {
        const clickedButton = event.target.closest('.loop-btn');
        audioPlayer.loop = !audioPlayer.loop;
        clickedButton.classList.toggle('loop-enabled', audioPlayer.loop);
      }
    });
  });

  folderSelections.forEach(selector => {
    const videoId = selector.getAttribute('data-track-id');
    const selectorId = document.getElementById(`select-folders-${videoId}`);

    $(selectorId).select2();
  });

  Object.values(players).forEach(player => {
    player.addEventListener('onStateChange', event => {
      const videoId = event.target.h.g.videoId;
      if (players[videoId].getPlayerState() === 0 && loopStates[videoId]) {
        players[videoId].playVideo();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const trackNames = document.querySelectorAll('.track-name');

  trackNames.forEach(trackName => {
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
        console.log(data);
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

const toggleDisplay = (element) => {
  element.classList.toggle('hidden');
};

const addFolderBar = document.getElementById('add-folder-bar');
const addFolderInput = document.getElementById('add-folder-input');

const addSoundEffectBar = document.getElementById('add-sound-effect');
const soundEffectOptions = document.getElementById('sound-effect-options');
const buttonContainer = document.querySelector('.button-container');
const youtubeURLButton = document.getElementById('youtube-url-sound-effect-btn');
const uploadButton = document.getElementById('upload-sound-effect-btn');
const youtubeURLForm = document.getElementById('youtube-url-sound-effect-form');
const uploadForm = document.getElementById('upload-sound-effect-form');
const addSoundEffectFinalButton = document.getElementById('add-sound-effect-final-btn');
const resetSoundEffectsButton = document.getElementById('sound-effect-reset-button');

function resetSoundEffectCreation() {
  addSoundEffectBar.classList.remove('hidden');
  soundEffectOptions.classList.add('hidden');
  youtubeURLForm.classList.add('hidden');
  uploadForm.classList.add('hidden');
  addSoundEffectFinalButton.classList.add('hidden');
}

addFolderBar.addEventListener('click', () => {
  toggleDisplay(addFolderInput);
});

addSoundEffectBar.addEventListener('click', () => {
  toggleDisplay(addSoundEffectBar);
  toggleDisplay(soundEffectOptions);
});

youtubeURLButton.addEventListener('click', () => {
  toggleDisplay(youtubeURLForm);
  if (addSoundEffectFinalButton.classList.contains('hidden')) {
    toggleDisplay(addSoundEffectFinalButton);
  }
  if (!uploadForm.classList.contains('hidden')) {
    toggleDisplay(uploadForm);
  }
});

uploadButton.addEventListener('click', () => {
  toggleDisplay(uploadForm);
  if (addSoundEffectFinalButton.classList.contains('hidden')) {
    toggleDisplay(addSoundEffectFinalButton);
  }
  if (!youtubeURLForm.classList.contains('hidden')) {
    toggleDisplay(youtubeURLForm);
  }
});

resetSoundEffectsButton.addEventListener('click', () => {
  resetSoundEffectCreation();
});

const addTrackBar = document.getElementById('add-track');
const trackOptions = document.getElementById('track-options');
const trackButtonContainer = document.querySelector('.button-container');
const trackYoutubeURLButton = document.getElementById('youtube-url-track-btn');
const trackUploadButton = document.getElementById('upload-track-btn');
const trackYoutubeURLForm = document.getElementById('youtube-url-track-form');
const trackUploadForm = document.getElementById('upload-track-form');
const addTrackFinalButton = document.getElementById('add-track-final-btn');
const resetTrackButton = document.getElementById('track-reset-button');

function resetTrackCreation() {
  addTrackBar.classList.remove('hidden');
  trackOptions.classList.add('hidden');
  trackYoutubeURLForm.classList.add('hidden');
  trackUploadForm.classList.add('hidden');
  addTrackFinalButton.classList.add('hidden');
}

addTrackBar.addEventListener('click', () => {
  toggleDisplay(addTrackBar);
  toggleDisplay(trackOptions);
});

trackYoutubeURLButton.addEventListener('click', () => {
  toggleDisplay(trackYoutubeURLForm);
  if (addTrackFinalButton.classList.contains('hidden')) {
    toggleDisplay(addTrackFinalButton);
  }
  if (!trackUploadForm.classList.contains('hidden')) {
    toggleDisplay(trackUploadForm);
  }
});

trackUploadButton.addEventListener('click', () => {
  toggleDisplay(trackUploadForm);
  if (addTrackFinalButton.classList.contains('hidden')) {
    toggleDisplay(addTrackFinalButton);
  }
  if (!trackYoutubeURLForm.classList.contains('hidden')) {
    toggleDisplay(trackYoutubeURLForm);
  }
});

resetTrackButton.addEventListener('click', () => {
  resetTrackCreation();
});

$(document).ready(function() {
  // Click event for folder items
  $('.folder-item').on('click', function() {
    const folderId = $(this).data('folder-id');

    // Hide all sound-effect-items
    $('.sound-effect-item').hide();

    // Show sound-effect-items that have the selected folder-choice
    $('.sound-effect-item .folder-choice').each(function() {
      const selectedFolders = $(this).val();
      if (selectedFolders && selectedFolders.includes(folderId.toString())) {
        $(this).closest('.sound-effect-item').show();
      }
    });
  });

  $('#reset-folder-filters').on('click', function() {
    const folderId = $(this).data('folder-id');

    // Show all sound-effect-items
    $('.sound-effect-item').show();
  });
});

document.querySelectorAll('.expand-button').forEach(button => {
  button.addEventListener('click', () => {
    const soundEffectItem = button.closest('.sound-effect-item');
    soundEffectItem.classList.toggle('expanded');
  });
});

function onYouTubeIframeAPIReady() {
  createYouTubePlayers();
}

function onPlayerReady(event) {
  // Optional: Do something when the player is ready
}

function togglePlayIcon(button) {
  const icon = button.querySelector('i');
  icon.classList.remove('fa-play');
  icon.classList.add('fa-pause');
}

function togglePauseIcon(button) {
  const icon = button.querySelector('i');
  icon.classList.remove('fa-pause');
  icon.classList.add('fa-play');
}