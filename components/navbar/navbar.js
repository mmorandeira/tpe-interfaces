class MyNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        Promise.all([
            fetch("./components/navbar/navbar.html").then(res => res.text()),
            fetch("./components/navbar/navbar.css").then(res => res.text())
        ]).then(([html, css]) => {
            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html.replace('<template id="navbar-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
            `;
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);
            
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        const hamburger = this.shadowRoot.querySelector('#hamburger');
        const mobileMenu = this.shadowRoot.querySelector('#mobile-menu');
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const searchButton = this.shadowRoot.querySelector('.search-button');
        const mobileLoginButton = this.shadowRoot.querySelector('.mobile-login-button');

        // Toggle mobile menu
        hamburger?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('active');
        });

        // Search functionality
        searchButton?.addEventListener('click', () => {
            this.handleSearch(searchInput?.value);
        });

        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(searchInput.value);
            }
        });

        // Mobile login button
        mobileLoginButton?.addEventListener('click', () => {
            this.handleLogin();
        });

        // Category navigation
        const categoryItems = this.shadowRoot.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.textContent.trim();
                this.handleCategoryNavigation(category);
            });
        });

        // Main navigation items
        const navItems = this.shadowRoot.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.textContent.trim();
                this.handleNavigation(page);
            });
        });

        // Social media links
        const socialIcons = this.shadowRoot.querySelectorAll('.social-icon');
        socialIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialNavigation(e.currentTarget);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                mobileMenu?.classList.remove('active');
            }
        });
    }

    handleSearch(query) {
        if (query && query.trim()) {
            console.log('Searching for:', query);
            // Aquí puedes agregar la lógica de búsqueda real
            // Por ejemplo, emitir un evento personalizado
            this.dispatchEvent(new CustomEvent('search', {
                detail: { query: query.trim() },
                bubbles: true
            }));
        }
    }

    handleLogin() {
        console.log('Login button clicked');
        // Emit custom event for login
        this.dispatchEvent(new CustomEvent('login', {
            bubbles: true
        }));
    }

    handleNavigation(page) {
        console.log('Navigating to:', page);
        // Emit custom event for navigation
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { page: page },
            bubbles: true
        }));
    }

    handleCategoryNavigation(category) {
        console.log('Navigating to category:', category);
        // Emit custom event for category navigation
        this.dispatchEvent(new CustomEvent('categoryNavigate', {
            detail: { category: category },
            bubbles: true
        }));
    }

    handleSocialNavigation(socialIcon) {
        const socialType = socialIcon.classList[1]; // Gets 'instagram', 'facebook', etc.
        console.log('Social media clicked:', socialType);
        
        // Define social media URLs
        const socialUrls = {
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com',
            youtube: 'https://youtube.com',
            twitter: 'https://twitter.com'
        };

        if (socialUrls[socialType]) {
            // In a real application, you might want to open in a new tab
            // window.open(socialUrls[socialType], '_blank');
            
            // Emit custom event for social navigation
            this.dispatchEvent(new CustomEvent('socialNavigate', {
                detail: { 
                    platform: socialType,
                    url: socialUrls[socialType]
                },
                bubbles: true
            }));
        }
    }
}

customElements.define("my-navbar", MyNavbar);
