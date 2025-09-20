/**
 * Advanced Analytics & Visitor Tracking
 * Privacy-compliant tracking for portfolio website
 */

class PortfolioAnalytics {
    constructor() {
        this.trackingEnabled = this.checkConsentStatus();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        if (this.trackingEnabled) {
            this.initializeTracking();
        }
    }

    // Check if user has consented to tracking
    checkConsentStatus() {
        return localStorage.getItem('analytics-consent') === 'true';
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Initialize all tracking components
    initializeTracking() {
        this.trackPageView();
        this.trackUserInteractions();
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.trackOutboundLinks();
        this.trackFormSubmissions();
        this.trackPortfolioInteractions();
    }

    // Track page views with Plausible
    trackPageView() {
        if (typeof plausible !== 'undefined') {
            plausible('pageview', {
                props: {
                    page_type: this.getPageType(),
                    referrer_type: this.getReferrerType(),
                    device_type: this.getDeviceType()
                }
            });
        }
    }

    // Track specific user interactions
    trackUserInteractions() {
        // Track tab switches in About section
        document.querySelectorAll('[data-te-toggle="pill"]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-te-target');
                this.trackEvent('Tab_Click', {
                    tab_name: tabName,
                    section: 'about'
                });
            });
        });

        // Track social media clicks
        document.querySelectorAll('.hero-social, a[href*="facebook"], a[href*="linkedin"], a[href*="instagram"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.getSocialPlatform(link.href);
                this.trackEvent('Social_Click', {
                    platform: platform,
                    location: 'header'
                });
            });
        });

        // Track "Let's Talk" button clicks
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackEvent('CTA_Click', {
                    button_text: btn.textContent.trim(),
                    location: this.getElementLocation(btn)
                });
            });
        });
    }

    // Track scroll depth
    trackScrollDepth() {
        let maxScrollDepth = 0;
        const thresholds = [25, 50, 75, 100];
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                
                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !this.hasTrackedThreshold(threshold)) {
                        this.trackEvent('Scroll_Depth', {
                            depth_percent: threshold,
                            page_type: this.getPageType()
                        });
                        this.markThresholdTracked(threshold);
                    }
                });
            }
        });
    }

    // Track time on page
    trackTimeOnPage() {
        // Track every 30 seconds
        setInterval(() => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
            
            if (timeSpent % 30 === 0 && timeSpent > 0) {
                this.trackEvent('Time_On_Page', {
                    seconds: timeSpent,
                    page_type: this.getPageType()
                });
            }
        }, 30000);

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('Session_End', {
                total_time_seconds: totalTime,
                page_type: this.getPageType()
            });
        });
    }

    // Track outbound links
    trackOutboundLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.addEventListener('click', (e) => {
                    this.trackEvent('Outbound_Click', {
                        url: link.href,
                        text: link.textContent.trim() || 'No text',
                        destination: new URL(link.href).hostname
                    });
                });
            }
        });
    }

    // Track form submissions
    trackFormSubmissions() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackEvent('Form_Submit', {
                    form_id: form.id || 'unknown',
                    form_action: form.action || 'unknown'
                });
            });
        });
    }

    // Track portfolio-specific interactions
    trackPortfolioInteractions() {
        // Track portfolio item views
        document.querySelectorAll('.protfolio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectTitle = btn.closest('.portfolio-item-content, .p-[16px]')
                    ?.querySelector('h2')?.textContent.trim() || 'Unknown Project';
                
                this.trackEvent('Portfolio_View', {
                    project_name: projectTitle,
                    project_type: this.getProjectType(projectTitle)
                });
            });
        });

        // Track resume/CV downloads
        document.querySelectorAll('a[href*="cv"], a[href*="resume"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('CV_Download', {
                    file_type: this.getFileExtension(link.href)
                });
            });
        });
    }

    // Generic event tracking method
    trackEvent(eventName, properties = {}) {
        if (!this.trackingEnabled) return;

        // Enhanced properties with session data
        const enhancedProps = {
            ...properties,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Send to Plausible
        if (typeof plausible !== 'undefined') {
            plausible(eventName, { props: enhancedProps });
        }

        // Send to custom analytics API if available
        this.sendToCustomAPI(eventName, enhancedProps);
    }

    // Send to custom analytics endpoint
    async sendToCustomAPI(eventName, properties) {
        try {
            await fetch('/.netlify/functions/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    properties: properties,
                    url: window.location.href,
                    referrer: document.referrer
                })
            });
        } catch (error) {
            console.debug('Custom analytics not available:', error);
        }
    }

    // Utility methods
    getPageType() {
        const path = window.location.pathname;
        if (path === '/' || path.includes('index')) return 'home';
        if (path.includes('about')) return 'about';
        if (path.includes('portfolio')) return 'portfolio';
        if (path.includes('contact')) return 'contact';
        if (path.includes('resume')) return 'resume';
        return 'other';
    }

    getReferrerType() {
        const referrer = document.referrer;
        if (!referrer) return 'direct';
        if (referrer.includes('google')) return 'google';
        if (referrer.includes('linkedin')) return 'linkedin';
        if (referrer.includes('github')) return 'github';
        return 'other';
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    getSocialPlatform(url) {
        if (url.includes('facebook')) return 'facebook';
        if (url.includes('linkedin')) return 'linkedin';
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('twitter')) return 'twitter';
        return 'other';
    }

    getElementLocation(element) {
        if (element.closest('header')) return 'header';
        if (element.closest('footer')) return 'footer';
        if (element.closest('.hero-1')) return 'hero';
        return 'content';
    }

    getProjectType(title) {
        if (title.toLowerCase().includes('app')) return 'mobile_app';
        if (title.toLowerCase().includes('web')) return 'web_app';
        if (title.toLowerCase().includes('3d')) return '3d_project';
        return 'other';
    }

    getFileExtension(url) {
        return url.split('.').pop().toLowerCase();
    }

    hasTrackedThreshold(threshold) {
        return localStorage.getItem(`scroll_${threshold}`) === 'true';
    }

    markThresholdTracked(threshold) {
        localStorage.setItem(`scroll_${threshold}`, 'true');
    }
}

