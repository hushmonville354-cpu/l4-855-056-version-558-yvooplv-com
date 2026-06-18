(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
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

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var empty = panel.querySelector("[data-empty-state]");
      var root = panel.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));

      function apply() {
        var q = normalize(input && input.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-tags") + " " + card.getAttribute("data-title"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (q && text.indexOf(q) === -1) {
            matched = false;
          }
          if (y && cardYear !== y) {
            matched = false;
          }
          if (t && cardType !== t) {
            matched = false;
          }

          card.classList.toggle("is-filtered-out", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card[data-stream]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".play-layer");
      var stream = player.getAttribute("data-stream");

      function loadAndPlay() {
        if (!video || !stream) {
          return;
        }

        if (!video.dataset.ready) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.dataset.ready = "true";
        }

        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", loadAndPlay);
      }
      player.addEventListener("click", function (event) {
        if (event.target === video && !video.dataset.ready) {
          loadAndPlay();
        }
      });
    });
  }

  setupMobileMenu();
  setupHero();
  setupFilters();
  setupPlayer();
})();
