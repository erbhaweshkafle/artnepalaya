/*
 * ArtNepalaya Frontend Logic (v15 - FINAL)
 *
 * This version matches the "v15" code.gs.
 * - loadContent() uses res.json().
 * - submitForm() NOW ALSO uses res.json() (no more text/parse).
 * - This is the final, correct, and simplest logic.
 */

// ===============================
// CONFIGURATION
// ===============================
//
// !!! IMPORTANT !!!
// You MUST paste your NEW deployment URL here
// (after re-deploying the new code.gs file)
//
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqaOlkRQEQ3PhWcAwoKHMMJWcxGcGva57l5KzjrSGFQoYBkTIoprRoTt6lumkuzWd4/exec';

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initFormLogic();
    initScrollAnimations();
    initFab(); // Initialize the new floating button
    // Particles are initialized *after* content loads
});

// ===============================
// 1. CONTENT LOADING
// ===============================

function loadContent() {
    const loader = document.getElementById('loader-container');
    const contentWrapper = document.getElementById('content-wrapper');
    
    // Check if URL has been replaced
    if (APPS_SCRIPT_URL === 'PASTE_YOUR_NEW_DEPLOYMENT_URL_HERE') {
        console.error('ERROR: APPS_SCRIPT_URL has not been set in script.js.');
        const loaderText = loader.querySelector('p');
        if (loaderText) {
            loaderText.textContent = 'Configuration Error: App URL is missing.';
            loaderText.style.color = 'var(--color-primary-red)';
        }
        return; // Stop execution
    }

    fetch(`${APPS_SCRIPT_URL}?action=getContent`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            // --- FINAL FIX ---
            // We use res.json() because doGet uses ContentService
            return res.json(); 
        })
        .then(data => {
            if (data.status === 'success') {
                populateContent(data.content);
                // Hide loader and show content
                loader.style.display = 'none';
                contentWrapper.style.display = 'block';
                // NOW initialize particles, after content is loaded
                initParticles(); 
            } else {
                throw new Error(data.message || 'Failed to parse content.');
            }
        })
        .catch(error => {
            console.error('Failed to load site content.', error);
            const loaderText = loader.querySelector('p');
            if (loaderText) {
                loaderText.textContent = `Failed to load site content. Error: ${error.message}`;
                loaderText.style.color = 'var(--color-primary-red)';
            }
        });
}

/**
 * Populates the HTML with the fetched content.
 */
