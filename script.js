// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 26, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 26, 0.95)';
    }
});

// Load development updates from JSON
document.addEventListener('DOMContentLoaded', () => {
    loadDevelopmentUpdates();
});

async function loadDevelopmentUpdates() {
    try {
        const response = await fetch('data/dev-updates.json');
        if (!response.ok) {
            throw new Error('Failed to load development updates.');
        }

        const updates = await response.json();
        displayDevelopmentUpdates(updates);
    } catch (error) {
        console.error('Error loading development updates:', error);
        const timeline = document.getElementById('updates-timeline');
        timeline.innerHTML = '<div class="error-message"><p>Failed to load development updates.</p></div>';
    }
}

function displayDevelopmentUpdates(updates) {
    const timeline = document.getElementById('updates-timeline');
    // Clear loading spinner
    timeline.innerHTML = '';

    // Create elements for each update
    updates.forEach(update => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        const timelineContent = document.createElement('div');
        timelineContent.className = 'timeline-content';

        // Add title
        const title = document.createElement('h3');
        title.textContent = update.title;
        timelineContent.appendChild(title);

        // Add date
        const date = document.createElement('p');
        date.className = 'timeline-date';
        date.textContent = update.date;
        timelineContent.appendChild(date);

        // Add tags if available
        if (update.tags && update.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'timeline-tags';

            update.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });

            timelineContent.appendChild(tagsContainer);
        }

        // Add description
        const desc = document.createElement('p');
        desc.textContent = update.description;
        timelineContent.appendChild(desc);

        // Add bullet points if available
        if (update.bulletPoints && update.bulletPoints.length > 0) {
            const bulletList = document.createElement('ul');
            update.bulletPoints.forEach(point => {
                const listItem = document.createElement('li');
                listItem.textContent = point;
                bulletList.appendChild(listItem);
            });
            timelineContent.appendChild(bulletList);
        }

        // Add images if available
        if (update.images && update.images.length > 0) {
            const imagesContainer = document.createElement('div');

            // Single image with custom size
            if (update.images.length === 1) {
                imagesContainer.className = 'timeline-single-image';
                const img = document.createElement('img');
                img.src = update.images[0].url;
                img.alt = update.images[0].alt || 'Update image';

                // Apply custom size if provided
                if (update.images[0].width) {
                    img.style.width = update.images[0].width;
                }
                if (update.images[0].height) {
                    img.style.height = update.images[0].height;
                }

                imagesContainer.appendChild(img);
            }
            // Multiple images in grid layout
            else if (update.images.length > 1) {
                imagesContainer.className = 'timeline-image-grid';
                // Add class based on number of images (helps with CSS grid)
                imagesContainer.classList.add(`grid-${Math.min(4, update.images.length)}`);

                update.images.forEach(imageData => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.className = 'grid-image';

                    const img = document.createElement('img');
                    img.src = imageData.url;
                    img.alt = imageData.alt || 'Update image';

                    // Add click handler to open in lightbox/modal
                    img.addEventListener('click', () => {
                        openImageModal(imageData.url);
                    });

                    imgWrapper.appendChild(img);
                    imagesContainer.appendChild(imgWrapper);
                });
            }

            timelineContent.appendChild(imagesContainer);
        }

        // Add code snippets if available
        if (update.codeSnippets && update.codeSnippets.length > 0) {
            update.codeSnippets.forEach(snippet => {
                const codeContainer = document.createElement('div');
                codeContainer.className = 'timeline-code';

                // Add language label if provided
                if (snippet.language) {
                    const langLabel = document.createElement('div');
                    langLabel.className = 'code-language';
                    langLabel.textContent = snippet.language;
                    codeContainer.appendChild(langLabel);
                }

                // Code content
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                if (snippet.language) {
                    code.className = `language-${snippet.language}`;
                }
                code.textContent = snippet.code;
                pre.appendChild(code);
                codeContainer.appendChild(pre);

                // Copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.title = 'Copy code';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(snippet.code);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
                codeContainer.appendChild(copyBtn);

                timelineContent.appendChild(codeContainer);
            });
        }

        // Add video links if available
        if (update.videoLinks && update.videoLinks.length > 0) {
            const videosContainer = document.createElement('div');
            videosContainer.className = 'timeline-videos';

            update.videoLinks.forEach(video => {
                // Create iframe or link based on type
                if (video.embed) {
                    const iframe = document.createElement('iframe');
                    iframe.src = video.url;
                    iframe.width = video.width || '100%';
                    iframe.height = video.height || '315';
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    videosContainer.appendChild(iframe);
                } else {
                    const videoLink = document.createElement('a');
                    videoLink.href = video.url;
                    videoLink.className = 'video-link';
                    videoLink.target = '_blank';
                    videoLink.rel = 'noopener';
                    videoLink.innerHTML = `<i class="fas fa-play-circle"></i> ${video.title || 'Watch video'}`;
                    videosContainer.appendChild(videoLink);
                }
            });

            timelineContent.appendChild(videosContainer);
        }

        // Add polls if available
        if (update.poll) {
            const pollContainer = document.createElement('div');
            pollContainer.className = 'timeline-poll';

            // Poll question
            const pollQuestion = document.createElement('h4');
            pollQuestion.className = 'poll-question';
            pollQuestion.textContent = update.poll.question;
            pollContainer.appendChild(pollQuestion);

            // Poll options
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'poll-options';

            update.poll.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.className = 'poll-option';
                optionButton.textContent = option;
                optionButton.addEventListener('click', () => {
                    alert(`Poll voting would be implemented with a backend. You selected: ${option}`);
                });
                optionsContainer.appendChild(optionButton);
            });

            pollContainer.appendChild(optionsContainer);
            timelineContent.appendChild(pollContainer);
        }

        // Add additional links if available
        if (update.links && update.links.length > 0) {
            const linksContainer = document.createElement('div');
            linksContainer.className = 'timeline-links';

            update.links.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.className = 'timeline-link';
                linkElement.target = '_blank';
                linkElement.rel = 'noopener';

                // Add icon if specified
                if (link.icon) {
                    linkElement.innerHTML = `<i class="fas fa-${link.icon}"></i> `;
                }
                linkElement.innerHTML += link.text;

                linksContainer.appendChild(linkElement);
            });

            timelineContent.appendChild(linksContainer);
        }

        timelineItem.appendChild(timelineContent);
        timeline.appendChild(timelineItem);
    });
}

