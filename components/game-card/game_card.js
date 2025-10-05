class RushGameCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Game data
        this.gameData = {
            id: '',
            title: 'Título del Juego',
            image: '',
            rating: 0,
        };
        
        this.init();
    }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/game-card/game_card.html').then((res) => res.text()),
        fetch('./components/game-card/game_card.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="game-card-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.setupEventListeners();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushGameCard component:', error);
      this.renderErrorState();
    }
  }

    setupElements() {
        this.card = this.shadowRoot.querySelector('.game-card');
        this.gameImage = this.shadowRoot.querySelector('#gameImage');
        this.gameTitle = this.shadowRoot.querySelector('#gameTitle');
        this.gameRating = this.shadowRoot.querySelector('#gameRating');
        this.stars = this.shadowRoot.querySelectorAll('.star');
        this.playBtn = this.shadowRoot.querySelector('#playBtn');
    }

    setupEventListeners() {
        this.card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            this.handleClick();
        });

        if (this.playBtn) {
            this.playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleClick();
            });
        }
    }

    updateDisplay() {
        /* Update title, image, rating, and buttons based on gameData */
        
        if (!this.gameTitle) return;
        
        // truncate title if too long
        let title = this.gameData.title;
        if (title.length > 12
        ) {
            title = title.slice(0, 9) + '...';
        }
        this.gameTitle.textContent = title;
        this.gameTitle.setAttribute('title', this.gameData.title);

        // Update image
        if (this.gameData.image) {
            this.gameImage.src = this.gameData.image;
            this.gameImage.alt = `Imagen de ${this.gameData.title}`;
        }

        // Update rating stars
        this.updateRating(this.gameData.rating);
    }

    updateRating(rating) {
        /* Update star display based on rating */

        if (!this.stars) return;

        // Clamp rating between 0 and 5
        const clampedRating = Math.max(0, Math.min(5, rating));
        
        this.stars.forEach((star, index) => {
            star.classList.remove('filled', 'half-filled');
            if (index < Math.floor(clampedRating)) {
                star.classList.add('filled');
            } else if (index < clampedRating && clampedRating % 1 !== 0) {
                star.classList.add('half-filled');
            }
        });
    }

    handleClick() {
        
    }

  connectedCallback() {
    this.setAttribute('tabindex', '0');
    console.log('RushGameCard connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushGameCard disconnected from DOM');
  }

    static get observedAttributes() {
        return ['game-id', 'title', 'image', 'rating'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'game-id':
                this.gameData.id = newValue || '';
                break;
            case 'title':
                this.gameData.title = newValue || 'Título del Juego';
                break;
            case 'image':
                this.gameData.image = newValue || '';
                break;
            case 'rating':
                this.gameData.rating = parseFloat(newValue) || 0;
                break;
        }
        this.updateDisplay();
    }
}

customElements.define('rush-game-card', RushGameCard);
