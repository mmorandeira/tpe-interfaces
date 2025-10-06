class RushGameShare extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.init();
    }

    async init() {
        try {
            const [html, css] = await Promise.all([
                fetch('./components/share/share.html').then(res => res.text()),
                fetch('./components/share/share.css').then(res => res.text())
            ]);

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const templateElement = doc.querySelector('#share-template');
            
            if (!templateElement) {
                throw new Error('Template not found in HTML file');
            }

            const template = document.createElement('template');
            template.innerHTML = `
                <style>${css}</style>
                ${templateElement.innerHTML}
            `;

            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);

            this.setupElements();
        } catch (error) {
            console.error('Error loading share component:', error);
        }
    }

    setupElements() {
        this.overlay = this.shadowRoot.querySelector('#shareOverlay');
        this.popup = this.shadowRoot.querySelector('.share-popup');
        this.urlInput = this.shadowRoot.querySelector('#shareUrlInput');
        this.copyBtn = this.shadowRoot.querySelector('#shareCopyBtn');
        this.closeBtn = this.shadowRoot.querySelector('#shareCloseBtn');
        this.closeIcon = this.shadowRoot.querySelector('#shareClose');

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.overlay) return;

        // Copy button functionality
        this.copyBtn?.addEventListener('click', () => this.copyToClipboard());

        // Close button functionality
        this.closeBtn?.addEventListener('click', () => this.hide());
        this.closeIcon?.addEventListener('click', () => this.hide());

        // Close on overlay click (outside popup)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // ESC key to close
        this.handleEscKey = (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        };
        document.addEventListener('keydown', this.handleEscKey);

        // URL input selection on focus
        this.urlInput?.addEventListener('focus', () => {
            this.urlInput.select();
        });
    }

    show(url = null) {
        if (!this.overlay) return;

        // Update URL if provided
        if (url && this.urlInput) {
            this.urlInput.value = url;
        }

        // Show overlay with animation
        this.overlay.classList.add('active');
        
        // Focus on the URL input
        setTimeout(() => {
            this.urlInput?.focus();
        }, 100);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (!this.overlay) return;

        this.overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Reset copy button if it was showing success state
        this.resetCopyButton();
    }

    isVisible() {
        return this.overlay?.classList.contains('active') || false;
    }

    async copyToClipboard() {
        if (!this.urlInput || !this.copyBtn) return;

        try {
            // Modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.urlInput.value);
            } else {
                // Fallback for older browsers
                this.urlInput.select();
                this.urlInput.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }

            this.showCopySuccess();
        } catch (err) {
            console.error('Failed to copy URL: ', err);
            this.showCopyError();
        }
    }

    showCopySuccess() {
        if (!this.copyBtn) return;

        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = '¡Copiado!';
        this.copyBtn.classList.add('copied');

        setTimeout(() => {
            this.copyBtn.textContent = originalText;
            this.copyBtn.classList.remove('copied');
        }, 2000);
    }

    showCopyError() {
        if (!this.copyBtn) return;

        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Error';
        this.copyBtn.style.backgroundColor = '#f44336';

        setTimeout(() => {
            this.copyBtn.textContent = originalText;
            this.copyBtn.style.backgroundColor = '';
        }, 2000);
    }

    resetCopyButton() {
        if (!this.copyBtn) return;

        this.copyBtn.textContent = 'Copiar';
        this.copyBtn.classList.remove('copied');
        this.copyBtn.style.backgroundColor = '';
    }

    // Method to update the URL dynamically
    setUrl(newUrl) {
        if (this.urlInput) {
            this.urlInput.value = newUrl;
        }
    }

    // Method to get current URL
    getUrl() {
        return this.urlInput?.value || '';
    }

    connectedCallback() {
        // Component is already initialized in constructor
    }

    disconnectedCallback() {
        // Clean up event listeners if needed
        document.removeEventListener('keydown', this.handleEscKey);
    }
}

customElements.define('rushgame-share', RushGameShare);
