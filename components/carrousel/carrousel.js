class RushGameCarrousel extends HTMLElement {
  constructor() {
    super();

    // Create Shadow DOM for encapsulating styles and structure
    this.attachShadow({ mode: 'open' });

    // Configuration: how many cards to show at once (default 4)
    this.cardsToShow = parseInt(this.getAttribute('cards-to-show')) || 4;
    this.originalCardsToShow = this.cardsToShow; // Store original value

    // Carousel state variables
    this.currentIndex = 0; // Current index of the first visible card
    this.totalCards = 0; // Total number of cards in the carousel
    this.maxIndex = 0; // Maximum index to which you can navigate
    this.isTransitioning = false; // Flag to prevent multiple simultaneous transitions
    this.isMobile = false; // Flag to track if we're on mobile
    this.isTablet = false; // Flag to track if we're on tablet

    // API configuration
    this.apiUrl = 'https://vj.interfaces.jima.com.ar/api/v2';
    this.gamesData = []; // Store games data from API
    this.isLoadingAPI = false; // Flag to track API loading state
  }

  async init() {
    try {
      // Initialize the component by loading HTML and CSS, and setting up events
      const [html, css] = await Promise.all([
        fetch('./components/carrousel/carrousel.html').then((res) => res.text()),
        fetch('./components/carrousel/carrousel.css').then((res) => res.text()),
      ]);

      // Parse the HTML to extract only the template content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const templateElement = doc.querySelector('#carrousel-template');

      if (!templateElement) {
        throw new Error('Template not found in HTML file');
      }

      // Create template with styles and structure
      const template = document.createElement('template');
      template.innerHTML = `
        <style>${css}</style>
        ${templateElement.innerHTML}
      `;

      // Clone content and add it to the Shadow DOM
      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      // Set up elements, events, and observers
      this.setupElements();
      this.setupEventListeners();
      this.setupSlotObserver();

      // Set initial title if provided (use stored value or attribute)
      const titleToSet = this.titleValue || this.getAttribute('title');
      if (titleToSet) {
        this.updateTitle(titleToSet);
      }

      // Wait for the next frame to ensure everything is rendered
      requestAnimationFrame(() => {
        // Check if this carousel should load from API
        this.checkAndLoadFromAPI();
        this.updateCarrousel();
      });
    } catch (error) {
      console.error('Error loading RushCarrousel component:', error);
    }
  }

  async checkAndLoadFromAPI() {
    // Check if api-source attribute is present and not empty
    const apiSource = this.getAttribute('api-source');
    if (apiSource !== null && apiSource !== 'false') {
      await this.loadGamesFromAPI();
    }
  }

  async loadGamesFromAPI() {
    if (this.isLoadingAPI) return; // Prevent multiple simultaneous API calls

    this.isLoadingAPI = true;

    try {
      // Store existing manual cards before showing loading
      const existingCards = Array.from(this.querySelectorAll('rushgame-card')).map((card) =>
        card.cloneNode(true)
      );

      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const games = await response.json();
      this.gamesData = games;

      // Process games based on category or other filters
      const processedGames = this.filterGamesByCategory(games);

      // Generate cards from API data, preserving existing cards
      this.generateCardsFromAPI(processedGames, existingCards);
    } catch (error) {
      console.error('Error loading games from API:', error);
      this.showErrorState();
    } finally {
      this.isLoadingAPI = false;
    }
  }

  filterGamesByCategory(games) {
    const category = this.getAttribute('category');
    const maxGames = parseInt(this.getAttribute('max-games')) || 10;

    let filteredGames = games;

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredGames = games.filter(
        (game) =>
          game.genres &&
          game.genres.some((genre) => genre.name.toLowerCase() === category.toLowerCase())
      );
    }

    // Limit number of games
    return filteredGames.slice(0, maxGames);
  }

  generateCardsFromAPI(games, existingCards = []) {
    this.innerHTML = '';

    // First, add back the existing manual cards
    existingCards.forEach((card) => {
      this.appendChild(card);
    });

    // Then create rushgame-card elements for each game from API
    games.forEach((game) => {
      const card = document.createElement('rushgame-card');

      // Set attributes based on API data
      card.setAttribute('game-id', game.id.toString());
      card.setAttribute('title', game.name);
      card.setAttribute('image', game.background_image_low_res || game.background_image);
      card.setAttribute('rating', game.rating.toString());

      // Add category as data attribute if available
      if (game.genres && game.genres.length > 0) {
        card.setAttribute('category', game.genres[0].name);
      }

      this.appendChild(card);
    });
  }

  showErrorState() {
    // Remove only API-generated cards, keep manual cards
    const manualCards = Array.from(this.querySelectorAll('rushgame-card')).filter((card) => {
      // Keep cards that don't have numeric game-id (manual cards)
      const gameId = card.getAttribute('game-id');
      return gameId && isNaN(parseInt(gameId));
    });

    // Clear all content
    this.innerHTML = '';

    // Add back manual cards
    manualCards.forEach((card) => {
      this.appendChild(card);
    });

    // Create error indicator
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error';
    errorDiv.innerHTML = '<p>Error al cargar los juegos. Intenta nuevamente.</p>';
    this.appendChild(errorDiv);
  }

  setupElements() {
    // Configure the references to elements of the Shadow DOM
    this.track = this.shadowRoot.querySelector('#carrouselTrack');
    this.prevBtn = this.shadowRoot.querySelector('#prevBtn');
    this.nextBtn = this.shadowRoot.querySelector('#nextBtn');
    this.container = this.shadowRoot.querySelector('.carrousel-container');
    this.titleElement = this.shadowRoot.querySelector('.carrousel-title');
  }

  updateTitle(title) {
    // Update the title text in the carousel header
    if (this.titleElement && title) {
      this.titleElement.textContent = title;
    }
  }

  setupEventListeners() {
    // Configure event listeners for navigation buttons
    if (this.prevBtn && this.nextBtn) {
      this.prevBtn.addEventListener('click', () => this.goToPrevious());
      this.nextBtn.addEventListener('click', () => this.goToNext());
    }

    // Add resize listener for responsive behavior
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    // Start observing the container for size changes
    if (this.container) {
      this.resizeObserver.observe(this.container);
    }

    // Also listen to window resize as backup
    window.addEventListener('resize', () => this.handleResize());
  }

  setupSlotObserver() {
    /**
     * Set up the slot observer to detect changes in the cards
     * It runs when cards are added, removed, or changed in the carousel
     */
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => {
      // Wait for a frame to ensure elements are fully rendered
      requestAnimationFrame(() => {
        this.updateCardCount();
        this.updateCarrousel();
      });
    });

    // Also check immediate content (in case cards are already present)
    setTimeout(() => {
      this.updateCardCount();
      this.updateCarrousel();
    }, 100);
  }

  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateResponsiveCards();
      this.updateCarrousel();
    }, 100);
  }

  updateResponsiveCards() {
    const width = window.innerWidth;
    const wasMobile = this.isMobile;
    const wasTablet = this.isTablet;

    // Determine device type
    this.isMobile = width <= 480;
    this.isTablet = width > 480 && width <= 768;

    // Auto-adjust cards to show based on screen size
    if (this.isMobile) {
      // On mobile, show 1-2 cards depending on device width
      this.cardsToShow = width <= 360 ? 1 : 2;
    } else if (this.isTablet) {
      // Tablet: show 2-3 cards based on available space
      this.cardsToShow = width <= 600 ? 2 : 3;
    } else {
      // Large desktop: use original setting or default
      this.cardsToShow = this.originalCardsToShow;
    }

    // If we switched device types, reset scroll position
    if (wasMobile !== this.isMobile || wasTablet !== this.isTablet) {
      this.currentIndex = 0;
      if (this.track) {
        this.track.scrollLeft = 0;
      }
    }
  }

  updateCarrousel() {
    // Update card count, navigation buttons, and track position
    this.updateCardCount();
    this.updateNavigationButtons();
    this.updateTrackPosition();
  }

  updateCardCount() {
    // Count the rushgame-card elements that are in the slot
    const slottedElements = this.querySelectorAll('rushgame-card');
    this.totalCards = slottedElements.length;

    // Calculate the maximum index: total cards minus those shown at once
    this.maxIndex = Math.max(0, this.totalCards - this.cardsToShow);

    // Reset current index if it's out of bounds
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
  }

  updateNavigationButtons() {
    // Disable previous button if we're at the start
    this.prevBtn.disabled = this.currentIndex === 0;

    // Disable next button if we're at the end
    this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
  }

  updateTrackPosition() {
    /**
     * Updates the position of the track using transform translateX
     * This function moves the cards horizontally
     * On mobile devices, we rely on native scroll instead
     */

    // Do not update if a transition is in progress
    if (this.isTransitioning) return;

    // On mobile, let native scroll handle the positioning
    // On tablet (768px), use transform-based navigation
    if (this.isMobile) {
      return;
    }

    // Get the width of a card and the space between cards
    const cardWidth = this.getCardWidth();
    const gap = this.getGapValue();

    // Calculate how much to move: current index × (card width + gap)
    const translateX = -(this.currentIndex * (cardWidth + gap));

    // Apply the CSS transform
    if (this.track) {
      this.track.style.transform = `translateX(${translateX}px)`;
    }
  }

  getCardWidth() {
    const slottedElements = this.querySelectorAll('rushgame-card');
    if (slottedElements.length > 0) {
      const firstCard = slottedElements[0];
      // Use offsetWidth which includes padding and border
      return firstCard.offsetWidth || 243; // 243px is the default width
    }
    return 243; // default width if no cards
  }

  getGapValue() {
    // Get the gap value from CSS
    if (this.track) {
      const computedStyle = getComputedStyle(this.track);
      const gap = parseFloat(computedStyle.gap) || 24; // 24px is the default
      return gap;
    }
    return 24;
  }

  animateCards(direction) {
    // Get all visible game cards
    const cards = this.querySelectorAll('rushgame-card');
    if (!cards || cards.length === 0) return;

    // Get all cards that are currently visible in the viewport
    let cardsToAnimate = [];

    if (this.isMobile) {
      cardsToAnimate = Array.from(cards);
    } else {
      const containerRect = this.container?.getBoundingClientRect();

      if (containerRect) {
        cards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          // Check if card is at least partially visible in the container
          const isVisible =
            cardRect.right > containerRect.left && cardRect.left < containerRect.right;

          if (isVisible) {
            cardsToAnimate.push(card);
          }
        });
      } else {
        const startIndex = this.currentIndex;
        const endIndex = Math.min(this.currentIndex + this.cardsToShow, cards.length);

        for (let i = startIndex; i < endIndex; i++) {
          if (cards[i]) {
            cardsToAnimate.push(cards[i]);
          }
        }
      }
    }

    // Apply animation to all visible cards
    cardsToAnimate.forEach((card, index) => {
      const staggerDelay = this.isMobile ? 50 : 100;

      // Stagger the animation slightly for each card
      setTimeout(() => {
        // Call the appropriate animation method on the card
        if (direction === 'next') {
          card.rotateLeft();
        } else if (direction === 'prev') {
          card.rotateRight();
        }
      }, index * staggerDelay);
    });
  }

  goToNext() {
    // Only on mobile (≤480px), navigation buttons are hidden
    if (this.isMobile) return;

    // Do not do anything if a transition is in progress
    if (this.isTransitioning) return;

    // Trigger card rotation animation before moving
    this.animateCards('next');

    // Do not go beyond the maximum index
    this.currentIndex = Math.min(this.currentIndex + 1, this.maxIndex);

    // Animate to the new position with a slight delay to let card animation start
    setTimeout(() => {
      this.animateToIndex();
    }, 150);
  }

  goToPrevious() {
    // Only on mobile (≤480px), navigation buttons are hidden
    if (this.isMobile) return;

    // Do not do anything if a transition is in progress
    if (this.isTransitioning) return;

    // Trigger card rotation animation before moving
    this.animateCards('prev');

    // Do not go back beyond index 0
    this.currentIndex = Math.max(this.currentIndex - 1, 0);

    // Animate to the new position with a slight delay to let card animation start
    setTimeout(() => {
      this.animateToIndex();
    }, 150);
  }

  animateToIndex() {
    // FIRST: Update track position and button states BEFORE setting transition flag
    this.updateTrackPosition();
    this.updateNavigationButtons();

    // THEN: Set the transitioning flag and add CSS class for transition
    this.isTransitioning = true;
    this.track.classList.add('transitioning');

    // Reset the transitioning flag after the CSS animation ends (300ms)
    setTimeout(() => {
      this.isTransitioning = false;
      this.track.classList.remove('transitioning');
    }, 300);
  }

  connectedCallback() {
    this.init().then(() => {
      // Initialize responsive behavior after component is fully loaded
      this.updateResponsiveCards();
      this.updateCarrousel();
    });
  }

  disconnectedCallback() {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Clean up resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Remove window resize listener
    window.removeEventListener('resize', () => this.handleResize());
  }

  static get observedAttributes() {
    return ['cards-to-show', 'title', 'api-source', 'category', 'max-games'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // dont do anything if the value hasn't changed
    if (oldValue === newValue) return;

    switch (name) {
      case 'cards-to-show':
        // Update the number of cards to show and recalculate the carousel
        this.cardsToShow = parseInt(newValue) || 4;
        if (this.shadowRoot) {
          // Only update if component is initialized
          this.updateCarrousel();
        }
        break;
      case 'title':
        // Store the title value
        this.titleValue = newValue;
        // Update the title text only if the component is initialized
        if (this.titleElement) {
          this.updateTitle(newValue);
        }
        break;
      case 'api-source':
        // Reload from API if the attribute changed
        if (this.shadowRoot && newValue !== null && newValue !== 'false') {
          this.checkAndLoadFromAPI();
        }
        break;
      case 'category':
      case 'max-games':
        // Reload from API if category or max-games changed and API is enabled
        if (
          this.shadowRoot &&
          this.getAttribute('api-source') !== null &&
          this.getAttribute('api-source') !== 'false'
        ) {
          this.checkAndLoadFromAPI();
        }
        break;
    }
  }
}

customElements.define('rushgame-carrousel', RushGameCarrousel);
