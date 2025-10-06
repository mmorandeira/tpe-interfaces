class RushGameInstructions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        this.instructionsData = {
            title: 'Instrucciones',
            instructions: []
        };
        
        this.init();
    }

    async init() {
        try {
            const [html, css] = await Promise.all([
                fetch("./components/game-instructions/game_instructions.html").then(res => res.text()),
                fetch("./components/game-instructions/game_instructions.css").then(res => res.text())
            ]);

            const template = document.createElement("template");
            template.innerHTML = `
                <style>${css}</style>
                ${html.replace('<template id="game-instructions-template">', '').replace('</template>', '').replace(/<style>.*?<\/style>/s, '')}
            `;
            
            const content = template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);
            
            this.setupElements();
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error loading RushGameInstructions component:', error);
        }
    }

    setupElements() {
        this.instructionsTitle = this.shadowRoot.querySelector('#instructionsTitle');
        this.instructionsList = this.shadowRoot.querySelector('.instructions-list');
    }

    updateDisplay() {
        if (!this.instructionsList) return;

        if (this.instructionsTitle) {
            this.instructionsTitle.textContent = this.instructionsData.title;
        }

        this.instructionsList.innerHTML = '';

        this.instructionsData.instructions.forEach((instruction) => {
            const instructionItem = document.createElement('div');
            instructionItem.className = 'instruction-item';
            
            instructionItem.innerHTML = `
                <div class="instruction-icon">
                    ${this.renderIcon(instruction.type, instruction.iconData)}
                </div>
                <p class="instruction-text">${instruction.text}</p>
            `;
            
            this.instructionsList.appendChild(instructionItem);
        });
    }

    renderIcon(type, iconData = {}) {
        switch(type) {
            case 'mouse':
                // SVG simple de mouse
                return `
                    <svg width="48" height="70" viewBox="0 0 48 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="10" width="40" height="56" rx="20" fill="var(--neutral-surface-variant)" stroke="var(--rushgames-primary)" stroke-width="4"/>
                      <rect x="20" y="10" width="8" height="20" rx="4" fill="var(--rushgames-primary)" />
                      <circle cx="24" cy="45" r="5" fill="var(--rushgames-primary)" />
                    </svg>
                `;
            
            case 'click':
                return `
                    <div class="icon-chart">
                        <div class="chart-segment segment-green" style="--angle: ${iconData.angle || 90}deg"></div>
                        <div class="chart-center"></div>
                    </div>
                `;
            
            case 'move':
                return `
                    <div class="icon-circles">
                        <div class="circle circle-green"></div>
                        <div class="circle circle-green"></div>
                        <div class="circle circle-gray"></div>
                    </div>
                `;
            
            case 'jump':
                return `
                    <div class="icon-circles">
                        <div class="circle circle-gray"></div>
                        <div class="circle circle-gray"></div>
                        <div class="circle circle-green"></div>
                    </div>
                `;
            
            case 'objective':
                return `
                    <div class="icon-target">
                        <div class="circle circle-green large"></div>
                    </div>
                `;
            
            case 'coins':
                return `
                    <div class="icon-coin">
                        <div class="coin">
                            <span class="coin-text">R</span>
                        </div>
                    </div>
                `;
            
            default:
                return `<div class="circle circle-green"></div>`;
        }
    }

    setInstructions(instructions) {
        this.instructionsData.instructions = instructions;
        this.updateDisplay();
    }

    setTitle(title) {
        this.instructionsData.title = title;
        if (this.instructionsTitle) {
            this.instructionsTitle.textContent = title;
        }
    }

    static get observedAttributes() {
        return ['title', 'instructions'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'title':
                this.instructionsData.title = newValue || 'Instrucciones';
                if (this.instructionsTitle) {
                    this.instructionsTitle.textContent = this.instructionsData.title;
                }
                break;
            case 'instructions':
                try {
                    this.instructionsData.instructions = JSON.parse(newValue) || [];
                    this.updateDisplay();
                } catch (e) {
                    console.error('Error parsing instructions:', e);
                }
                break;
        }
    }

    connectedCallback() {
        console.log('RushGameInstructions connected to DOM');
    }

    disconnectedCallback() {
        console.log('RushGameInstructions disconnected from DOM');
    }
      
}
      
  setTimeout(() => {
        const instructions = [
            { type: 'mouse', text: 'Haz clic izquierdo para seleccionar o interactuar.' },
            { type: 'move', text: 'Selecciona una ficha y movela a un espacio vacio' },
            { type: 'jump', text: 'Salta sobre una ficha para eliminarla.' },
            { type: 'objective', text: 'El objetivo del juego es dejar una sola ficha en el tablero.' },
            { type: 'coins', text: 'Podes usar tus RushCoins para deshacer una jugada.' }
        ];
        const gameInstructions = document.querySelector('rush-game-instructions');
        if (gameInstructions) {
            gameInstructions.setTitle('¿Cómo jugar?');
            gameInstructions.setInstructions(instructions);
        }
    }, 100);


customElements.define("rush-game-instructions", RushGameInstructions);