class ActionRow extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }
  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/action-row/action-row.html').then((r) => r.text()),
      fetch('./components/comments/action-row/action-row.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);
    this._primary = $('primary');
    this._secondary = $('secondary');

    this._applyLabels();
    this._primary.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('action:primary', { bubbles: true }))
    );
    this._secondary.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('action:secondary', { bubbles: true }))
    );
  }
  static get observedAttributes() {
    return ['primary-label', 'secondary-label', 'hide-secondary'];
  }
  attributeChangedCallback() {
    this._applyLabels?.();
  }
  _applyLabels() {
    if (!this._primary) return;
    this._primary.textContent = this.getAttribute('primary-label') || 'Primary';
    this._secondary.textContent = this.getAttribute('secondary-label') || 'Secondary';
    this._secondary.classList.toggle('hidden', this.hasAttribute('hide-secondary'));
  }
}
customElements.define('action-row', ActionRow);
