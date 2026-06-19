(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var images = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-image]"));
    var panels = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-panel]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!images.length || !panels.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + images.length) % images.length;
      images.forEach(function (image, imageIndex) {
        image.classList.toggle("active", imageIndex === index);
      });
      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle("active", panelIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var note = document.querySelector("[data-result-note]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var currentChip = "";
    var queryValue = params.get("q") || "";
    input.value = queryValue;

    function apply() {
      var query = normalize(input.value);
      var chip = normalize(currentChip);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text"));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedChip = !chip || text.indexOf(chip) !== -1;
        var matched = matchedQuery && matchedChip;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (note) {
        note.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    input.addEventListener("input", apply);
    chips.forEach(function (chipButton) {
      chipButton.addEventListener("click", function () {
        currentChip = chipButton.getAttribute("data-filter-value") || "";
        chips.forEach(function (button) {
          button.classList.toggle("active", button === chipButton);
        });
        apply();
      });
    });
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
