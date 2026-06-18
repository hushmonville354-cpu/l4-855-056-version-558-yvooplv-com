(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function move(step) {
            showSlide(index + step);
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (panel) {
        var section = panel.closest('.section') || document;
        var searchInput = panel.querySelector('[data-search-input]');
        var typeSelect = panel.querySelector('[data-type-select]');
        var yearSelect = panel.querySelector('[data-year-select]');
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function matchesYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }

            var numericYear = Number(cardYear || 0);
            var target = Number(selectedYear);

            if (target === 2020) {
                return numericYear > 0 && numericYear < 2021;
            }

            return numericYear === target;
        }

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-text'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = card.getAttribute('data-year');
                var visible = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }

                if (type && cardType.indexOf(type) === -1) {
                    visible = false;
                }

                if (!matchesYear(cardYear, year)) {
                    visible = false;
                }

                card.classList.toggle('is-hidden', !visible);
            });
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var source = shell.getAttribute('data-video');
        var started = false;
        var hls = null;

        function attachSource() {
            if (!video || !source || started) {
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();

            if (button) {
                button.classList.add('is-hidden');
            }

            if (video) {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
