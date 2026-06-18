document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(next) {
        if (!slides.length) return;
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === index);
        });
    }

    var prev = document.querySelector('.hero-control.prev');
    var next = document.querySelector('.hero-control.next');
    if (prev) prev.addEventListener('click', function () { showSlide(index - 1); });
    if (next) next.addEventListener('click', function () { showSlide(index + 1); });
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var filterInput = document.querySelector('.local-filter');
    var typeFilter = document.querySelector('.type-filter');
    var yearFilter = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var empty = document.querySelector('.empty-state');
    var count = document.querySelector('.search-count');

    if (filterInput && query) {
        filterInput.value = query;
    }

    function includesValue(text, value) {
        return !value || String(text || '').toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
    }

    function applyFilters() {
        if (!cards.length) return;
        var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var type = typeFilter ? typeFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var shown = 0;
        cards.forEach(function (card) {
            var text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.keywords
            ].join(' ').toLowerCase();
            var ok = includesValue(text, q) && includesValue(card.dataset.type, type) && includesValue(card.dataset.year, year);
            card.hidden = !ok;
            if (ok) shown += 1;
        });
        if (empty) empty.hidden = shown !== 0;
        if (count) count.textContent = q || type || year ? '找到 ' + shown + ' 部相关影片' : '';
    }

    if (filterInput) filterInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    applyFilters();

    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function (video) {
        var stream = video.getAttribute('data-stream');
        var cover = video.parentElement ? video.parentElement.querySelector('.player-cover') : null;
        var ready = false;

        if (stream && window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                if (video.dataset.intent === 'play') {
                    video.play().catch(function () {});
                }
            });
        } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            ready = true;
        }

        function start() {
            video.dataset.intent = 'play';
            if (cover) cover.classList.add('is-hidden');
            if (ready || video.src) {
                video.play().catch(function () {});
            }
        }

        if (cover) cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) start();
        });
    });
});
