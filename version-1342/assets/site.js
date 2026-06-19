(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var bgs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      bgs.forEach(function (bg, i) {
        bg.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length) {
      showSlide(0);
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var genreSelect = document.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function filterCards() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var genre = genreSelect ? genreSelect.value : "";
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var hitKeyword = !keyword || title.indexOf(keyword) !== -1 || cardGenre.toLowerCase().indexOf(keyword) !== -1;
        var hitYear = !year || cardYear === year;
        var hitGenre = !genre || cardGenre.indexOf(genre) !== -1;
        card.style.display = hitKeyword && hitYear && hitGenre ? "" : "none";
      });
    }

    [filterInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    var searchForm = document.querySelector("[data-search-form]");
    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchNote = document.querySelector("[data-search-note]");

    function cardHtml(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster" href="' + item.link + '">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
        '<span class="poster-year">' + item.year + '</span>',
        '<span class="poster-type">' + item.type + '</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="' + item.link + '">' + item.title + '</a>',
        '<div class="card-meta"><span>' + item.region + '</span><span>' + item.genre + '</span><span>评分 ' + item.rating + '</span></div>',
        '<p>' + item.desc + '</p>',
        '</div>',
        '</article>'
      ].join("");
    }

    function runSearch(value) {
      if (!searchResults || !window.MOVIE_SEARCH_INDEX) {
        return;
      }
      var query = (value || "").trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.desc].join(" ").toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 80);
      if (searchNote) {
        searchNote.textContent = query ? "为你匹配到以下内容" : "热门内容推荐";
      }
      searchResults.innerHTML = list.map(cardHtml).join("");
    }

    if (searchResults) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (searchInput) {
        searchInput.value = q;
      }
      runSearch(q);
    }

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch(searchInput ? searchInput.value : "");
      });
    }
  });
})();
