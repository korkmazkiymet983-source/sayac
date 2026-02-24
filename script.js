class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    init() {
        const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(233, 78, 255, ${p.opacity})`;
        this.ctx.fill();
    }
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.12;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(180, 90, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
    update() {
        this.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    p.vx += (dx / dist) * force * 0.02;
                    p.vy += (dy / dist) * force * 0.02;
                }
            }
            p.vx *= 0.999;
            p.vy *= 0.999;
        });
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.drawConnections();
        this.particles.forEach((p) => this.drawParticle(p));
        requestAnimationFrame(() => this.animate());
    }
}
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (navbar) {
                    if (window.scrollY > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    navLinks?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });
}
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach((question) => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach((faq) => {
                faq.classList.remove('active');
            });
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}
function initReveal() {
    // Override CSS: use only opacity, no translateY (prevents layout shift / scroll jumping)
    const style = document.createElement('style');
    style.textContent = '.reveal{opacity:0;transform:none !important;transition:opacity 0.6s ease !important;}.reveal.visible{opacity:1;transform:none !important;}';
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * ease);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
function initCounters() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    animateCounter(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
}
function initTerminal() {
    const lines = document.querySelectorAll('.terminal-line');
    lines.forEach((line, i) => {
        line.style.animationDelay = `${0.3 + i * 0.6}s`;
    });
}

// ========== BASE HUNT SLIDER ==========
function initSlider() {
    const main = document.querySelector('.bh-main');
    if (!main) return;

    const slides = main.querySelectorAll('.bh-slide');
    const prevBtn = document.getElementById('bh-prev');
    const nextBtn = document.getElementById('bh-next');
    const counter = document.getElementById('bh-counter');
    const progress = document.getElementById('bh-progress');
    const thumbsWrap = document.getElementById('bh-thumbs');
    const thumbs = thumbsWrap ? thumbsWrap.querySelectorAll('.bh-thumb') : [];

    let cur = 0;
    const total = slides.length;
    let timer = null;

    function goTo(i) {
        if (i === cur) return;
        slides[cur].classList.remove('active');
        if (thumbs[cur]) thumbs[cur].classList.remove('active');

        cur = ((i % total) + total) % total;

        slides[cur].classList.add('active');
        if (thumbs[cur]) thumbs[cur].classList.add('active');
        if (counter) counter.textContent = (cur + 1) + ' / ' + total;
        // Scroll thumbnail strip horizontally WITHOUT moving the page
        if (thumbs[cur] && thumbsWrap) {
            var thumbLeft = thumbs[cur].offsetLeft - thumbsWrap.offsetLeft;
            var center = thumbLeft - (thumbsWrap.clientWidth / 2) + (thumbs[cur].offsetWidth / 2);
            thumbsWrap.scrollTo({ left: center, behavior: 'smooth' });
        }

        restartProgress();
    }

    function next() { goTo(cur + 1); }
    function prev() { goTo(cur - 1); }

    // Progress bar: 3 saniye
    function restartProgress() {
        if (!progress) return;
        progress.classList.remove('running');
        progress.style.width = '0%';
        void progress.offsetWidth; // reflow
        progress.classList.add('running');
    }

    // Auto-play (3 sn)
    function startAuto() {
        clearInterval(timer);
        timer = setInterval(next, 3000);
        restartProgress();
    }

    // Arrows
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAuto(); });

    // Thumbnail
    thumbs.forEach(function (t) {
        t.addEventListener('click', function () {
            goTo(parseInt(t.dataset.i));
            startAuto();
        });
    });

    // Swipe
    var sx = 0;
    main.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].screenX; }, { passive: true });
    main.addEventListener('touchend', function (e) {
        var d = sx - e.changedTouches[0].screenX;
        if (Math.abs(d) > 50) { d > 0 ? next() : prev(); startAuto(); }
    }, { passive: true });

    // Start
    startAuto();
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    // Disable CSS scroll-behavior:smooth to prevent involuntary scroll snapping
    try {
        document.documentElement.style.scrollBehavior = 'auto';
    } catch (e) { console.error(e); }

    const run = (fn) => {
        try { if (typeof fn === 'function') fn(); }
        catch (e) { console.error('Init error:', e); }
    };

    const canvas = document.getElementById('particles-canvas');
    if (canvas) run(() => new ParticleSystem(canvas));

    run(initNavbar);
    run(initSmoothScroll);
    run(initFAQ);
    run(initReveal);
    run(initCounters);
    run(initTerminal);
    run(initSlider);
});