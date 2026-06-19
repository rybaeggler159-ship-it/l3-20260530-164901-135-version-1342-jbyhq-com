(function () {
  window.SitePlayer = {
    init: function (videoId, streamUrl) {
      var video = document.getElementById(videoId);

      if (!video || !streamUrl) {
        return;
      }

      var shell = video.closest(".player-shell");
      var startButton = shell ? shell.querySelector('[data-player-start="' + videoId + '"]') : null;
      var ready = false;
      var hlsInstance = null;

      function showError() {
        if (!shell || shell.querySelector(".player-error")) {
          return;
        }

        var error = document.createElement("div");
        error.className = "player-error";
        error.textContent = "视频暂时无法加载";
        shell.appendChild(error);
      }

      function prepare() {
        if (ready) {
          return;
        }

        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showError();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          showError();
        }
      }

      function startPlayback() {
        prepare();

        if (startButton) {
          startButton.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (startButton) {
              startButton.classList.remove("is-hidden");
            }
          });
        }
      }

      if (startButton) {
        startButton.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
