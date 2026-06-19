(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');

    if (!input && !year && !type) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          card.getAttribute('data-title') + ' ' +
          card.getAttribute('data-keywords') + ' ' +
          card.getAttribute('data-year') + ' ' +
          card.getAttribute('data-type')
        );
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        var matchType = !t || card.getAttribute('data-type') === t;
        var show = matchQuery && matchYear && matchType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(setupFilter);

  var hlsPromise;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  }

  function streamOf(video) {
    var source = video.querySelector('source');
    return video.getAttribute('data-stream') || (source ? source.getAttribute('src') : '');
  }

  function attach(video, shouldPlay) {
    var stream = streamOf(video);
    var shell = video.closest('.video-shell');

    if (!stream) {
      return;
    }

    if (video.dataset.ready === '1') {
      if (shouldPlay) {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
      if (shell) {
        shell.classList.add('is-ready');
      }
      if (shouldPlay) {
        video.play().catch(function () {});
      }
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        video.dataset.ready = '1';
        if (shell) {
          shell.classList.add('is-ready');
        }
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          if (shouldPlay) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = stream;
        video.dataset.ready = '1';
        if (shell) {
          shell.classList.add('is-ready');
        }
        if (shouldPlay) {
          video.play().catch(function () {});
        }
      }
    }).catch(function () {
      video.src = stream;
      video.dataset.ready = '1';
      if (shell) {
        shell.classList.add('is-ready');
      }
      if (shouldPlay) {
        video.play().catch(function () {});
      }
    });
  }

  document.querySelectorAll('.movie-video').forEach(function (video) {
    video.addEventListener('click', function () {
      attach(video, true);
    }, { once: true });
  });

  document.querySelectorAll('.player-start').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-target');
      var video = id ? document.getElementById(id) : button.parentElement.querySelector('video');
      if (video) {
        attach(video, true);
      }
    });
  });
})();
