class RushLoadingScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Loading state
        this.progress = 0;
        this.isLoading = false;
        this.loadingInterval = null;
        
        // Loading messages
        this.messages = [
            "Cargando experiencia gaming...",
            "Preparando tus juegos favoritos...",
            "Configurando controles...",
            "Cargando catálogo de juegos...",
            "Optimizando rendimiento...",
            "Casi listos para jugar..."
        ];
        
        this.currentMessageIndex = 0;
        
        // Initialize component
        this.init();
    }

    async init() {
        try {
            const [html, css] = await Promise.all([
                fetch("./components/loading/loading.html").then(res => res.text()),
                fetch("./components/loading/loading.css").then(res => res.text())
            ]);

            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html.replace('<template id="loading-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
            `;
            
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);
            
            this.setupElements();
            
        } catch (error) {
            console.error('Error loading RushLoadingScreen component:', error);
        }
    }

    setupElements() {
        this.progressFill = this.shadowRoot.querySelector('#progressFill');
        this.progressText = this.shadowRoot.querySelector('#progressText');
        this.loadingPercentage = this.shadowRoot.querySelector('#loadingPercentage');
        this.loadingOverlay = this.shadowRoot.querySelector('.loading-overlay');
        
        // Set initial state
        this.updateProgress(0);
    }

    // Public API Methods
    startLoading(duration = 5000) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.progress = 0;
        this.currentMessageIndex = 0;
        
        // Show loading screen
        this.loadingOverlay.classList.remove('fade-out');
        
        // Calculate progress increment
        const increment = 100 / (duration / 100); // Update every 100ms
        
        this.loadingInterval = setInterval(() => {
            this.progress += increment * (0.5 + Math.random()); // Random speed variation
            
            if (this.progress >= 100) {
                this.progress = 100;
                this.completeLoading();
            } else {
                this.updateProgress(this.progress);
                this.updateMessage();
            }
            
        }, 100);
        
        // Emit loading started event
        this.dispatchEvent(new CustomEvent('loadingStarted', {
            detail: { duration },
            bubbles: true
        }));
    }

    stopLoading() {
        if (!this.isLoading) return;
        
        this.isLoading = false;
        
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        
        this.completeLoading();
    }

    completeLoading() {
        this.isLoading = false;
        
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        
        // Set to 100%
        this.updateProgress(100);
        this.progressText.textContent = "¡Listo para jugar!";
        
        // Fade out after a brief delay
        setTimeout(() => {
            this.fadeOut();
        }, 800);
    }

    fadeOut() {
        this.loadingOverlay.classList.add('fade-out');
        
        // Emit loading completed event
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('loadingCompleted', {
                bubbles: true
            }));
        }, 500);
    }

    updateProgress(percentage) {
        const clampedPercentage = Math.min(100, Math.max(0, percentage));
        
        if (this.progressFill) {
            this.progressFill.style.width = `${clampedPercentage}%`;
        }
        
        if (this.loadingPercentage) {
            this.loadingPercentage.textContent = `${Math.round(clampedPercentage)}%`;
        }
    }

    updateMessage() {
        if (!this.progressText) return;
        
        // Change message based on progress
        const progressThresholds = [0, 20, 40, 60, 75, 90];
        const currentThreshold = progressThresholds.findIndex(threshold => 
            this.progress < threshold || threshold === 90
        );
        
        if (currentThreshold !== -1 && currentThreshold !== this.currentMessageIndex) {
            this.currentMessageIndex = currentThreshold;
            
            // Add animation class
            this.progressText.classList.add('change-message');
            
            setTimeout(() => {
                this.progressText.textContent = this.messages[this.currentMessageIndex];
                this.progressText.classList.remove('change-message');
            }, 250);
        }
    }

    // Manual progress setting
    setProgress(percentage) {
        if (!this.isLoading) return;
        
        this.progress = Math.min(100, Math.max(0, percentage));
        this.updateProgress(this.progress);
        this.updateMessage();
        
        if (this.progress >= 100) {
            this.completeLoading();
        }
    }

    // Get current progress
    getProgress() {
        return this.progress;
    }

    // Check if currently loading
    isCurrentlyLoading() {
        return this.isLoading;
    }

    // Set custom loading messages
    setMessages(messages) {
        if (Array.isArray(messages) && messages.length > 0) {
            this.messages = [...messages];
            this.currentMessageIndex = 0;
        }
    }

    // Show/hide loading screen manually
    show() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('fade-out');
        }
    }

    hide() {
        this.fadeOut();
    }

    // Cleanup method
    destroy() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        this.isLoading = false;
    }

    // Lifecycle methods
    connectedCallback() {
        // Component added to DOM
        console.log('RushLoadingScreen connected to DOM');
    }

    disconnectedCallback() {
        // Component removed from DOM - cleanup
        this.destroy();
        console.log('RushLoadingScreen disconnected from DOM');
    }

    // Attribute observation
    static get observedAttributes() {
        return ['duration', 'auto-start'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'duration':
                this.defaultDuration = parseInt(newValue) || 5000;
                break;
            case 'auto-start':
                if (newValue !== null && this.shadowRoot) {
                    setTimeout(() => this.startLoading(), 100);
                }
                break;
        }
    }
}

// Register the custom element
customElements.define("rush-loading", RushLoadingScreen);