document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Smooth Scroll Handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 60, // -60px for visual breathing room
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Scroll Spy (Highlights the Right-Side Buttons)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-pill');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Trigger when 1/3rd of the section is visible
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active-link');
            }
        });
    });
});