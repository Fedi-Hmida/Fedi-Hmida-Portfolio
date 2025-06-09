// Enhanced Particles.js configuration
particlesJS('particles-js', {
    particles: {
        number: {
            value: 100,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: ['#fe3e57', '#ff8c2f', '#54faae', '#39c4ff']
        },
        shape: {
            type: ['circle', 'triangle'],
            stroke: {
                width: 0,
                color: '#000000'
            }
        },
        opacity: {
            value: 0.6,
            random: true,
            animation: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 4,
            random: true,
            animation: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'repulse'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            repulse: {
                distance: 100,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

// Enhanced Typed.js configuration
new Typed('#typing-text', {
    strings: ['Software Engineering Student'],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|',
    autoInsertCss: true
});

// Initialize GSAP with enhanced configurations
gsap.registerPlugin(ScrollTrigger);

// Sequential heading animations
gsap.utils.toArray('h2').forEach((heading, i) => {
    gsap.from(heading, {
        scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.45,
        delay: i * 0.02,
        ease: 'power3.out'
    });
});

// Enhanced skill item animations
gsap.utils.toArray('.skill-item').forEach((skill, i) => {
    gsap.from(skill, {
        scrollTrigger: {
            trigger: skill,
            start: 'top 80%'
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power2.out'
    });
});

// Enhanced portfolio item animations
gsap.utils.toArray('.portfolio-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 80%'
        },
        y: 100,
        opacity: 0,
        duration: 1,
        delay: i * 0.2,
        ease: 'power3.out'
    });
});

// Add enhanced animations to elements
document.querySelectorAll('.fas, .fab').forEach(icon => {
    icon.classList.add('icon-float');
});

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.add('enhanced-btn');
});

document.querySelectorAll('.skill-item').forEach(item => {
    item.classList.add('card-hover');
});

document.querySelectorAll('h2').forEach(heading => {
    heading.classList.add('glow-text');
});

// Enhanced smooth scroll with offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Enhanced progress bar animation with intersection observer
const progressBars = document.querySelectorAll('.progress-bar');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target.getAttribute('data-progress');
            gsap.to(entry.target, {
                width: progress + '%',
                duration: 1.5,
                ease: 'power2.out'
            });
        }
    });
}, { 
    threshold: 0.5,
    rootMargin: '0px'
});

progressBars.forEach(bar => observer.observe(bar));

// Add fade-up animation to elements
const fadeElements = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px'
});

fadeElements.forEach(element => fadeObserver.observe(element));

// Add gradient background to sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('gradient-bg');
});

// Add underline animation to navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.classList.add('underline-animation');
}); 