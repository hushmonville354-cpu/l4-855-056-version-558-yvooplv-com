(function() {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }
    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  var lists = document.querySelectorAll("[data-card-list]");
  lists.forEach(function(list) {
    var scope = list.closest("main") || document;
    var input = scope.querySelector("[data-card-filter]");
    var select = scope.querySelector("[data-sort-cards]");
    var original = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    function filterCards() {
      var q = input ? input.value.trim().toLowerCase() : "";
      original.forEach(function(card) {
        var hay = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        card.classList.toggle("hidden-by-filter", q && hay.indexOf(q) === -1);
      });
    }
    function sortCards() {
      if (!select) {
        return;
      }
      var value = select.value;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      if (value === "year-desc") {
        cards.sort(function(a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (value === "year-asc") {
        cards.sort(function(a, b) {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        });
      } else if (value === "title") {
        cards.sort(function(a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
        });
      } else {
        cards = original.slice();
      }
      cards.forEach(function(card) {
        list.appendChild(card);
      });
    }
    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", function() {
        sortCards();
        filterCards();
      });
    }
  });

  var results = document.getElementById("search-results");
  if (results && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.getElementById("site-search-input");
    if (input) {
      input.value = q;
    }
    var normalized = q.toLowerCase();
    var matches = window.MOVIES.filter(function(movie) {
      var hay = [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(" "), movie.one_line, String(movie.year)].join(" ").toLowerCase();
      return normalized ? hay.indexOf(normalized) !== -1 : movie.featured;
    }).slice(0, 120);
    results.innerHTML = matches.map(function(movie) {
      return [
        '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '">',
        '  <a href="./' + movie.file + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <div class="card-cover">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="year-pill">' + movie.year + '</span>',
        '      <span class="play-glow">▶</span>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.one_line) + '</p>',
        '      <div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '      <span class="genre-chip">' + escapeHtml(movie.category_name) + '</span>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("\n");
    }).join("\n");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }
})();
