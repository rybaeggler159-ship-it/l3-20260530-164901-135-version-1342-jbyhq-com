function initVideoPlayer(streamUrl) {
    const video = document.getElementById('videoPlayer');
    const cover = document.getElementById('playerCover');
    const button = document.getElementById('playButton');
    let ready = false;

    function attach() {
        if (!video || ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add('hidden');
        }
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
    }
    if (cover) {
        cover.addEventListener('click', function () {
            play();
        });
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }
}
