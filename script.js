/* ================================================================
   ZINC ADDON v7 — EMBER ENGINE
   Floating Embers + Warm Glow + Interactive Cards
   ================================================================ */

// ========== FLOATING EMBER PARTICLES ==========
class EmberSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.embers = [];
        this.mouse = { x: -1000, y: -1000 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate(0);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(60, Math.floor((this.canvas.width * this.canvas.height) / 25000));
        this.embers = [];
        for (let i = 0; i < count; i++) {
            this.embers.push(this.createEmber());
        }
    }

    createEmber() {
        const hue = 15 + Math.random() * 30; // orange range
        return {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(Math.random() * 0.6 + 0.15),
            radius: Math.random() * 2.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.05,
            life: 0,
            maxLife: 300 + Math.random() * 400,
            hue: hue,
            flicker: Math.random() * 0.02 + 0.005,
            flickerPhase: Math.random() * Math.PI * 2,
            drift: Math.random() * 0.003 + 0.001,
        };
    }

    bindEvents() {
        window.addEventListener('resize', () => { this.resize(); this.init(); });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.embers.forEach((e, i) => {
            // Update
            e.life++;
            e.x += e.vx + Math.sin(time * e.drift) * 0.3;
            e.y += e.vy;

            // Fade in/out based on life
            const lifePct = e.life / e.maxLife;
            let alpha = e.opacity;
            if (lifePct < 0.1) alpha *= lifePct / 0.1;
            if (lifePct > 0.7) alpha *= (1 - lifePct) / 0.3;

            // Flicker
            alpha *= (0.7 + Math.sin(time * e.flicker + e.flickerPhase) * 0.3);

            // Mouse proximity — push away slightly and brighten
            const dx = e.x - this.mouse.x;
            const dy = e.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                e.x += dx * force * 0.02;
                e.y += dy * force * 0.02;
                alpha = Math.min(alpha * (1 + force), 0.7);
            }

            // Glow
            const gradient = this.ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius * 6);
            gradient.addColorStop(0, `hsla(${e.hue}, 90%, 60%, ${alpha})`);
            gradient.addColorStop(0.3, `hsla(${e.hue}, 90%, 55%, ${alpha * 0.4})`);
            gradient.addColorStop(1, `hsla(${e.hue}, 90%, 50%, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.radius * 6, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.radius * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${e.hue}, 100%, 80%, ${alpha * 1.8})`;
            this.ctx.fill();

            // Reset if dead or off-screen
            if (e.life >= e.maxLife || e.y < -50) {
                this.embers[i] = this.createEmber();
            }
        });

        requestAnimationFrame((t) => this.animate(t));
    }
}

// ========== NAVBAR ==========
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar?.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    });

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });
}

// ========== FAQ ==========
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// ========== REVEAL ON SCROLL ==========
function initReveal() {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ========== ANIMATED COUNTERS ==========
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2200;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * ease).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function initCounters() {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    animateCounter(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ========== FEATURE CARD TILT ========== 
function initCardTilt() {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -6;
            const rotateY = (x - 0.5) * 6;
            card.style.transform = `translateY(-4px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ========== VIS-STAT MAGNETIC HOVER ==========
function initStatHover() {
    document.querySelectorAll('.vis-stat').forEach(stat => {
        stat.addEventListener('mousemove', e => {
            const rect = stat.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            stat.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) translateY(-2px)`;
        });

        stat.addEventListener('mouseleave', () => {
            stat.style.transform = '';
        });
    });
}

// ========== BUTTON HOVER GLOW ==========
function initButtonGlow() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--glow-x', x + 'px');
            btn.style.setProperty('--glow-y', y + 'px');
        });
    });
}

// ========== SLIDER ==========
function initSlider() {
    const main = document.querySelector('.bh-main');
    if (!main) return;

    const slides = main.querySelectorAll('.bh-slide');
    const total = slides.length;
    if (total === 0) return;

    const prevBtn = document.getElementById('bh-prev');
    const nextBtn = document.getElementById('bh-next');
    const counter = document.getElementById('bh-counter');
    const progress = document.getElementById('bh-progress');
    const thumbsWrap = document.getElementById('bh-thumbs');
    const thumbs = thumbsWrap ? thumbsWrap.querySelectorAll('.bh-thumb') : [];

    let cur = 0;
    let timer = null;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function goTo(i) {
        if (total <= 1 || i === cur) return;

        slides[cur]?.classList.remove('active');
        thumbs[cur]?.classList.remove('active');

        cur = ((i % total) + total) % total;

        slides[cur]?.classList.add('active');
        thumbs[cur]?.classList.add('active');

        if (counter) counter.textContent = pad(cur + 1) + ' / ' + pad(total);

        if (thumbs[cur] && thumbsWrap) {
            const tLeft = thumbs[cur].offsetLeft - thumbsWrap.offsetLeft;
            const center = tLeft - (thumbsWrap.clientWidth / 2) + (thumbs[cur].offsetWidth / 2);
            thumbsWrap.scrollTo({ left: center, behavior: 'smooth' });
        }

        restartProgress();
    }

    function next() { goTo(cur + 1); }
    function prev() { goTo(cur - 1); }

    function restartProgress() {
        if (!progress) return;
        progress.classList.remove('running');
        void progress.offsetWidth;
        progress.classList.add('running');
    }

    function startAuto() {
        if (total <= 1) return;
        clearInterval(timer);
        timer = setInterval(next, 3000);
        restartProgress();
    }

    prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
    nextBtn?.addEventListener('click', () => { next(); startAuto(); });

    thumbs.forEach(t => {
        t.addEventListener('click', () => {
            const idx = parseInt(t.getAttribute('data-i'));
            if (!isNaN(idx)) { goTo(idx); startAuto(); }
        });
    });

    // Touch
    let sx = 0;
    main.addEventListener('touchstart', e => { sx = e.changedTouches[0].screenX; }, { passive: true });
    main.addEventListener('touchend', e => {
        const dx = sx - e.changedTouches[0].screenX;
        if (Math.abs(dx) > 50) { dx > 0 ? next() : prev(); startAuto(); }
    }, { passive: true });

    startAuto();
}

// ========== PARALLAX HERO ==========
function initParallaxHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
                heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
            }
        }
    });
}

// ========== SECTION NUMBER PARALLAX ==========
function initNumberParallax() {
    const numbers = document.querySelectorAll('.section-number');
    if (!numbers.length) return;

    window.addEventListener('scroll', () => {
        numbers.forEach(num => {
            const rect = num.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
                const offset = (window.innerHeight - rect.top) * 0.03;
                num.style.transform = `translateY(${offset}px)`;
            }
        });
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    const run = (name, fn) => {
        try { if (typeof fn === 'function') fn(); }
        catch (e) { console.error('Zinc ' + name + ':', e); }
    };

    run('Slider', initSlider);

    const canvas = document.getElementById('particles-canvas');
    if (canvas) run('Embers', () => new EmberSystem(canvas));

    run('Navbar', initNavbar);
    run('SmoothScroll', initSmoothScroll);
    run('FAQ', initFAQ);
    run('Reveal', initReveal);
    run('Counters', initCounters);
    run('CardTilt', initCardTilt);
    run('StatHover', initStatHover);
    run('ButtonGlow', initButtonGlow);
    run('ParallaxHero', initParallaxHero);
    run('NumberParallax', initNumberParallax);
});