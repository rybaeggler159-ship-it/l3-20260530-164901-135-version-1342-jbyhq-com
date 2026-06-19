(function () {
  window.createMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function hideOverlay() {
      overlay.classList.add("is-hidden");
    }

    function playVideo() {
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
      hideOverlay();
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            video.src = source;
            video.load();
            playVideo();
          }
        });
        return;
      }

      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
    }

    overlay.addEventListener("click", start);
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };
})();
