(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderCard(item) {
    return [
      '<article class="movie-card">',
      '<a href="' + item.url + '" class="poster-link" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-float">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    if (header && toggle) {
      toggle.addEventListener('click', function () {
        var open = header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === index); });
        dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === index); });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { show(i); });
      });
      if (slides.length > 1) {
        window.setInterval(function () { show(index + 1); }, 5200);
      }
    }

    var query = getQuery();
    var resultBox = document.getElementById('search-results');
    var titleBox = document.getElementById('search-title');
    if (resultBox && titleBox && query && window.SEARCH_INDEX) {
      var words = query.toLowerCase().split(/\s+/).filter(Boolean);
      var results = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
        return words.every(function (word) { return haystack.indexOf(word) !== -1; });
      }).slice(0, 120);
      titleBox.textContent = results.length ? '搜索结果：' + query : '未找到相关内容';
      if (results.length) {
        resultBox.innerHTML = results.map(renderCard).join('');
      }
    }
  });
})();
