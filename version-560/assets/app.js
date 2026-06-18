(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }
})();

(function () {
  var slider = document.querySelector(".hero-slider");
  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
  var next = slider.querySelector(".hero-next");
  var prev = slider.querySelector(".hero-prev");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("active", itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("active", itemIndex === index);
    });
  }

  function play() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    play();
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-slide")) || 0);
      restart();
    });
  });

  show(0);
  play();
})();

(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.getElementById("searchInput");
  var grid = document.querySelector(".search-grid");
  var empty = document.querySelector(".empty-state");

  if (input && query) {
    input.value = query;
  }

  function applySearch(value) {
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var matched = terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
      card.hidden = terms.length > 0 && !matched;
      if (!card.hidden) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (grid) {
    applySearch(query);
  }

  if (input) {
    input.addEventListener("input", function () {
      applySearch(input.value.trim());
    });
  }
})();

(function () {
  var panel = document.querySelector(".filter-panel");
  var grid = document.querySelector(".filterable-grid");

  if (!panel || !grid) {
    return;
  }

  var state = {
    region: "all",
    type: "all"
  };

  function refresh() {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    cards.forEach(function (card) {
      var regionOk = state.region === "all" || card.getAttribute("data-region") === state.region;
      var typeOk = state.type === "all" || card.getAttribute("data-type") === state.type;
      card.hidden = !(regionOk && typeOk);
    });
  }

  panel.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter-key]");
    if (!button) {
      return;
    }

    var key = button.getAttribute("data-filter-key");
    var value = button.getAttribute("data-filter-value");
    state[key] = value;

    Array.prototype.slice.call(panel.querySelectorAll('button[data-filter-key="' + key + '"]')).forEach(function (item) {
      item.classList.toggle("active", item === button);
    });

    refresh();
  });

  refresh();
})();

(function () {
  var box = document.querySelector("[data-player]");
  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var overlay = box.querySelector(".player-overlay");
  var hls = null;

  function start() {
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }

    if (overlay) {
      overlay.hidden = true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (hls) {
        hls.destroy();
      }
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
    } else {
      video.src = stream;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.hidden = true;
    }
  });
})();
