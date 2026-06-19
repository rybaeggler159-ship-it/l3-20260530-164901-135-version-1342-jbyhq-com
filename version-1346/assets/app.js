(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs(".nav-toggle");
        var nav = qs(".mobile-nav");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = qsa(".hero-slide");
        var dots = qsa(".hero-dot");

        if (!slides.length) {
            return;
        }

        var index = 0;

        function activate(next) {
            index = (next + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
            });
        });

        window.setInterval(function () {
            activate(index + 1);
        }, 5600);
    }

    function setupSearchForms() {
        qsa("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input", form);
                var value = input ? input.value.trim() : "";
                var target = "./search.html";

                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }

                window.location.href = target;
            });
        });
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase();
    }

    function setupFilterScope(scope) {
        var search = qs("[data-filter-search]", scope);
        var year = qs("[data-filter-year]", scope);
        var type = qs("[data-filter-type]", scope);
        var cards = qsa("[data-card]", scope);
        var empty = qs("[data-empty]", scope);

        function apply() {
            var q = normalize(search && search.value);
            var y = year && year.value;
            var t = type && type.value;
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var passQ = !q || text.indexOf(q) >= 0;
                var passY = !y || card.getAttribute("data-year") === y;
                var passT = !t || card.getAttribute("data-type") === t;
                var pass = passQ && passY && passT;

                card.style.display = pass ? "" : "none";

                if (pass) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        }

        [search, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q && search) {
            search.value = q;
        }

        apply();
    }

    function setupFilters() {
        qsa("[data-filter-scope]").forEach(setupFilterScope);
    }

    window.bindMoviePlayer = function (sourceUrl) {
        var wrap = qs(".player-unit");
        var video = qs(".movie-video", wrap);
        var layer = qs(".play-layer", wrap);
        var button = qs(".play-ring", wrap);
        var attached = false;
        var hls = null;

        if (!wrap || !video || !layer || !sourceUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function start() {
            attach();
            video.controls = true;
            layer.classList.add("is-hidden");
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        layer.addEventListener("click", start);

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
