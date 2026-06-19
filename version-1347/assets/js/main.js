(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });
    if (slides.length) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    const filters = Array.from(document.querySelectorAll('[data-filter-form]'));
    filters.forEach(function (form) {
        const input = form.querySelector('[data-filter-input]');
        const type = form.querySelector('[data-filter-type]');
        const year = form.querySelector('[data-filter-year]');
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        const empty = document.querySelector('[data-no-results]');
        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const typeValue = type ? type.value : '';
            const yearValue = year ? year.value : '';
            let shown = 0;
            cards.forEach(function (card) {
                const haystack = card.getAttribute('data-search') || '';
                const cardType = card.getAttribute('data-type') || '';
                const cardYear = card.getAttribute('data-year') || '';
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchType = !typeValue || cardType === typeValue;
                const matchYear = !yearValue || cardYear === yearValue;
                const visible = matchKeyword && matchType && matchYear;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }
        [input, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });
    });
}());
