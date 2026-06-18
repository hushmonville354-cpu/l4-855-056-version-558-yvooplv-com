function setupMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);

  if (!video || !overlay || !source) {
    return;
  }

  var isReady = false;
  var hlsInstance = null;

  function attachSource() {
    if (isReady) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      isReady = true;
    }
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      menuButton.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  initHeroCarousel();
  initLocalFilters();
  initSearchPage();
});

function initHeroCarousel() {
  var carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
  var prev = carousel.querySelector("[data-hero-prev]");
  var next = carousel.querySelector("[data-hero-next]");
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

  function run() {
    clearInterval(timer);
    timer = setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      run();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      run();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      run();
    });
  }

  run();
}

function initLocalFilters() {
  var panels = document.querySelectorAll("[data-local-filter]");

  panels.forEach(function (panel) {
    var list = document.querySelector("[data-card-list]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
    var input = panel.querySelector("[data-local-search] input");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-btn"));
    var empty = document.querySelector(".empty-message");
    var selected = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesType = selected === "all" || type === selected;
        var show = matchesText && matchesType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        selected = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  });
}

function initSearchPage() {
  var resultList = document.querySelector("[data-search-results]");

  if (!resultList) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim().toLowerCase();
  var form = document.querySelector("[data-search-page-form]");
  var input = form ? form.querySelector("input[name='q']") : null;
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-search-filter] .filter-btn"));
  var cards = Array.prototype.slice.call(resultList.querySelectorAll(".movie-card"));
  var empty = document.querySelector(".empty-message");
  var selected = "all";

  if (input) {
    input.value = query;
  }

  function apply() {
    var activeQuery = input ? input.value.trim().toLowerCase() : query;
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var type = card.getAttribute("data-type") || "";
      var matchesText = !activeQuery || text.indexOf(activeQuery) !== -1;
      var matchesType = selected === "all" || type === selected;
      var show = matchesText && matchesType;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (input) {
    input.addEventListener("input", apply);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      selected = button.getAttribute("data-filter-value") || "all";
      buttons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      apply();
    });
  });

  apply();
}
