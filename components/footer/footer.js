class MyFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.init();
  }

  async init() {
    Promise.all([
      fetch('./components/footer/footer.html').then((res) => res.text()),
      fetch('./components/footer/footer.css').then((res) => res.text()),
    ]).then(([html, css]) => {
      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="footer-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;
      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);
    });
  }
}

customElements.define('rushgame-footer', MyFooter);
