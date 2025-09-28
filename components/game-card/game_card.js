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
            category: 'Categoría',
            description: 'Descripción del juego...',
            isFavorited: false,
            isPlaying: false
        };
        
        this.init();
    }

    async init() {
        try {
            const [html, css] = await Promise.all([
                fetch("./components/game-card/game_card.html").then(res => res.text()),
                fetch("./components/game-card/game_card.css").then(res => res.text())
            ]);

            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html.replace('<template id="game-card-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
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
            this.handleCardClick();
        });

        if (this.playBtn) {
            this.playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePlayClick();
            });
        }

        if (this.favoriteBtn) {
            this.favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFavoriteClick();
            });
        }

        if (this.gameImage) {
            this.gameImage.addEventListener('error', () => {
                this.handleImageError();
            });
            this.gameImage.addEventListener('load', () => {
                this.card.classList.remove('loading');
            });
        }

        this.card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardClick();
            }
        });
    }

    setGameData(data) {
        this.gameData = { ...this.gameData, ...data };
        this.updateDisplay();
        
        this.dispatchEvent(new CustomEvent('gameDataUpdated', {
            detail: this.gameData,
            bubbles: true
        }));
    }

    getGameData() {
        return { ...this.gameData };
    }

    updateDisplay() {
        if (!this.gameTitle) return;
        // Truncar el título si es muy largo
        let title = this.gameData.title;
        if (title.length > 14) {
            title = title.slice(0, 11) + '...';
        }
        this.gameTitle.textContent = title;
        this.gameTitle.setAttribute('title', this.gameData.title);

        if (this.gameData.image) {
            this.gameImage.src = this.gameData.image;
            this.gameImage.alt = `Imagen de ${this.gameData.title}`;
        } else {
            this.setPlaceholderImage();
        }

        // Mostrar estrellas de rating
        this.updateRating(this.gameData.rating);

        this.updateFavoriteState?.(this.gameData.isFavorited);
        this.updatePlayingState(this.gameData.isPlaying);
    }

    updateRating(rating) {
        if (!this.stars) return;
        const clampedRating = Math.max(0, Math.min(5, rating));
        this.stars.forEach((star, index) => {
            star.classList.remove('filled', 'half-filled');
            if (index < Math.floor(clampedRating)) {
                star.classList.add('filled');
            } else if (index < clampedRating && clampedRating % 1 !== 0) {
                star.classList.add('half-filled');
            }
        });
        if (this.gameRating) {
            const ratingText = `Calificación: ${clampedRating} de 5 estrellas`;
            this.gameRating.setAttribute('aria-label', ratingText);
        }
    }

    updateFavoriteState(isFavorited) {
        this.gameData.isFavorited = isFavorited;
        if (!this.favoriteBtn) return;
        if (isFavorited) {
            this.favoriteBtn.classList.add('favorited');
            this.favoriteBtn.setAttribute('aria-label', 'Quitar de favoritos');
        } else {
            this.favoriteBtn.classList.remove('favorited');
            this.favoriteBtn.setAttribute('aria-label', 'Agregar a favoritos');
        }
    }

    updatePlayingState(isPlaying) {
        this.gameData.isPlaying = isPlaying;
        if (!this.playBtn) return;
        if (isPlaying) {
            this.playBtn.textContent = 'Jugando...';
            this.playBtn.disabled = true;
            this.card.classList.add('playing');
        } else {
            this.playBtn.textContent = 'Play';
            this.playBtn.disabled = false;
            this.card.classList.remove('playing');
        }
    }

    setPlaceholderImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 320, 200);
        gradient.addColorStop(0, '#14171B');
        gradient.addColorStop(1, '#1A1F24');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 320, 200);
        
        ctx.fillStyle = '#7ED321';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎮', 160, 120);
        
        this.gameImage.src = canvas.toDataURL();
        this.gameImage.alt = 'Imagen del juego no disponible';
    }

    handleImageError() {
        console.log('Image failed to load, using placeholder');
        this.setPlaceholderImage();
    }

    handleCardClick() {
        this.dispatchEvent(new CustomEvent('gameCardClicked', {
            detail: {
                gameId: this.gameData.id,
                gameData: this.gameData
            },
            bubbles: true
        }));
        
        console.log('Game card clicked:', this.gameData.id);
    }

    handlePlayClick() {
        if (this.gameData.isPlaying) return;
        
        this.playBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.playBtn.style.transform = '';
        }, 150);

        this.dispatchEvent(new CustomEvent('gamePlayClicked', {
            detail: {
                gameId: this.gameData.id,
                gameData: this.gameData
            },
            bubbles: true
        }));
        
        console.log('Play clicked:', this.gameData.id);
    }

    handleFavoriteClick() {
        const newFavoriteState = !this.gameData.isFavorited;
        this.updateFavoriteState(newFavoriteState);

        this.favoriteBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            this.favoriteBtn.style.transform = '';
        }, 200);

        this.dispatchEvent(new CustomEvent('gameFavoriteToggled', {
            detail: {
                gameId: this.gameData.id,
                isFavorited: newFavoriteState,
                gameData: this.gameData
            },
            bubbles: true
        }));
        
        console.log('Favorite toggled:', this.gameData.id, newFavoriteState);
    }

    setVariant(variant) {
        this.card.classList.remove('compact', 'featured');
        
        if (variant) {
            this.card.classList.add(variant);
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.card.classList.add('loading');
        } else {
            this.card.classList.remove('loading');
        }
    }

    renderErrorState() {
        this.shadowRoot.innerHTML = `
            <style>
                .error-card {
                    background: var(--neutral-surface-variant);
                    border: 1px solid var(--neutral-border);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                }
            </style>
            <div class="error-card">
                <p>Error al cargar el componente de juego</p>
            </div>
        `;
    }

    connectedCallback() {
        this.setAttribute('tabindex', '0');
        console.log('RushGameCard connected to DOM');
    }

    disconnectedCallback() {
        console.log('RushGameCard disconnected from DOM');
    }

    static get observedAttributes() {
    return ['game-id', 'title', 'image', 'description', 'variant', 'favorited'];
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
            case 'description':
                this.gameData.description = newValue || 'Descripción del juego...';
                break;
            case 'variant':
                this.setVariant(newValue);
                return;
            case 'favorited':
                this.gameData.isFavorited = newValue === 'true';
                break;
        }
        this.updateDisplay();
    }
}

customElements.define("rush-game-card", RushGameCard);