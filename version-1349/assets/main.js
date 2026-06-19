document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    function applyFilters(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope='#" + scope.id + "']"));
        var keyword = "";
        var region = "";
        var year = "";

        controls.forEach(function (control) {
            if (control.matches("[data-filter-input]")) {
                keyword = control.value.trim().toLowerCase();
            }
            if (control.matches("[data-filter-region]")) {
                region = control.value;
            }
            if (control.matches("[data-filter-year]")) {
                year = control.value;
            }
        });

        var visible = 0;
        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-tags") || "",
                card.getAttribute("data-year") || ""
            ].join(" ").toLowerCase();
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchRegion = !region || card.getAttribute("data-region") === region;
            var matchYear = !year || card.getAttribute("data-year") === year;
            var showCard = matchKeyword && matchRegion && matchYear;
            card.hidden = !showCard;
            if (showCard) {
                visible += 1;
            }
        });

        var empty = scope.querySelector("[data-empty-result]");
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    document.querySelectorAll("[data-filter-input], [data-filter-region], [data-filter-year]").forEach(function (control) {
        var selector = control.getAttribute("data-filter-scope");
        var scope = selector ? document.querySelector(selector) : null;
        if (scope && scope.id) {
            control.addEventListener("input", function () {
                applyFilters(scope);
            });
            control.addEventListener("change", function () {
                applyFilters(scope);
            });
        }
    });

    document.querySelectorAll("[data-player]").forEach(function (frame) {
        var video = frame.querySelector("video[data-stream]");
        var overlay = frame.querySelector(".player-overlay");
        var message = frame.querySelector(".player-message");
        var loaded = false;
        var hls = null;

        if (!video || !overlay) {
            return;
        }

        function fail() {
            if (message) {
                message.textContent = "视频暂时无法播放";
                message.hidden = false;
            }
        }

        function hideMessage() {
            if (message) {
                message.textContent = "";
                message.hidden = true;
            }
        }

        function attach() {
            var stream = video.getAttribute("data-stream") || "";
            if (loaded) {
                return;
            }
            loaded = true;
            hideMessage();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        fail();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else {
                fail();
            }
        }

        function play() {
            attach();
            overlay.classList.add("is-hidden");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("error", fail);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
});
