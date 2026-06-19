(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = $('[data-nav-toggle]');
        var menu = $('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            restart();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initLocalFilters() {
        var panel = $('[data-filter-panel]');
        var container = $('[data-filter-container]');
        if (!panel || !container) {
            return;
        }
        var input = $('[data-local-search]', panel);
        var fields = $all('[data-filter-field]', panel);
        var cards = $all('[data-movie-card]', container);
        var empty = $('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var filters = {};
            fields.forEach(function (field) {
                filters[field.getAttribute('data-filter-field')] = normalize(field.value);
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matched = !query || haystack.indexOf(query) !== -1;
                Object.keys(filters).forEach(function (name) {
                    var expected = filters[name];
                    if (!expected) {
                        return;
                    }
                    var value = normalize(card.getAttribute('data-' + name));
                    if (value.indexOf(expected) === -1) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        fields.forEach(function (field) {
            field.addEventListener('change', applyFilters);
        });
        applyFilters();
    }

    function initSearchForms() {
        var forms = $all('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initPlayer() {
        var video = $('.video-player');
        var overlay = $('[data-play-button]');
        var status = $('[data-player-status]');
        if (!video || !overlay) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var loaded = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.setAttribute('controls', 'controls');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放连接暂时不可用，请稍后重试。');
                    }
                });
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            loadSource();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                    setStatus('浏览器阻止了自动播放，请再次点击播放。');
                });
            }
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initLocalFilters();
        initSearchForms();
        initPlayer();
    });
})();