function populateContent(content) {
    // Helper to safely parse JSON from the sheet
    const parseJson = (jsonString) => {
        if (typeof jsonString === 'string') {
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse JSON string:", jsonString, e);
                return []; // Return empty array on failure
            }
        }
        return Array.isArray(jsonString) ? jsonString : []; // Return as-is if already array
    };
    
    // 0. Apply dynamic colors
    let colors = {};
     if (typeof content.colorTheme === 'string') {
        try {
            colors = JSON.parse(content.colorTheme);
        } catch (e) {
            console.error("Could not parse colorTheme JSON: ", e);
            colors = {}; // Use defaults
        }
    } else {
        colors = content.colorTheme || {};
    }
    applyColors(colors); // Pass the inner color object

    // 1. Hero Section
    setElementText('hero-title', content.heroTitle);
    setElementText('hero-subtitle', content.heroSubtitle);
    setElementText('hero-cta', content.heroCtaText);

    // 2. Social Links (and FAB)
    const socialNav = document.getElementById('social-links-nav');
    const footerSocial = document.getElementById('footer-social-links');
    const fabFlyout = document.getElementById('fab-flyout'); // NEW FAB Menu
    
    if (content.socialLinks) {
        let socialLinks = parseJson(content.socialLinks);
        
        // Build header links
        const headerLinksHtml = socialLinks.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}" class="social-icon">
                <i class="icon-${link.name.toLowerCase()}"></i>
            </a>
        `).join('');
        if (socialNav) socialNav.innerHTML = headerLinksHtml;
        if (footerSocial) footerSocial.innerHTML = headerLinksHtml;

        // Build FAB links (add WhatsApp)
        let fabLinksHtml = socialLinks.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}" class="social-icon-fab">
                <i class="icon-${link.name.toLowerCase()}"></i>
            </a>
        `).join('');

        // Add WhatsApp
        if (content.whatsappNumber) {
            // Format number to remove +
            const whatsAppNum = String(content.whatsappNumber).replace(/[^0-9]/g, '');
            fabLinksHtml += `
            <a href="https://wa.me/${whatsAppNum}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="social-icon-fab">
                <i class="icon-whatsapp"></i>
            </a>`;
        }
        
        if (fabFlyout) fabFlyout.innerHTML = fabLinksHtml;

        // Find the "Instagram" link for the final CTA button
        const instaLink = socialLinks.find(link => link.name.toLowerCase() === 'instagram');
        const finalCtaBtn = document.getElementById('final-cta-btn');
        if (finalCtaBtn && instaLink) {
            finalCtaBtn.href = instaLink.url;
        }
    }

    // 3. Pain Points
    setElementText('pain-points-title', content.painPointsTitle);
    setElementText('pain-point1-title', content.painPoint1Title);
    setElementText('pain-point1-text', content.painPoint1Text);
    setElementText('pain-point2-title', content.painPoint2Title);
    setElementText('pain-point2-text', content.painPoint2Text);
    setElementText('pain-point3-title', content.painPoint3Title);
    setElementText('pain-point3-text', content.painPoint3Text);

    // 4. "How It Works" Section
    setElementText('how-it-works-title', content.howItWorksTitle);
    setElementText('how-it-works-step1-title', content.howItWorksStep1Title);
    setElementText('how-it-works-step1-text', content.howItWorksStep1Text);
    setElementText('how-it-works-step2-title', content.howItWorksStep2Title);
    setElementText('how-it-works-step2-text', content.howItWorksStep2Text);
    setElementText('how-it-works-step3-title', content.howItWorksStep3Title);
    setElementText('how-it-works-step3-text', content.howItWorksStep3Text);
    
    // 5. "Who Is It For" Section
    setElementText('who-is-it-for-title', content.whoIsItForTitle);
    setElementText('persona-creator-title', content.personaCreatorTitle);
    setElementText('persona-creator-text', content.personaCreatorText);
    setElementText('persona-business-title', content.personaBusinessTitle);
    setElementText('persona-business-text', content.personaBusinessText);
    setElementText('persona-enthusiast-title', content.personaEnthusiastTitle);
    setElementText('persona-enthusiast-text', content.personaEnthusiastText);

    // 6. "Why Join?" (Benefits) Section
    setElementText('why-join-title', content.whyJoinTitle);
    setElementText('why-join-benefit1-title', content.whyJoinBenefit1Title);
    setElementText('why-join-benefit1-text', content.whyJoinBenefit1Text);
    setElementText('why-join-benefit2-title', content.whyJoinBenefit2Title);
    setElementText('why-join-benefit2-text', content.whyJoinBenefit2Text);
    setElementText('why-join-benefit3-title', content.whyJoinBenefit3Title);
    setElementText('why-join-benefit3-text', content.whyJoinBenefit3Text);

    // 7. Partners Section
    setElementText('partners-title', content.partnersTitle);
    const partnersGrid = document.getElementById('partners-logo-grid');
    if (partnersGrid && content.partnersLogos) {
        let partners = parseJson(content.partnersLogos);
        partnersGrid.innerHTML = partners.map(partner => `
            <div class="logo-item" title="${partner.name}">
                <img src="${partner.logoUrl}" alt="${partner.name} Logo">
            </div>
        `).join('');
    }

    // 8. Mission/About Section
    setElementText('about-title', content.aboutTitle);
    setElementText('about-text', content.aboutText);
    setElementText('about-cta', content.aboutCtaText);

    // 9. Survey Form Section
    setElementText('form-title', content.formTitle);
    setElementText('form-subtitle', content.formSubtitle);

    // 10. Final CTA
    setElementText('final-cta-title', content.finalCtaTitle);
    setElementText('final-cta-subtitle', content.finalCtaSubtitle);
    setElementText('final-cta-btn', content.finalCtaButtonText);
    
    // 11. Footer
    setElementText('footer-text', content.footerText);
}

/**
 * Helper to set text content of an element by ID.
 */
