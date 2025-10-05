class RushFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        this.footerData = {
            aboutLinks: [
                { label: 'Política de privacidad', url: '/privacidad' },
                { label: 'Términos de uso', url: '/terminos' },
                { label: 'Compañía', url: '/compania' },
                { label: 'Negocio', url: '/negocio' },
                { label: 'Seguridad y confianza', url: '/seguridad' },
                { label: '¿Quiénes somos?', url: '/quienes-somos' }
            ],
            socialLinks: [
                { platform: 'instagram', url: '#', label: 'Instagram' },
                { platform: 'facebook', url: '#', label: 'Facebook' },
                { platform: 'youtube', url: '#', label: 'YouTube' },
                { platform: 'twitter', url: '#', label: 'Twitter' }
            ],
            resourceLinks: [
                { label: 'Soporte', url: '/soporte' },
                { label: 'Consultas', url: '/consultas' },
                { label: 'Blogs', url: '/blogs' },
                { label: 'Desarrolladores y API', url: '/api' },
                { label: 'Accesibilidad', url: '/accesibilidad' },
                { label: 'Eventos', url: '/eventos' },
                { label: 'Directorio', url: '/directorio' },
                { label: 'Otras Páginas', url: '/sitios' },
                { label: 'F.A.Q.', url: '/faq' }
            ],
            contactPhone: '+54 11 1234-5678',
            contactEmail: 'contacto@rushgames.com',
            year: new Date().getFullYear()
        };
        
        this.init();
    }

    async init() {
        try {
            const [html, css] = await Promise.all([
                fetch("./components/footer/footer.html").then(res => res.text()),
                fetch("./components/footer/footer.css").then(res => res.text())
            ]);

            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html.replace('<template id="footer-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
            `;
            
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);
            
            this.setupElements();
            this.setupEventListeners();
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error loading RushFooter component:', error);
        }
    }

    setupElements() {
        this.aboutLinksContainer = this.shadowRoot.querySelector('#aboutLinks');
        this.socialLinksContainer = this.shadowRoot.querySelector('#socialLinks');
        this.resourceLinksContainer = this.shadowRoot.querySelector('#resourceLinks');
        this.contactPhone = this.shadowRoot.querySelector('#contactPhone');
        this.configBtn = this.shadowRoot.querySelector('#configBtn');
        this.copyrightYear = this.shadowRoot.querySelector('#copyrightYear');
    }

    setupEventListeners() {
        if (this.configBtn) {
            this.configBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('configClicked', { bubbles: true }));
            });
        }
    }

    updateDisplay() {
        // Update about links
        if (this.aboutLinksContainer) {
            this.aboutLinksContainer.innerHTML = '';
            this.footerData.aboutLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'footer-link';
                a.textContent = link.label;
                this.aboutLinksContainer.appendChild(a);
            });
        }

        // Update social links
        if (this.socialLinksContainer) {
            this.socialLinksContainer.innerHTML = '';
            this.footerData.socialLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'social-link';
                a.setAttribute('data-platform', link.platform);
                a.setAttribute('aria-label', link.label);
                a.innerHTML = this.getSocialIcon(link.platform);
                this.socialLinksContainer.appendChild(a);
            });
        }

        // Update resource links
        if (this.resourceLinksContainer) {
            this.resourceLinksContainer.innerHTML = '';
            this.footerData.resourceLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'footer-link';
                a.textContent = link.label;
                this.resourceLinksContainer.appendChild(a);
            });
        }

        // Update contact phone
        if (this.contactPhone) {
            this.contactPhone.textContent = this.footerData.contactPhone;
        }

        // Update copyright year
        if (this.copyrightYear) {
            this.copyrightYear.textContent = this.footerData.year;
        }
    }

    getSocialIcon(platform) {
        const icons = {
            instagram: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
            facebook: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            youtube: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" stroke-width="2"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" stroke-width="2"/></svg>',
            twitter: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" stroke-width="2"/></svg>'
        };
        return icons[platform] || '';
    }

    static get observedAttributes() {
        return ['contact-phone', 'contact-email'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'contact-phone':
                this.footerData.contactPhone = newValue;
                this.updateDisplay();
                break;
            case 'contact-email':
                this.footerData.contactEmail = newValue;
                break;
        }
    }

    connectedCallback() {
        console.log('RushFooter connected to DOM');
    }

    disconnectedCallback() {
        console.log('RushFooter disconnected from DOM');
    }
}

customElements.define("rush-footer", RushFooter);