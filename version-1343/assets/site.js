(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-card-filter]');
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-play]');
        var stream = player.getAttribute('data-stream') || '';
        var hlsReady = false;
        var hlsInstance = null;

        function attachStream(done) {
            if (!video || !stream) {
                return;
            }

            if (hlsReady) {
                done();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                hlsReady = true;
                done();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hlsReady = true;
                    done();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = stream;
                        hlsReady = true;
                    }
                });
                return;
            }

            video.src = stream;
            hlsReady = true;
            done();
        }

        function playVideo() {
            attachStream(function () {
                player.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
        }
    }

    var searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot && typeof SITE_MOVIES !== 'undefined') {
        var searchInput = searchRoot.querySelector('[data-search-input]');
        var categorySelect = searchRoot.querySelector('[data-search-category]');
        var sortSelect = searchRoot.querySelector('[data-search-sort]');
        var results = searchRoot.querySelector('[data-search-results]');
        var count = searchRoot.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function cardTemplate(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card" data-card>',
                    '<a href="' + movie.url + '" class="card-cover" aria-label="观看' + escapeHtml(movie.title) + '">',
                        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                        '<span class="card-play">▶</span>',
                    '</a>',
                    '<div class="card-body">',
                        '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                        '<p class="card-desc">' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>',
                        '<div class="card-meta">',
                            '<span>' + escapeHtml(movie.year || '') + '</span>',
                            '<span>' + escapeHtml(movie.region || '') + '</span>',
                            '<span>' + escapeHtml(movie.type || '') + '</span>',
                        '</div>',
                        '<div class="tag-row">' + tags + '</div>',
                    '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderSearch() {
            var keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
            var category = categorySelect ? categorySelect.value : 'all';
            var sort = sortSelect ? sortSelect.value : 'heat';
            var list = SITE_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.genre, movie.categoryName, (movie.tags || []).join(' '), movie.oneLine, movie.summary].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = category === 'all' || movie.categorySlug === category;
                return matchKeyword && matchCategory;
            });

            list.sort(function (a, b) {
                if (sort === 'year') {
                    return String(b.year).localeCompare(String(a.year));
                }
                if (sort === 'title') {
                    return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN');
                }
                return (b.heat || 0) - (a.heat || 0);
            });

            if (count) {
                count.textContent = list.length;
            }

            if (!results) {
                return;
            }

            if (!list.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
                return;
            }

            results.innerHTML = list.slice(0, 240).map(cardTemplate).join('');
        }

        [searchInput, categorySelect, sortSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', renderSearch);
                node.addEventListener('change', renderSearch);
            }
        });

        renderSearch();
    }
})();
