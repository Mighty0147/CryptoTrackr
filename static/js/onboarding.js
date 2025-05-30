// Interactive Onboarding Tutorial for Crypto Investment Tracker

class OnboardingTutorial {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                target: '.navbar-brand',
                title: 'Welcome to CryptoTracker!',
                content: 'This is your comprehensive cryptocurrency investment tracking platform. Let\'s take a quick tour to get you started!',
                position: 'bottom'
            },
            {
                target: '[href="/"]',
                title: 'Dashboard',
                content: 'The Dashboard shows your portfolio overview and current market data. This is your home base for monitoring investments.',
                position: 'bottom'
            },
            {
                target: '[href="/portfolio"]',
                title: 'Portfolio Management',
                content: 'Here you can create portfolios, add cryptocurrency holdings, and track your investment performance.',
                position: 'bottom'
            },
            {
                target: '[href="/market"]',
                title: 'Market Data',
                content: 'View real-time cryptocurrency prices, market caps, and trending coins from CoinGecko.',
                position: 'bottom'
            },
            {
                target: '[href="/bitcoin"]',
                title: 'Bitcoin Wallet',
                content: 'Manage Bitcoin wallets and perform send/receive transactions securely.',
                position: 'bottom'
            },
            {
                target: '.container',
                title: 'Interactive Features',
                content: 'Try clicking on any cryptocurrency in the market data table to see price charts, or use the search feature to find specific coins.',
                position: 'center'
            },
            {
                target: '.container',
                title: 'Ready to Start!',
                content: 'You\'re all set! Let\'s create your first portfolio to begin tracking your crypto investments.',
                position: 'center',
                action: 'createFirstPortfolio'
            }
        ];
        this.overlay = null;
        this.tooltip = null;
        this.isActive = false;
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep();
    }

    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.overlay.innerHTML = `
            <div class="onboarding-backdrop"></div>
        `;
        document.body.appendChild(this.overlay);

        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        document.body.appendChild(this.tooltip);
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.finish();
            return;
        }

        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.nextStep();
            return;
        }

        this.highlightElement(target);
        this.showTooltip(step, target);
    }

    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // Add highlight to current element
        element.classList.add('onboarding-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showTooltip(step, target) {
        const rect = target.getBoundingClientRect();
        const tooltip = this.tooltip;
        
        tooltip.innerHTML = `
            <div class="onboarding-tooltip-content">
                <div class="onboarding-tooltip-header">
                    <h5>${step.title}</h5>
                    <span class="onboarding-step-counter">${this.currentStep + 1} / ${this.steps.length}</span>
                </div>
                <div class="onboarding-tooltip-body">
                    <p>${step.content}</p>
                </div>
                <div class="onboarding-tooltip-footer">
                    ${this.currentStep > 0 ? '<button class="btn btn-outline-secondary btn-sm" onclick="onboardingTutorial.prevStep()">Previous</button>' : ''}
                    <div class="ms-auto">
                        <button class="btn btn-outline-light btn-sm me-2" onclick="onboardingTutorial.skip()">Skip Tour</button>
                        <button class="btn btn-primary btn-sm" onclick="onboardingTutorial.nextStep()">
                            ${this.currentStep === this.steps.length - 1 ? 'Get Started' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
            <div class="onboarding-tooltip-arrow"></div>
        `;

        // Position tooltip
        this.positionTooltip(step.position, rect);
        tooltip.style.display = 'block';
    }

    positionTooltip(position, targetRect) {
        const tooltip = this.tooltip;
        const arrow = tooltip.querySelector('.onboarding-tooltip-arrow');
        
        // Reset positioning
        tooltip.style.left = '';
        tooltip.style.right = '';
        tooltip.style.top = '';
        tooltip.style.bottom = '';
        tooltip.style.transform = '';
        
        switch (position) {
            case 'bottom':
                tooltip.style.top = (targetRect.bottom + 15) + 'px';
                tooltip.style.left = (targetRect.left + targetRect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                arrow.className = 'onboarding-tooltip-arrow onboarding-arrow-top';
                break;
                
            case 'top':
                tooltip.style.bottom = (window.innerHeight - targetRect.top + 15) + 'px';
                tooltip.style.left = (targetRect.left + targetRect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                arrow.className = 'onboarding-tooltip-arrow onboarding-arrow-bottom';
                break;
                
            case 'center':
                tooltip.style.top = '50%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translate(-50%, -50%)';
                arrow.style.display = 'none';
                break;
                
            default:
                tooltip.style.top = (targetRect.bottom + 15) + 'px';
                tooltip.style.left = (targetRect.left + targetRect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                arrow.className = 'onboarding-tooltip-arrow onboarding-arrow-top';
        }
    }

    nextStep() {
        const currentStepData = this.steps[this.currentStep];
        
        // Execute step action if any
        if (currentStepData.action) {
            this.executeAction(currentStepData.action);
        }
        
        this.currentStep++;
        this.showStep();
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    executeAction(action) {
        switch (action) {
            case 'createFirstPortfolio':
                this.finish();
                // Trigger portfolio creation modal if we're on dashboard
                if (window.location.pathname === '/' && typeof showCreatePortfolioModal === 'function') {
                    setTimeout(() => {
                        showCreatePortfolioModal();
                    }, 500);
                } else {
                    // Navigate to dashboard
                    window.location.href = '/';
                }
                break;
        }
    }

    skip() {
        this.finish();
        localStorage.setItem('onboarding_completed', 'true');
    }

    finish() {
        this.isActive = false;
        
        // Remove highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        
        // Remove overlay and tooltip
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        
        // Mark as completed
        localStorage.setItem('onboarding_completed', 'true');
    }

    static shouldShow() {
        return !localStorage.getItem('onboarding_completed');
    }

    static reset() {
        localStorage.removeItem('onboarding_completed');
    }
}

// Global instance
const onboardingTutorial = new OnboardingTutorial();

// Auto-start onboarding for new users
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const startTour = urlParams.get('start_tour');
    
    // Start tour if requested via URL parameter
    if (startTour === '1') {
        setTimeout(() => {
            onboardingTutorial.start();
        }, 1000);
        return;
    }
    
    // Only show on dashboard and if not completed
    if (window.location.pathname === '/' && OnboardingTutorial.shouldShow()) {
        // Show welcome screen for new users
        if (!localStorage.getItem('welcome_shown')) {
            localStorage.setItem('welcome_shown', 'true');
            window.location.href = '/welcome';
            return;
        }
        
        // Delay to ensure page is fully loaded
        setTimeout(() => {
            onboardingTutorial.start();
        }, 1000);
    }
});

// Add manual trigger button
function addOnboardingTrigger() {
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'btn btn-outline-primary btn-sm position-fixed';
    triggerBtn.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000;';
    triggerBtn.innerHTML = '<i data-feather="help-circle" class="me-1"></i>Take Tour';
    triggerBtn.onclick = () => onboardingTutorial.start();
    
    document.body.appendChild(triggerBtn);
    
    // Initialize feather icon
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// Add trigger button after page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addOnboardingTrigger, 500);
});