// Function to open image in modal
function openImageModal(src) {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');

    modal.style.display = 'block';
    modalImg.src = src;
    document.body.style.overflow = 'hidden';
}

// Gallery Modal Functionality
const modal = document.getElementById('gallery-modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.querySelector('.modal-close');

let currentImageIndex = 0;
const galleryImages = [
    'img/gameplay1-1080x1920.png',
    'img/gameplay2-1080x1920.png',
    'img/gameplay3-1080x1920.png',
    'img/gameplay4-1080x1920.png'
];

// Open modal when gallery item is clicked
document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.addEventListener('click', () => {
        modal.style.display = 'block';
        currentImageIndex = index;
        modalImg.src = galleryImages[currentImageIndex];
        document.body.style.overflow = 'hidden';
    });
});

// Close modal
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Navigate between images
function changeImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    }
    
    modalImg.src = galleryImages[currentImageIndex];
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeImage(1);
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add fade-in animation to elements
document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const elementsToAnimate = document.querySelectorAll(
        '.hero-content, .about-content, .gallery-item, .timeline-item, .support-content'
    );
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    // If image is already loaded
    if (img.complete) {
        img.style.opacity = '1';
    } else {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    }
});

// Preload gallery images for smoother experience
function preloadImages() {
    galleryImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading when page loads
window.addEventListener('load', preloadImages);

// Add particle effect to hero section (optional enhancement)
function createParticle() {
    const hero = document.querySelector('.hero');
    const particle = document.createElement('div');
    
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 3 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(99, 102, 241, 0.3)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.pointerEvents = 'none';
    particle.style.animation = 'float 15s infinite linear';
    
    hero.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            opacity: 0;
            transform: translateY(100vh) scale(0);
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: translateY(-100vh) scale(1);
        }
    }
`;
document.head.appendChild(style);

// Create particles periodically
setInterval(createParticle, 3000);

// Add subtle parallax effect to hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');
    
    if (heroImage && scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Add typing effect to hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    }
});

// Add smooth reveal animation for timeline items
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.timeline-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-50px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
    timelineObserver.observe(item);
});