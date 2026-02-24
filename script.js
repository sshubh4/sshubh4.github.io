document.addEventListener('DOMContentLoaded', async () => {
    // 0. Render PDF resume preview (scaled to fit width, scrollable)
    const pdfContainer = document.getElementById('resume-pdf-container');
    if (pdfContainer) {
        const renderResume = async () => {
            await new Promise(r => setTimeout(r, 100));
            const wrapEl = pdfContainer.closest('.resume-preview-wrap');
            let containerWidth = wrapEl ? (wrapEl.getBoundingClientRect?.().width || wrapEl.offsetWidth || wrapEl.clientWidth) : 0;
            if (!containerWidth) containerWidth = Math.min(700, window.innerWidth - 150);

            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument('resume.pdf').promise;
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1 });
                const scale = (containerWidth / viewport.width) * 0.7;
                const scaledViewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const outputScale = window.devicePixelRatio || 1;

                canvas.width = Math.floor(scaledViewport.width * outputScale);
                canvas.height = Math.floor(scaledViewport.height * outputScale);
                canvas.style.width = Math.floor(scaledViewport.width) + 'px';
                canvas.style.height = Math.floor(scaledViewport.height) + 'px';

                ctx.scale(outputScale, outputScale);
                await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

                pdfContainer.appendChild(canvas);
            }
        };
        try {
            await renderResume();
        } catch (err) {
            pdfContainer.innerHTML = '<p class="resume-fallback">Unable to load resume. <a href="resume.pdf" target="_blank">Download resume</a></p>';
        }
    }

    // 0b. Certificates section: render cards, carousel, modal
    const certRow = document.getElementById('certificates-row');
    const certModal = document.getElementById('cert-modal');
    const certModalPdf = document.getElementById('cert-modal-pdf');
    const certModalClose = certModal?.querySelector('.cert-modal-close');
    const certModalOverlay = certModal?.querySelector('.cert-modal-overlay');

    if (typeof CERTIFICATES !== 'undefined' && certRow) {
        const DOWNLOAD_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>';

        async function renderCertThumb(card, cert) {
            const thumbEl = card.querySelector('.certificate-card-thumb');
            if (cert.thumbnailUrl) {
                const img = document.createElement('img');
                img.src = cert.thumbnailUrl;
                img.alt = cert.title;
                img.onerror = () => { thumbEl.innerHTML = '<span class="certificate-card-thumb-icon">📄</span>'; };
                thumbEl.appendChild(img);
            } else if (typeof pdfjsLib !== 'undefined' && cert.pdfUrl) {
                try {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    const pdf = await pdfjsLib.getDocument(cert.pdfUrl).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    thumbEl.appendChild(canvas);
                } catch {
                    thumbEl.innerHTML = '<span class="certificate-card-thumb-icon">📄</span>';
                }
            } else {
                thumbEl.innerHTML = '<span class="certificate-card-thumb-icon">📄</span>';
            }
        }

        function openCertModal(pdfUrl) {
            if (!certModal || !certModalPdf) return;
            certModalPdf.src = pdfUrl + '#view=FitH';
            certModal.hidden = false;
            certModalClose?.focus();
            document.body.style.overflow = 'hidden';
            const prevFocus = document.activeElement;
            certModal.dataset.prevFocus = prevFocus?.id || '';
            if (prevFocus && !prevFocus.id) prevFocus.id = 'cert-prev-focus-temp';
        }

        function closeCertModal() {
            if (!certModal) return;
            certModal.hidden = true;
            certModalPdf.src = '';
            document.body.style.overflow = '';
            const prevId = certModal.dataset.prevFocus || 'cert-prev-focus-temp';
            const prev = document.getElementById(prevId);
            if (prev) prev.focus();
            if (prevId === 'cert-prev-focus-temp' && prev) prev.removeAttribute('id');
        }

        function initCertModalFocusTrap() {
            const focusables = certModal?.querySelectorAll('button, [href], iframe');
            certModal?.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab' || certModal.hidden) return;
                const els = [...(certModal.querySelectorAll('button, [href]'))];
                const first = els[0], last = els[els.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { last?.focus(); e.preventDefault(); }
                } else {
                    if (document.activeElement === last) { first?.focus(); e.preventDefault(); }
                }
            });
        }

        CERTIFICATES.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'certificate-card';
            card.setAttribute('role', 'listitem');
            card.dataset.pdfUrl = cert.pdfUrl;
            card.innerHTML = `
                <div class="certificate-card-thumb"></div>
                <a href="${cert.pdfUrl}" download class="certificate-card-download" aria-label="Download ${cert.title}" title="Download" onclick="event.stopPropagation()">${DOWNLOAD_ICON}</a>
                <div class="certificate-card-body">
                    <h3 class="certificate-card-title">${cert.title}</h3>
                    ${(cert.issuer || cert.date) ? `<p class="certificate-card-meta">${[cert.issuer, cert.date].filter(Boolean).join(' • ')}</p>` : ''}
                </div>`;
            card.addEventListener('click', (e) => {
                if (e.target.closest('.certificate-card-download')) return;
                openCertModal(cert.pdfUrl);
            });
            certRow.appendChild(card);
            renderCertThumb(card, cert);
        });

        const chevronLeft = document.querySelector('.cert-chevron--left');
        const chevronRight = document.querySelector('.cert-chevron--right');
        if (chevronLeft && chevronRight && certRow) {
            const scrollAmount = () => certRow.clientWidth * 0.75;
            chevronLeft.addEventListener('click', () => { certRow.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }); });
            chevronRight.addEventListener('click', () => { certRow.scrollBy({ left: scrollAmount(), behavior: 'smooth' }); });
        }


        certModalClose?.addEventListener('click', closeCertModal);
        certModalOverlay?.addEventListener('click', closeCertModal);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && certModal && !certModal.hidden) closeCertModal(); });
        initCertModalFocusTrap();
    }

    // 1. Smooth Scroll for vert-nav and other anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Scroll Spy for vertical nav tabs (HOME, EXPERIENCE, PROJECTS)
    const vertTabs = document.querySelectorAll('.vert-tab');
    const sections = [
        { id: 'home', element: document.getElementById('home') },
        { id: 'skills', element: document.getElementById('skills') },
        { id: 'resume', element: document.getElementById('resume') },
        { id: 'experience', element: document.getElementById('experience') },
        { id: 'projects', element: document.getElementById('projects') },
        { id: 'certificates', element: document.getElementById('certificates') }
    ].filter(s => s.element);

    function updateActiveTab() {
        const scrollY = window.scrollY;
        let currentId = 'home';

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const top = section.element.offsetTop;
            const height = section.element.offsetHeight;
            if (scrollY >= top - height / 3) {
                currentId = section.id;
                break;
            }
        }

        vertTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('href') === '#' + currentId) {
                tab.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveTab);
    updateActiveTab();

    // Profile photo preview modal (when nav profile icon is shown)
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = profileModal?.querySelector('.profile-modal-close');
    const profileModalOverlay = profileModal?.querySelector('.profile-modal-overlay');

    function openProfileModal() {
        if (profileModal) {
            profileModal.hidden = false;
        }
    }

    function closeProfileModal() {
        if (profileModal) {
            profileModal.hidden = true;
        }
    }

    if (navProfileBtn) {
        navProfileBtn.addEventListener('click', openProfileModal);
    }
    if (profileModalClose) {
        profileModalClose.addEventListener('click', closeProfileModal);
    }
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', closeProfileModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal && !profileModal.hidden) {
            closeProfileModal();
        }
    });
});
