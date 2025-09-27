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

        // Toggle mobile menu
        hamburger?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('active');
            this.toggleHamburgerAnimation(hamburger);
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

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                mobileMenu?.classList.remove('active');
                this.resetHamburgerAnimation(hamburger);
            }
        });
    }

    toggleHamburgerAnimation(hamburger) {
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            spans[0].style.transform = 'rotate(0deg) translateY(0px)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0deg) translateY(0px)';
        } else {
            hamburger.classList.add('active');
            spans[0].style.transform = 'rotate(45deg) translateY(6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-6px)';
        }
    }

    resetHamburgerAnimation(hamburger) {
        if (hamburger) {
            hamburger.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'rotate(0deg) translateY(0px)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0deg) translateY(0px)';
        }
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
}

customElements.define("my-navbar", MyNavbar);
