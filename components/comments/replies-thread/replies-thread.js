class RepliesThread extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._open = false;
    this._replies = [];
  }
  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/replies-thread/replies-thread.html').then((r) => r.text()),
      fetch('./components/comments/replies-thread/replies-thread.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);
    this._wrap = $('thread');
    this._list = $('list');
    this._input = $('input');
    this._actions = $('actions');

    // eventos de acciones (Cancelar/Comentar)
    this._actions.addEventListener('action:primary', () => this._input.clear()); // Cancelar
    this._actions.addEventListener('action:secondary', () => {
      const text = this._input.value.trim();
      if (!text) return;
      this.dispatchEvent(new CustomEvent('reply:submit', { detail: { text }, bubbles: true }));
      this._input.clear();
    });

    // render inicial
    this._render();
  }

  set replies(v) {
    this._replies = Array.isArray(v) ? v : [];
    this._render();
  }
  get replies() {
    return this._replies;
  }

  open() {
    this._open = true;
    this._render();
  }
  close() {
    this._open = false;
    this._render();
  }
  toggle() {
    this._open = !this._open;
    this._render();
  }
  focusInput() {
    this._input?.focusInput?.();
  }

  _render() {
    if (!this._wrap) return;
    this._wrap.hidden = !this._open;
    if (!this._open) return;

    this._list.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const r of this._replies || []) {
      const li = document.createElement('li');
      const row = document.createElement('reply-row');
      row.setAttribute('author', r.author || '');
      row.setAttribute('when', r.when || '');
      row.setAttribute('body', r.body || '');
      if (r.avatar) row.setAttribute('avatar', r.avatar);
      li.appendChild(row);
      frag.appendChild(li);
    }
    this._list.appendChild(frag);
  }
}
customElements.define('replies-thread', RepliesThread);
