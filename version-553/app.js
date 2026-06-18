document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  document.querySelectorAll("[data-catalog-panel]").forEach(function (panel) {
    var searchInput = panel.querySelector("[data-search-input]");
    var yearFilter = panel.querySelector("[data-filter-year]");
    var regionFilter = panel.querySelector("[data-filter-region]");
    var typeFilter = panel.querySelector("[data-filter-type]");
    var cards = Array.from(panel.querySelectorAll(".movie-card"));
    var emptyState = panel.querySelector("[data-empty-state]");

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var year = yearFilter ? yearFilter.value : "";
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var visible = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
});