// GDPR Consent Management
class ConsentManager {
    constructor() {
        this.consentKey = 'analytics-consent';
        this.showConsentBanner();
    }

    showConsentBanner() {
        if (this.hasConsent() !== null) return;

        const banner = this.createConsentBanner();
        document.body.appendChild(banner);
    }

    createConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #121151;
            color: white;
            padding: 20px;
            z-index: 9999;
            border-top: 3px solid #fe3e57;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        `;

        banner.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: between; flex-wrap: wrap; gap: 15px;">
                <div style="flex: 1; min-width: 300px;">
                    <h4 style="margin: 0 0 8px 0; color: #fe3e57;">🍪 Privacy & Analytics</h4>
                    <p style="margin: 0; font-size: 14px; line-height: 1.4;">
                        I use privacy-first analytics to understand how visitors interact with my portfolio. 
                        No personal data is collected or shared with third parties.
                    </p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="consent-accept" style="background: #fe3e57; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        Accept Analytics
                    </button>
                    <button id="consent-decline" style="background: transparent; color: white; border: 1px solid #ccc; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Decline
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        banner.querySelector('#consent-accept').addEventListener('click', () => {
            this.setConsent(true);
            this.removeBanner();
            new PortfolioAnalytics(); // Initialize analytics
        });

        banner.querySelector('#consent-decline').addEventListener('click', () => {
            this.setConsent(false);
            this.removeBanner();
        });

        return banner;
    }

    hasConsent() {
        const consent = localStorage.getItem(this.consentKey);
        return consent === 'true' ? true : consent === 'false' ? false : null;
    }

    setConsent(consent) {
        localStorage.setItem(this.consentKey, consent.toString());
    }

    removeBanner() {
        const banner = document.getElementById('consent-banner');
        if (banner) banner.remove();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const consentManager = new ConsentManager();
    
    // Initialize analytics if consent already given
    if (consentManager.hasConsent() === true) {
        new PortfolioAnalytics();
    }
});

// Export for use in other files
window.PortfolioAnalytics = PortfolioAnalytics;
window.ConsentManager = ConsentManager;