function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text || '';
    }
}

/**
* Applies dynamic colors from the sheet to the :root.
*/
function applyColors(colors) {
    const root = document.documentElement;
    const colorMap = {
        'colorPrimaryBlue': colors.primaryBlue,
        'colorPrimaryRed': colors.primaryRed,
        'colorPrimaryOrange': colors.primaryOrange,
        'colorPrimaryYellow': colors.primaryYellow,
        'colorPrimaryGreen': colors.primaryGreen,
        'colorBgParchment': colors.bgParchment,
        'colorBgWhite': colors.bgWhite,
        'colorTextSlate': colors.textSlate,
        'colorTextMuted': colors.textMuted,
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (value) {
            // Converts 'colorPrimaryBlue' to '--color-primary-blue'
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        }
    }

    // Set derived semantic colors
    root.style.setProperty('--color-background', colors.bgParchment || '#F5F1E8');
    root.style.setProperty('--color-surface', colors.bgWhite || '#FFFFFF');
    root.style.setProperty('--color-text-primary', colors.textSlate || '#333333');
    root.style.setProperty('--color-text-secondary', colors.textMuted || '#555555');
    root.style.setProperty('--color-accent', colors.primaryOrange || '#F58220');
    root.style.setProperty('--color-border', '#e0e0e0');
    root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.08)');
}


// ===============================
// 2. FORM & SURVEY LOGIC
// ===============================

let selectedPersona = 'creator'; // Default
let currentStep = 1;

function initFormLogic() {
    const surveyForm = document.getElementById('survey-form');
    if (!surveyForm) return; // Stop if form doesn't exist

    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const submitBtn = document.getElementById('btn-submit');
    const personaToggles = document.querySelectorAll('.btn-toggle');
    const formSteps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('form-progress-bar');
    const totalSteps = formSteps.length;

    // --- Persona Toggle Logic ---
    personaToggles.forEach(button => {
        button.addEventListener('click', () => {
            selectedPersona = button.dataset.persona;
            personaToggles.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (currentStep === 2) {
                updatePersonaQuestions();
            }
        });
    });

    // --- Navigation Logic ---
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    }

    // --- Form Submission ---
    surveyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            submitForm(surveyForm, submitBtn);
        }
    });

    // --- Helper Functions ---
    function goToStep(stepNumber) {
        currentStep = stepNumber;
        formSteps.forEach(step => step.classList.remove('active'));
        const newStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (newStep) newStep.classList.add('active');
        
        if (currentStep === 2) {
            updatePersonaQuestions();
        }
        
        if (prevBtn) prevBtn.style.display = (currentStep === 1) ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = (currentStep === totalSteps) ? 'none' : 'inline-block';
        if (submitBtn) submitBtn.style.display = (currentStep === totalSteps) ? 'inline-block' : 'none';
        
        if (progressBar) {
            const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    }

    function updatePersonaQuestions() {
        document.querySelectorAll('.persona-questions').forEach(block => {
            if (block.dataset.personaQuestions === selectedPersona) {
                block.classList.add('active');
            } else {
                block.classList.remove('active');
            }
        });
    }

    // Initialize the form to step 1
    goToStep(1);
}

/**
 * Validates the current step's required fields.
 */
function validateStep(stepNumber) {
    const currentStepEl = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!currentStepEl) return false;

    let isValid = true;
    const requiredInputs = currentStepEl.querySelectorAll('[required], [data-required="true"]');
    
    requiredInputs.forEach(input => {
        const parentQuestions = input.closest('.persona-questions');
        if (parentQuestions && !parentQuestions.classList.contains('active')) {
            return; // Don't validate hidden
        }
        
        if (input.value.trim() === '') {
            isValid = false;
            input.classList.add('input-error');
        } else {
            input.classList.remove('input-error');
        }
    });

    if (!isValid) {
        showMessage('Please fill out all required fields (*).', 'error');
    }
    return isValid;
}


/**
 * Submits the form data to the Google Apps Script.
 */
