document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70; // Height of fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.section-title, .about-text, .service-card, .portfolio-item, .contact-item');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px"
    });

    revealElements.forEach(element => {
        element.classList.add('reveal');
        revealObserver.observe(element);
    });

    // Hero Background Slideshow
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function nextSlide() {
        heroSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % heroSlides.length;
        heroSlides[currentSlide].classList.add('active');
    }

    // Change slide every 4 seconds
    if (heroSlides.length > 0) {
        setInterval(nextSlide, 4000);
    }

    // ===== Testimonials Carousel =====
    const testimonialTrack = document.getElementById('testimonialTrack');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    if (testimonialTrack && testimonialCards.length > 0) {
        let currentIndex = 0;
        let autoPlayInterval;

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function getTotalPages() {
            return Math.ceil(testimonialCards.length / getCardsPerView());
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const total = getTotalPages();
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('span');
                dot.classList.add('testimonial-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                    resetAutoPlay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateCarousel() {
            const cardsPerView = getCardsPerView();
            const totalPages = getTotalPages();
            if (currentIndex >= totalPages) currentIndex = 0;
            if (currentIndex < 0) currentIndex = totalPages - 1;

            // Calculate the offset
            const card = testimonialCards[0];
            const gap = cardsPerView === 1 ? 15 : (cardsPerView === 2 ? 20 : 30);
            const cardWidth = card.offsetWidth + gap;
            const offset = currentIndex * cardsPerView * cardWidth;

            testimonialTrack.style.transform = `translateX(-${offset}px)`;

            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.testimonial-dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
        }

        function goNext() {
            currentIndex++;
            if (currentIndex >= getTotalPages()) currentIndex = 0;
            updateCarousel();
        }

        function goPrev() {
            currentIndex--;
            if (currentIndex < 0) currentIndex = getTotalPages() - 1;
            updateCarousel();
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(goNext, 5000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // Arrow buttons
        if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); resetAutoPlay(); });

        // Pause on hover
        const wrapper = document.querySelector('.testimonials-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
            wrapper.addEventListener('mouseleave', () => startAutoPlay());
        }

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        testimonialTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        testimonialTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goNext();
                else goPrev();
                resetAutoPlay();
            }
        }, { passive: true });

        // Handle resize
        window.addEventListener('resize', () => {
            currentIndex = 0;
            buildDots();
            updateCarousel();
        });

        // Initialize
        buildDots();
        updateCarousel();
        startAutoPlay();
    }

    // ===== Interactive India Map - Dynamic Marker Positioning =====
    const mapWrapper = document.getElementById('mapImageWrapper');
    const mapImg = document.getElementById('indiaMapImg');
    const mapTooltip = document.getElementById('mapTooltip');
    const mapContainer = document.querySelector('.india-map-container');

    // ──────────────────────────────────────────────────────
    // CALIBRATION: Interactive India Map Settings
    // ──────────────────────────────────────────────────────
    const MAP_BOUNDS = {
        topLat: 37.0,     // Kashmir latitude
        bottomLat: 6.9,   // Kanyakumari latitude (calibrated)
        leftLon: 67.0,    // West Gujarat longitude
        rightLon: 98.0,   // Northeast longitude
        padTop: 8.5,      // % padding from top (calibrated)
        padBottom: 5,     // % padding from bottom
        padLeft: 12,      // % padding from left (calibrated)
        padRight: 7       // % padding from right (calibrated)
    };

    // ENABLE CALIBRATION MODE (Set to true to show sliders)
    const SHOW_CALIBRATION = false;

    if (mapWrapper && mapImg) {
        // ... (existing code)

        if (SHOW_CALIBRATION) {
            const panel = document.createElement('div');
            panel.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 15px; border: 1px solid #444; z-index: 1000; color: #fff; width: 250px; font-family: monospace; font-size: 11px;';
            panel.innerHTML = `
                <h3 style="margin:0 0 10px; color: #e74c3c">🗺️ Calibration</h3>
                <div style="margin-bottom:5px">Pad Top: <span id="val-padTop">${MAP_BOUNDS.padTop}</span>%</div>
                <input type="range" min="0" max="30" step="0.5" value="${MAP_BOUNDS.padTop}" data-key="padTop" style="width:100%">
                
                <div style="margin:5px 0">Pad Bottom: <span id="val-padBottom">${MAP_BOUNDS.padBottom}</span>%</div>
                <input type="range" min="0" max="30" step="0.5" value="${MAP_BOUNDS.padBottom}" data-key="padBottom" style="width:100%">
                
                <div style="margin:5px 0">Pad Left: <span id="val-padLeft">${MAP_BOUNDS.padLeft}</span>%</div>
                <input type="range" min="0" max="30" step="0.5" value="${MAP_BOUNDS.padLeft}" data-key="padLeft" style="width:100%">
                
                <div style="margin:5px 0">Pad Right: <span id="val-padRight">${MAP_BOUNDS.padRight}</span>%</div>
                <input type="range" min="0" max="30" step="0.5" value="${MAP_BOUNDS.padRight}" data-key="padRight" style="width:100%">
                
                <hr style="border-color:#333; margin:10px 0">
                
                <div style="margin:5px 0">Top Lat: <span id="val-topLat">${MAP_BOUNDS.topLat}</span></div>
                <input type="range" min="30" max="40" step="0.1" value="${MAP_BOUNDS.topLat}" data-key="topLat" style="width:100%">

                <div style="margin:5px 0">Bottom Lat: <span id="val-bottomLat">${MAP_BOUNDS.bottomLat}</span></div>
                <input type="range" min="0" max="15" step="0.1" value="${MAP_BOUNDS.bottomLat}" data-key="bottomLat" style="width:100%">
            `;
            mapContainer.appendChild(panel);
            mapContainer.style.position = 'relative';

            panel.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const key = e.target.dataset.key;
                    const val = parseFloat(e.target.value);
                    MAP_BOUNDS[key] = val;
                    document.getElementById(`val-${key}`).textContent = val;
                    updatePositions();
                });
            });
        }

        // City data: [name, lat, lon, projectCount, delaySeconds]
        const cities = [
            ['Delhi', 28.7041, 77.1025, '25+', 0],
            ['Karnal', 29.6857, 76.9905, '8+', 0.3],
            ['Gujarat', 23.0225, 72.5714, '10+', 0.6],
            ['Mumbai', 19.0760, 72.8777, '20+', 0.9],
            ['Pune', 18.5204, 73.8567, '12+', 1.2],
            ['Goa', 15.2993, 74.1240, '5+', 1.5],
            ['Hyderabad', 17.3850, 78.4867, '15+', 1.8],
            ['Kolkata', 22.5726, 88.3639, '10+', 2.1],
            ['Bangalore', 12.9716, 77.5946, '18+', 2.4],
            ['Chennai', 13.0827, 80.2707, '14+', 2.7],
            ['Coimbatore', 11.0168, 76.9558, '6+', 3.0]
        ];

        // Convert lat/lon to % position on image
        function latLonToPercent(lat, lon) {
            const b = MAP_BOUNDS;
            const usableWidth = 100 - b.padLeft - b.padRight;
            const usableHeight = 100 - b.padTop - b.padBottom;
            const left = b.padLeft + ((lon - b.leftLon) / (b.rightLon - b.leftLon)) * usableWidth;
            const top = b.padTop + ((b.topLat - lat) / (b.topLat - b.bottomLat)) * usableHeight;
            return { top, left };
        }

        // Create marker elements
        const markerElements = [];

        function updatePositions() {
            markerElements.forEach((marker, index) => {
                const [name, lat, lon, projects, delay] = cities[index];
                const pos = latLonToPercent(lat, lon);
                marker.style.top = pos.top + '%';
                marker.style.left = pos.left + '%';
            });
        }

        cities.forEach(([name, lat, lon, projects, delay]) => {
            const pos = latLonToPercent(lat, lon);
            const marker = document.createElement('div');
            marker.className = 'city-marker-div';
            marker.setAttribute('data-city', name);
            marker.setAttribute('data-projects', projects);
            marker.style.cssText = `top:${pos.top}%; left:${pos.left}%; --delay:${delay}s;`;
            marker.innerHTML = `
                <span class="marker-ring"></span>
                <span class="marker-ring ring-2"></span>
                <span class="marker-center"></span>
                <span class="marker-label">${name}</span>
            `;
            mapWrapper.appendChild(marker);
            markerElements.push(marker);
        });

        // Tooltip functionality
        if (mapTooltip && mapContainer) {
            markerElements.forEach(marker => {
                marker.addEventListener('mouseenter', (e) => {
                    const city = marker.getAttribute('data-city');
                    const projects = marker.getAttribute('data-projects');
                    mapTooltip.querySelector('.tooltip-city').textContent = city;
                    mapTooltip.querySelector('.tooltip-projects').textContent = projects + ' Projects';
                    mapTooltip.classList.add('visible');
                });

                marker.addEventListener('mousemove', (e) => {
                    const rect = mapContainer.getBoundingClientRect();
                    const x = e.clientX - rect.left + 15;
                    const y = e.clientY - rect.top - 10;
                    mapTooltip.style.left = x + 'px';
                    mapTooltip.style.top = y + 'px';
                });

                marker.addEventListener('mouseleave', () => {
                    mapTooltip.classList.remove('visible');
                });
            });
        }

        // City List Hover Highlight on Map
        const cityListItems = document.querySelectorAll('.city-list li');
        cityListItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const cityName = item.textContent.replace('HQ', '').trim();
                markerElements.forEach(marker => {
                    if (marker.getAttribute('data-city') === cityName) {
                        marker.querySelector('.marker-center').style.background = '#fff';
                        marker.querySelector('.marker-center').style.boxShadow = '0 0 15px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.5)';
                    }
                });
            });
            item.addEventListener('mouseleave', () => {
                markerElements.forEach(marker => {
                    marker.querySelector('.marker-center').style.background = '';
                    marker.querySelector('.marker-center').style.boxShadow = '';
                });
            });
        });
    }

    // ===== Animated Counter for Stats =====
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    if (statNumbers.length > 0) {
        let countersAnimated = false;

        function animateCounters() {
            if (countersAnimated) return;
            countersAnimated = true;

            statNumbers.forEach(el => {
                const target = parseInt(el.getAttribute('data-count'));
                const duration = 2000;
                const step = Math.ceil(target / (duration / 30));
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current;
                }, 30);
            });
        }

        const presenceSection = document.getElementById('presence');
        if (presenceSection) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            counterObserver.observe(presenceSection);
        }
    }
});
