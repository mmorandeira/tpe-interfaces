class MyNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

        this.navbarData = {
            isLoggedIn: false,
        };

        this.init();
    }

    async init() {
        Promise.all([
            fetch("./components/navbar/navbar.html").then(res => res.text()),
            fetch("./components/navbar/navbar.css").then(res => res.text())
        ]).then(([html, css]) => {
            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="navbar-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);

            this.setupEventListeners();
            this.updateUI(); // Inicializar el estado de la UI

            window.addEventListener('resize', () => {
                this.updateUI();
            });
        });
    }

    setupEventListeners() {
        const hamburger = this.shadowRoot.querySelector('#hamburger');
        const mobileMenu = this.shadowRoot.querySelector('#mobile-menu');
        const mobileLoginButton = this.shadowRoot.querySelector('.mobile-login-button');
        const loginButton = this.shadowRoot.querySelector('.login-button');
        const mobileLogoutButton = this.shadowRoot.querySelector('.mobile-logout-button');
        const mobileLoginBtn = this.shadowRoot.querySelector('.mobile-login-btn');
        // Toggle mobile menu
        hamburger?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                mobileMenu?.classList.remove('active');
            }
        });

        // Login buttons
        mobileLoginButton?.addEventListener('click', () => {
            this.handleLogin();
        });

        loginButton?.addEventListener('click', () => {
            this.handleLogin();
        });

        mobileLoginBtn?.addEventListener('click', () => {
            this.handleLogin();
        });

        // logout button
        mobileLogoutButton?.addEventListener('click', () => {
            this.handleLogin();
        });

    }

    handleLogin() {
        this.isLoggedIn = !this.navbarData.isLoggedIn;
    }

    get isLoggedIn() {
        return this.navbarData.isLoggedIn;
    }

    set isLoggedIn(value) {
        this.navbarData.isLoggedIn = value;
        this.updateUI();
    }

    updateUI() {
        const elements = this.getUIElements();
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (this.navbarData.isLoggedIn) {
            this.hideElements(elements.loggedOut, isMobile);
            this.showElements(elements.loggedIn, isMobile);
        } else {
            this.hideElements(elements.loggedIn, isMobile);
            this.showElements(elements.loggedOut, isMobile);
        }
    }

    getUIElements() {
        return {
            loggedIn: {
                desktop: [
                    this.shadowRoot.querySelector('.navbar-right-logged-in'),
                    this.shadowRoot.querySelector('.mobile-logout-button')
                ],
                mobile: [
                    this.shadowRoot.querySelector('.mobile-navbar-right-logged-in'),
                    this.shadowRoot.querySelector('.mobile-logout-button')
                ]
            },
            loggedOut: {
                desktop: [
                    this.shadowRoot.querySelector('.navbar-right-logged-out'),
                    this.shadowRoot.querySelector('.mobile-login-button')
                ],
                mobile: [
                    this.shadowRoot.querySelector('.mobile-navbar-right-logged-out'),
                    this.shadowRoot.querySelector('.mobile-login-button')
                ]
            }
        };
    }

    hideElements(elements, isMobile) {
        const elementsToHide = isMobile ? elements.mobile : elements.desktop;
        elementsToHide.forEach(element => {
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    showElements(elements, isMobile) {
        const elementsToShow = isMobile ? elements.mobile : elements.desktop;
        elementsToShow.forEach(element => {
            if (element) {
                element.style.display = 'flex';
            }
        });
    }
}

customElements.define("rushgame-navbar", MyNavbar);
