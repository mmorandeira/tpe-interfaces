class RushBreadcrumb extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Breadcrumb data
    this.breadcrumbData = {
      items: [{ label: 'Home', url: '/' }],
    };

    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/breadcrumb/breadcrumb.html').then((res) => res.text()),
        fetch('./components/breadcrumb/breadcrumb.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="breadcrumb-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushBreadcrumb component:', error);
    }
  }

  setupElements() {
    this.breadcrumbList = this.shadowRoot.querySelector('.breadcrumb-list');
  }

  updateDisplay() {
    if (!this.breadcrumbList) return;

    // Clear existing items
    this.breadcrumbList.innerHTML = '';

    // Create breadcrumb items
    this.breadcrumbData.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';

      const isLast = index === this.breadcrumbData.items.length - 1;

      if (isLast) {
        // Last item is not a link
        li.innerHTML = `<span class="breadcrumb-current">${item.label}</span>`;
        li.setAttribute('aria-current', 'page');
      } else {
        // Create link for navigation
        li.innerHTML = `
                    <a href="${item.url}" class="breadcrumb-link">${item.label}</a>
                    <span class="breadcrumb-separator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                `;
      }

      this.breadcrumbList.appendChild(li);
    });
  }

  // Method to add items programmatically
  addItem(label, url) {
    this.breadcrumbData.items.push({ label, url });
    this.updateDisplay();
  }

  // Method to set all items at once
  setItems(items) {
    this.breadcrumbData.items = items;
    this.updateDisplay();
  }

  static get observedAttributes() {
    return ['items'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'items') {
      try {
        this.breadcrumbData.items = JSON.parse(newValue);
        this.updateDisplay();
      } catch (e) {
        console.error('Error parsing breadcrumb items:', e);
      }
    }
  }

  connectedCallback() {
    console.log('RushBreadcrumb connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushBreadcrumb disconnected from DOM');
  }
}
//set breadcrumb items
// Opción 1: Usando atributo
const breadcrumb = document.getElementById('gameBreadcrumb');
const items = [
  { label: 'Home', url: '/index.html' },
  { label: 'Acción', url: '/categoria-accion.html' },
  { label: 'Green Lantern', url: '#' },
];
breadcrumb.setAttribute('items', JSON.stringify(items));

// Opción 2: Usando método setItems (después de que el componente esté cargado)
setTimeout(() => {
  breadcrumb.setItems([
    { label: 'Home', url: '/index.html' },
    { label: 'Acción', url: '/categoria-accion.html' },
    { label: 'Green Lantern', url: '#' },
  ]);
}, 100);

customElements.define('rush-breadcrumb', RushBreadcrumb);
