class MyNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

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
                ${html.replace('<template id="navbar-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
            `;
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);

            this.setupEventListeners();
            this.updateUI(); // Inicializar el estado de la UI
        });
    }

    setupEventListeners() {
        const hamburger = this.shadowRoot.querySelector('#hamburger');
        const mobileMenu = this.shadowRoot.querySelector('#mobile-menu');
        const mobileLoginButton = this.shadowRoot.querySelector('.mobile-login-button');
        const loginButton = this.shadowRoot.querySelector('.login-button');
        const mobileLogoutButton = this.shadowRoot.querySelector('.mobile-logout-button');
        
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
        const navbarRightLoggedIn = this.shadowRoot.querySelector('.navbar-right-logged-in');
        const navbarRightLoggedOut = this.shadowRoot.querySelector('.navbar-right-logged-out');
        const navbarHamburgerMenuLoggedIn = this.shadowRoot.querySelector('.mobile-logout-button');
        const navbarHamburgerMenuLoggedOut = this.shadowRoot.querySelector('.mobile-login-button');

        if (this.navbarData.isLoggedIn) {
            navbarRightLoggedOut.style.display = 'none';
            navbarRightLoggedIn.style.display = 'flex';
            navbarHamburgerMenuLoggedOut.style.display = 'none';
            navbarHamburgerMenuLoggedIn.style.display = 'flex';
        } else {
            navbarRightLoggedOut.style.display = 'flex';
            navbarRightLoggedIn.style.display = 'none';
            navbarHamburgerMenuLoggedOut.style.display = 'flex';
            navbarHamburgerMenuLoggedIn.style.display = 'none';
        }
    }
}

customElements.define("my-navbar", MyNavbar);