function submitForm(form, submitBtn) {
    const formData = new FormData(form);
    const data = {};
    
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    data.name = formData.get('name');
    data.email = formData.get('email');
    data.environment = formData.get('environment');
    data.message = formData.get('message');
    data.persona = selectedPersona; 

    if (data.persona === 'creator') {
        data.creator_experience = formData.get('creator_experience');
        data.creator_income = formData.get('creator_income');
        data.creator_challenges = formData.getAll('creator_challenges');
    } else if (data.persona === 'business') {
        data.business_type = formData.get('business_type');
        data.business_reach = formData.get('business_reach');
        data.business_goals = formData.getAll('business_goals');
    } else if (data.persona === 'enthusiast') {
        data.enthusiast_interest = formData.getAll('enthusiast_interest');
        data.enthusiast_motivation = formData.get('enthusiast_motivation');
    }

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        // --- FINAL FIX (v15) ---
        // We MUST use res.json() because doPost now uses ContentService
        return res.json(); 
    })
    .then(responseData => {
        // Check for the response status from our script
        if (responseData.status === 'success') {
            showMessage('✅ Thank you! Your survey has been submitted.', 'success');
            form.style.display = 'none';
            const progressBar = document.getElementById('form-progress');
            if(progressBar) progressBar.style.display = 'none';
            setElementText('form-title', "Thank You!");
            setElementText('form-subtitle', "Your voice has been heard. Follow us on social media to stay connected!");
        } else {
            throw new Error(responseData.message || 'An unknown error occurred.');
        }
    })
    .catch(error => {
        console.error('Submission failed:', error);
        showMessage(`Submission failed: ${error.message}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
}

// ===============================
// 3. UI HELPERS (Message Box)
// ===============================

function showMessage(message, type = 'info') {
    const msgBox = document.getElementById('message-box');
    const msgText = document.getElementById('message-text');
    const msgClose = document.getElementById('message-close-btn');

    if (!msgBox || !msgText || !msgClose) return; // Fail gracefully

    msgText.textContent = message;
    msgBox.className = type; // 'success' or 'error'
    msgBox.classList.add('show');

    msgClose.onclick = () => msgBox.classList.remove('show');

    setTimeout(() => {
        msgBox.classList.remove('show');
    }, 5000);
}

// ===============================
// 4. SCROLL ANIMATIONS
// ===============================

function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.scroll-fade');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));
}


// ===============================
// 5. PARTICLE JS HERO
// ===============================

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const particleCount = 70;
    const heroElement = canvas.parentElement; // The #hero section

    function resizeCanvas() {
        if (!heroElement) return;
        canvas.width = heroElement.clientWidth;
        canvas.height = heroElement.clientHeight;
        init();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            // NEW Particle Color for Light Theme
            let particleColor = getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-text-slate') || '#333333';
            particleColor = particleColor.trim();
            let r=0, g=0, b=0;
            if(particleColor.length === 7) {
                r = parseInt(particleColor.substring(1, 3), 16);
                g = parseInt(particleColor.substring(3, 5), 16);
                b = parseInt(particleColor.substring(5, 7), 16);
            } else if (particleColor.length === 4) {
                r = parseInt(particleColor.substring(1, 2) + particleColor.substring(1, 2), 16);
                g = parseInt(particleColor.substring(2, 3) + particleColor.substring(2, 3), 16);
                b = parseInt(particleColor.substring(3, 4) + particleColor.substring(3, 4), 16);
            }
            this.color = `rgba(${r}, ${g}, ${b}, 0.3)`; // Muted dark particles
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        if (canvas.width === 0 || canvas.height === 0) return;
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    setTimeout(() => {
        resizeCanvas();
        animate();
    }, 100); 
}

// ===============================
// 6. FLOATING ACTION BUTTON (FAB)
// ===============================
function initFab() {
    const fabContainer = document.getElementById('fab-container');
    const fabMainBtn = document.getElementById('fab-main-btn');

    if (fabMainBtn) {
        fabMainBtn.addEventListener('click', () => {
            fabContainer.classList.toggle('active');
        });
    }

    // Optional: Close FAB if user clicks outside of it
    document.addEventListener('click', (e) => {
        if (fabContainer && !fabContainer.contains(e.target) && fabContainer.classList.contains('active')) {
            fabContainer.classList.remove('active');
        }
    });
}
