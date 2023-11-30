function onYouTubeIframeAPIReady() {
  const players = {};

  document.querySelectorAll('.play-pause-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const videoId = this.getAttribute('data-video-id');
      togglePlay(videoId);
    });
  });

  document.querySelectorAll('iframe').forEach(function(frame) {
    const videoId = frame.id.replace('player-', '');
    players[videoId] = new YT.Player(frame);
  });

  function togglePlay(videoId) {
    const player = players[videoId];
    if (player.getPlayerState() === 1) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }
}