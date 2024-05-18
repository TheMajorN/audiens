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
  addFolderInput.classList.remove('hidden');
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

document.addEventListener('DOMContentLoaded', function() {
  let selectedFolderIds;

  new TomSelect(".folder-dropdown",{
    maxItems: 99
  });

  // Function to toggle the dropdown list
  const dropdownButtons = document.querySelectorAll('.dropdown-btn');
  dropdownButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const dropdownList = this.nextElementSibling;
      if (dropdownList.style.display === 'none' || dropdownList.style.display === '') {
        dropdownList.style.display = 'block';
      } else {
        dropdownList.style.display = 'none';
      }
    });
  });

  // Initialize folder dropdowns
  const folderDropdowns = document.querySelectorAll('.folder-dropdown');
  folderDropdowns.forEach(function(dropdown) {
    dropdown.addEventListener('change', function() {
      selectedFolderIds = Array.from(this.selectedOptions).map(option => option.value);
      console.log(selectedFolderIds)
      const trackId = this.dataset.trackId;
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

      fetch(`/tracks/${trackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ track: { folder_ids: selectedFolderIds } }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Track folders updated successfully!');
        updateDataFolderIds(trackId, selectedFolderIds);
        updateSoundEffectItems(selectedFolderIds);
      })
      .catch(error => {
        console.error('Error updating track folders:', error);
      });
    });
  });

  // Initialize folder items
  const folderItems = document.querySelectorAll('.folder-item');
  folderItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const folderId = this.dataset.folderId;

      // Hide all sound-effect-items
      const soundEffectItems = document.querySelectorAll('.sound-effect-item');
      soundEffectItems.forEach(function(soundEffectItem) {
        const itemFolderIds = selectedFolderIds || [];
        if (itemFolderIds.includes(folderId.toString())) {
          soundEffectItem.style.display = 'flex';
        } else {
          soundEffectItem.style.display = 'none';
        }
      });
    });
  });

  // Handle reset folder filters
  const resetButton = document.getElementById('reset-folder-filters');
  resetButton.addEventListener('click', function() {
    const soundEffectItems = document.querySelectorAll('.sound-effect-item');
    soundEffectItems.forEach(function(soundEffectItem) {
      soundEffectItem.style.display = 'flex';
    });
  });

  // Function to update data-folder-ids attributes
  function updateDataFolderIds(trackId, selectedFolderIds) {
    const soundEffectItems = document.querySelectorAll('.sound-effect-item');
    soundEffectItems.forEach(function(item) {
      const itemTrackId = item.dataset.trackId;
      if (itemTrackId === trackId) {
        item.setAttribute('data-folder-ids', selectedFolderIds.join(','));
      }
    });
  }

  // Function to update sound-effect-items based on selected folder IDs
  function updateSoundEffectItems(selectedFolderIds) {
    const soundEffectItems = document.querySelectorAll('.sound-effect-item');
    if (selectedFolderIds && selectedFolderIds.length > 0) {
      soundEffectItems.forEach(function(item) {
        const itemFolderIds = selectedFolderIds;
        itemFolderIds.includes(selectedFolderIds.toString()) ? item.style.display = 'block' : item.style.display = 'none';
      });
    } else {
      soundEffectItems.forEach(function(item) {
        item.style.display = 'block';
      });
    }
  }
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
