(function () {
  var attached = false;

  function attachStream(video, streamUrl) {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  window.initMoviePlayer = function (streamUrl, videoId, overlayId) {
    var video = document.getElementById(videoId || "movie-player");
    var overlay = document.getElementById(overlayId || "play-overlay");
    if (!video) {
      return;
    }

    function start() {
      attachStream(video, streamUrl);
      video.controls = true;
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
