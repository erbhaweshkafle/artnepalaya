/*
 * ArtNepalaya Frontend Logic (v9 - HTML Mismatch Fix)
 *
 * This version fixes the JavaScript to match the new HTML structure (v9).
 * - Rewritten initFormLogic() to use "btn-next", "btn-prev", "btn-submit".
 * - Rewritten persona selection to use ".btn-toggle".
 * - Fixed "entry.Targe" typo again.
 * - Kept the "Hybrid CORS" fix (res.json() for GET, res.text() for POST).
 */

// ===============================
// CONFIGURATION
// ===============================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzKx2lP66Cmy0aLYkJlJkUfYzQcCt1K0NPs3rJ6ppr8_SJUhLTYEFuky42uENaxuVE/exec';

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initFormLogic();
    initScrollAnimations();
    // initParticles(); // Removing particle init to simplify debugging. Let's get the form working first.
});

// ===============================
// 1. CONTENT LOADING
// ===============================

function loadContent() {
    const loader = document.getElementById('loader-container');
    const contentWrapper = document.getElementById('content-wrapper');
    
    fetch(`${APPS_SCRIPT_URL}?action=getContent`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            // --- HYBRID FIX (Correct) ---
            // We MUST use res.json() because doGet uses ContentService
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
    let colors = parseJson(content.colorTheme);
    if (!Array.isArray(colors) && typeof colors === 'object') {
         applyColors(colors);
    } else if (Array.isArray(colors) && colors.length > 0) {
        applyColors(colors[0]); // Handle if it was parsed as array
    } else if (typeof content.colorTheme === 'object') {
        applyColors(content.colorTheme); // Handle if it's already an object
    }

    // 1. Hero Section
    setElementText('hero-title', content.heroTitle);
    setElementText('hero-subtitle', content.heroSubtitle);
    setElementText('hero-cta', content.heroCtaText);

    // 2. Social Links
    const socialNav = document.getElementById('social-links-nav');
    const footerSocial = document.getElementById('footer-social-links');
    if (socialNav && content.socialLinks) {
        let socialLinks = parseJson(content.socialLinks);
        
        const linksHtml = socialLinks.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}" class="social-icon">
                <i class="icon-${link.name.toLowerCase()}"></i>
            </a>
        `).join('');
        
        socialNav.innerHTML = linksHtml;
        if(footerSocial) {
            footerSocial.innerHTML = linksHtml; // Also populate footer social
        }

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
        'colorBgDark': colors.bgDark,
        'colorBgDarkSurface': colors.bgDarkSurface,
        'colorTextLight': colors.textLight,
        'colorTextLightSecondary': colors.textLightSecondary,
        'colorBgWhite': colors.bgWhite,
        'colorTextSlate': colors.textSlate,
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (value) {
            // Converts 'colorPrimaryBlue' to '--color-primary-blue'
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        }
    }

    // Set derived semantic colors
    root.style.setProperty('--color-background', colors.bgDark || '#1a1a2e');
    root.style.setProperty('--color-surface', colors.bgDarkSurface || '#2a2a4c');
    root.style.setProperty('--color-text-primary', colors.textLight || '#F0F0F0');
    root.style.setProperty('--color-text-secondary', colors.textLightSecondary || '#b0b0d0');
    root.style.setProperty('--color-accent', colors.primaryYellow || '#FDB813');
    root.style.setProperty('--color-border', colors.bgDarkSurface || '#2a2a4c');
}


// ===============================
// 2. FORM & SURVEY LOGIC (REWRITTEN)
// ===============================

let selectedPersona = 'creator'; // Default
let currentStep = 1;

function initFormLogic() {
    const surveyForm = document.getElementById('survey-form');
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
            // Get new persona
            selectedPersona = button.dataset.persona;
            
            // Update button UI
            personaToggles.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            // Show/Hide question blocks (only if on step 2)
            if (currentStep === 2) {
                updatePersonaQuestions();
            }
        });
    });

    // --- Navigation Logic ---
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    });

    prevBtn.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

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
        
        // Hide all steps
        formSteps.forEach(step => step.classList.remove('active'));
        
        // Show the new active step
        const newStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (newStep) {
            newStep.classList.add('active');
        }
        
        // If we're on step 2, show the right persona questions
        if (currentStep === 2) {
            updatePersonaQuestions();
        }
        
        // Update button visibility
        prevBtn.style.display = (currentStep === 1) ? 'none' : 'inline-block';
        nextBtn.style.display = (currentStep === totalSteps) ? 'none' : 'inline-block';
        submitBtn.style.display = (currentStep === totalSteps) ? 'inline-block' : 'none';
        
        // Update progress bar
        const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercent}%`;
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
    // Find all required inputs *within the current step*
    const requiredInputs = currentStepEl.querySelectorAll('[required], [data-required="true"]');
    
    requiredInputs.forEach(input => {
        // Special check for persona-specific questions
        const parentQuestions = input.closest('.persona-questions');
        if (parentQuestions && !parentQuestions.classList.contains('active')) {
            return; // Don't validate hidden persona questions
        }

        if (input.type === 'checkbox' || input.type === 'radio') {
             // Logic for checkbox/radio groups
        } else {
            if (input.value.trim() === '') {
                isValid = false;
                input.classList.add('input-error');
            } else {
                input.classList.remove('input-error');
            }
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

    // 1. Basic Fields (from Step 1 and 3)
    data.name = formData.get('name');
    data.email = formData.get('email');
    data.environment = formData.get('environment');
    data.message = formData.get('message');
    
    // 2. Add the selected persona
    data.persona = selectedPersona; // Get from the module-level variable

    // 3. Persona-Specific Fields (from Step 2)
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

    // 4. Send to Apps Script
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
        // --- HYBRID FIX (Correct) ---
        // We MUST use res.text() because doPost uses HtmlService
        return res.text();
    })
    .then(text => {
        if (!text || (text.charAt(0) !== '{' && text.charAt(0) !== '[')) {
            console.error('Received non-JSON response from server:', text);
            throw new Error('Server returned an invalid response.');
        }
        
        const responseData = JSON.parse(text);
        
        if (responseData.status === 'success') {
            showMessage('✅ Thank you! Your survey has been submitted.', 'success');
            // Hide the form, show a thank you message
            form.style.display = 'none';
            document.getElementById('form-title').textContent = "Thank You!";
            document.getElementById('form-subtitle').textContent = "Your voice has been heard. Follow us on social media to stay connected!";
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
    // This targets the SECTION elements, not the individual cards
    const fadeElements = document.querySelectorAll('.scroll-fade');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // *** TYPO FIX (v11) ***
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 
    });

    fadeElements.forEach(el => {
        observer.observe(el);
    });
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
        canvas.width = heroElement.clientWidth;
        canvas.height = heroElement.clientHeight;
        init();
    }

    // Particle properties
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            // Get color from CSS variable
            this.color = getComputedStyle(document.documentElement)
                         .getPropertyValue('--color-accent') || 'rgba(253, 184, 19, 0.5)';
            this.color = this.color.trim() + '80'; // Add alpha
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

    // Initialize particles
    function init() {
        particlesArray = [];
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Initial setup
    // We must wait a tick for the content to be populated and rendered
    setTimeout(() => {
        resizeCanvas();
        animate();
    }, 100); 
}

