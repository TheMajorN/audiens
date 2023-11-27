//= require jquery
//= require jquery_ujs

document.addEventListener("DOMContentLoaded", function() {
  function loadYoutubeAPI() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  loadYoutubeAPI();


  function createPlayer(vidId, playerId) {
    console.log("Creating player with player ID: " + playerId + " and video ID: " + vidId);
    return new YT.Player(playerId, {
      height: '50', // Set height and width to 0 to hide the player
      width: '100',
      videoId: vidId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        loop: 1,
        playlist: vidId,
        mute: 1 // Mute to only play audio
      },
      events: {
        'onReady': onPlayerReady
      }
    });
  }

  function onPlayerReady(event) {
    console.log("Playing!");
    event.target.setVolume(100);
    event.target.playVideo();
  }

  function extractYouTubeVideoId(trackUrl) {
    var videoId = trackUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)[1];
    return videoId;
  }

  var playButtons = document.querySelectorAll('.play-button');
  playButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var videoId = extractYouTubeVideoId(this.dataset.videoId);
      console.log("Video ID: " + videoId);
      var playerId = this.dataset.trackId;
      console.log("Player ID: " + playerId);
      createPlayer(videoId, playerId);
    });
  });
});