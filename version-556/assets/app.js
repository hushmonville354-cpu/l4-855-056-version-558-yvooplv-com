(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function openSearch(form) {
    var input = form.querySelector("input[name='q']");
    var value = input ? input.value.trim() : "";
    if (value) {
      window.location.href = "./search.html?q=" + encodeURIComponent(value);
    } else {
      window.location.href = "./search.html";
    }
  }

  function setupNavigation() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        openSearch(form);
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function fillOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-movie-grid]");
    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var status = panel.querySelector("[data-filter-status]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (search && initial) {
      search.value = initial;
    }

    var regions = Array.from(new Set(cards.map(function (card) { return card.dataset.region; }).filter(Boolean))).sort();
    var types = Array.from(new Set(cards.map(function (card) { return card.dataset.type; }).filter(Boolean))).sort();
    var years = Array.from(new Set(cards.map(function (card) { return card.dataset.year; }).filter(Boolean))).sort().reverse();

    fillOptions(region, regions);
    fillOptions(type, types);
    fillOptions(year, years);

    function run() {
      var q = normalize(search ? search.value : "");
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(" "));
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (regionValue && card.dataset.region !== regionValue) {
          matched = false;
        }
        if (typeValue && card.dataset.type !== typeValue) {
          matched = false;
        }
        if (yearValue && card.dataset.year !== yearValue) {
          matched = false;
        }
        card.classList.toggle("is-filter-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = "匹配影片 " + visible + " 部";
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", run);
        control.addEventListener("change", run);
      }
    });

    run();
  }

  window.initMoviePlayer = function (source, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }

    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }

    function play() {
      attachSource();
      video.controls = true;
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
