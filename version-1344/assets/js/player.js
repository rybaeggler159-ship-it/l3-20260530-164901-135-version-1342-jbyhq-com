import { H as Hls } from './hls-vendor.js';

function setupPlayer(root) {
  var video = root.querySelector('video');
  var cover = root.querySelector('.player-cover');
  var source = root.getAttribute('data-src');
  var loaded = false;

  function attach() {
    if (loaded || !video || !source) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  document.querySelectorAll('.js-start-video').forEach(function (button) {
    button.addEventListener('click', start);
  });

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      start();
    }
  });
}

document.querySelectorAll('.js-player').forEach(setupPlayer);
