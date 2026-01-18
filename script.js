const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const body = document.querySelector('body');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        body.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Close nav when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            body.classList.remove('nav-active');
            burger.classList.remove('toggle');
            navLinks.forEach((link) => {
               link.style.animation = '';
            });
        });
    });
}

navSlide();