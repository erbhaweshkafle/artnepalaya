/*
 * ArtNepalaya Frontend Logic (v12 - 2-Column Layout Update)
 *
 * This version matches the "v12" HTML/CSS files.
 * - This JS matches the "v12" index.html and style.css
 * - loadContent() uses res.json() (for ContentService)
 * - submitForm() uses res.text() (for HtmlService)
 * - "entry.Targe" typo is fixed.
 * - Form logic is rewritten for "btn-next", etc.
 * - populateContent is updated for the new 2-column layouts.
 */

// ===============================
// CONFIGURATION
// ===============================
//
// !!! IMPORTANT !!!
// You MUST paste your NEW deployment URL here
// (after re-deploying the code.gs file)
//
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzKx2lP66Cmy0aLYkJlJkUfYzQcCt1K0NPs3rJ6ppr8_SJUhLTYEFuky42uENaxuVE/exec';

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initFormLogic();
    initScrollAnimations();
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

    // 3. Pain Points (NEW 2-Col Layout)
    setElementText('pain-points-title', content.painPointsTitle);
    setElementText('pain-point1-title', content.painPoint1Title);
    setElementText('pain-point1-text', content.painPoint1Text);
    setElementText('pain-point2-title', content.painPoint2Title);
    setElementText('pain-point2-text', content.painPoint2Text);
    setElementText('pain-point3-title', content.painPoint3Title);
    setElementText('pain-point3-text', content.painPoint3Text);

    // 4. "How It Works" Section (NEW 2-Col Layout)
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
        if (prevBtn) prevBtn.style.display = (currentStep === 1) ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = (currentStep === totalSteps) ? 'none' : 'inline-block';
        if (submitBtn) submitBtn.style.display = (currentStep === totalSteps) ? 'inline-block' : 'none';
        
        // Update progress bar
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
    // Find all required inputs *within the current step*
    const requiredInputs = currentStepEl.querySelectorAll('[required], [data-required="true"]');
    
    requiredInputs.forEach(input => {
        // Special check for persona-specific questions
        const parentQuestions = input.closest('.persona-questions');
        if (parentQuestions && !parentQuestions.classList.contains('active')) {
            return; // Don't validate hidden persona questions
        }

        if (input.type === 'checkbox' || input.type === 'radio') {
             // Basic validation: check if at least one in a group is checked
             const groupName = input.name;
             if (groupName && input.dataset.required === "true") {
                 const checked = currentStepEl.querySelector(`input[name="${groupName}"]:checked`);
                 if (!checked) {
                    isValid = false;
                    // Find the label for this group to show error
                    const groupLabel = document.getElementById(`${groupName}_label`);
                    if(groupLabel) groupLabel.classList.add('input-error');
                 } else {
                    const groupLabel = document.getElementById(`${groupName}_label`);
                    if(groupLabel) groupLabel.classList.remove('input-error');
                 }
             }
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
            // Also hide progress bar
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
        if (!heroElement) return;
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
            let accentColor = getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-accent') || '#FDB813';
            accentColor = accentColor.trim();
            // Need to convert hex to rgba
            let r=0, g=0, b=0;
            if(accentColor.length === 7) {
                r = parseInt(accentColor.substring(1, 3), 16);
                g = parseInt(accentColor.substring(3, 5), 16);
                b = parseInt(accentColor.substring(5, 7), 16);
            } else if (accentColor.length === 4) {
                r = parseInt(accentColor.substring(1, 2) + accentColor.substring(1, 2), 16);
                g = parseInt(accentColor.substring(2, 3) + accentColor.substring(2, 3), 16);
                b = parseInt(accentColor.substring(3, 4) + accentColor.substring(3, 4), 16);
            }
            this.color = `rgba(${r}, ${g}, ${b}, 0.5)`;
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
        if (canvas.width === 0 || canvas.height === 0) return;
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Animation loop
    function animate() {
        if (!ctx) return;
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


