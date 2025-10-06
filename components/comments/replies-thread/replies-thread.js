class RepliesThread extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._open = false;
    this._replies = [];
  }

  _openedByComposer = false;
  _composing = false;

  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/replies-thread/replies-thread.html').then((r) => r.text()),
      fetch('./components/comments/replies-thread/replies-thread.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);
    this.$ = $;
    this._wrap = $('thread');
    this._list = $('list');
    this._composer = $('composer');
    this._input = $('input');
    this._actions = $('actions');
    this._composer.hidden = true;

    // eventos de acciones (Cancelar/Comentar)
    this._actions.addEventListener('action:secondary', () => this.cancel());
    this._actions.addEventListener('action:primary', () => {
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

  open(opts = {}) {
    this._open = true;
    this._wrap.hidden = false;
    if (opts.by === 'compose') this._openedByComposer = true;
    // 🔔 Notificamos al padre (comment-item) que el estado cambió
    this.dispatchEvent(new CustomEvent('thread:state', { detail: { open: true }, bubbles: true }));
  }

  close() {
    this._open = false;
    this._wrap.hidden = true;
    if (this._composer) this._composer.hidden = true;
    this._composing = false;
    // 🔔 Notificamos cierre
    this.dispatchEvent(new CustomEvent('thread:state', { detail: { open: false }, bubbles: true }));
  }

  toggle() {
    this._open = !this._open;
    this._render();
    // 🔔 Notificamos el nuevo estado
    this.dispatchEvent(
      new CustomEvent('thread:state', { detail: { open: this._open }, bubbles: true })
    );
  }
  focusInput() {
    this.startCompose();
  }
  startCompose() {
    this.open({ by: 'compose' });
    if (this._composer) this._composer.hidden = false;
    this._composing = true;
    // foco en el input si lo expone
    this._input?.focus?.();
  }
  stopCompose({ clear = true } = {}) {
    if (clear) {
      if (this._input?.clear) this._input.clear();
      else if (this._input?.setValue) this._input.setValue('');
      else {
        const ta = this._input?.shadowRoot?.querySelector('textarea');
        if (ta) ta.value = '';
      }
    }
    if (this._composer) this._composer.hidden = true;
    this._composing = false;

    const hasReplies = (this.replies?.length || 0) > 0;
    if (this._openedByComposer && !hasReplies) this.close();
    this._openedByComposer = false;
  }
  cancel() {
    this.stopCompose({ clear: true });
    // Cerrar siempre, como "Ocultar respuestas"
    this.close();
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
