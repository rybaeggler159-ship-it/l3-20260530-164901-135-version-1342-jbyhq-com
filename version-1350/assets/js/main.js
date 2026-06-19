(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var menuButton = qs("[data-menu-button]");
  var siteNav = qs("[data-site-nav]");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  var hero = qs("[data-hero]");

  if (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  var globalSearch = qs("[data-global-search]");
  var searchResults = qs("[data-search-results]");

  function renderGlobalResults(query) {
    if (!globalSearch || !searchResults || !window.SiteMovies) {
      return;
    }

    var keyword = normalize(query);

    if (!keyword) {
      searchResults.classList.remove("is-open");
      searchResults.innerHTML = "";
      return;
    }

    var results = window.SiteMovies.filter(function (movie) {
      return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.tags).indexOf(keyword) !== -1;
    }).slice(0, 14);

    if (!results.length) {
      searchResults.innerHTML = '<div class="search-result-item"><div></div><span>暂无匹配内容</span></div>';
      searchResults.classList.add("is-open");
      return;
    }

    searchResults.innerHTML = results.map(function (movie) {
      return '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></span>' +
        '</a>';
    }).join("");
    searchResults.classList.add("is-open");
  }

  if (globalSearch && searchResults) {
    globalSearch.addEventListener("input", function () {
      renderGlobalResults(globalSearch.value);
    });

    globalSearch.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        var query = globalSearch.value.trim();
        if (query) {
          window.location.href = "./categories.html?q=" + encodeURIComponent(query);
        }
      }
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".header-search")) {
        searchResults.classList.remove("is-open");
      }
    });
  }

  var cardSearch = qs("[data-card-search]");
  var regionFilter = qs("[data-filter-region]");
  var typeFilter = qs("[data-filter-type]");
  var yearFilter = qs("[data-filter-year]");
  var cardList = qs("[data-card-list]");
  var noResults = qs("[data-no-results]");

  function applyFilters() {
    if (!cardList) {
      return;
    }

    var keyword = normalize(cardSearch ? cardSearch.value : "");
    var region = normalize(regionFilter ? regionFilter.value : "");
    var type = normalize(typeFilter ? typeFilter.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var cards = qsa("[data-title]", cardList);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre
      ].join(" "));
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (region && normalize(card.dataset.region) !== region) {
        matched = false;
      }
      if (type && normalize(card.dataset.type) !== type) {
        matched = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle("is-visible", visible === 0);
    }
  }

  [cardSearch, regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  if (cardSearch) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      cardSearch.value = initialQuery;
    }
    applyFilters();
  }
})();
