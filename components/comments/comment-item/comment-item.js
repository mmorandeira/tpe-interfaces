class CommentItem extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });

    this.ready = new Promise((resolve) => (this._resolveReady = resolve));
  }

  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/comment-item/comment-item.html').then((r) => r.text()),
      fetch('./components/comments/comment-item/comment-item.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);

    const author = this.getAttribute('author') || '';
    const when = this.getAttribute('when') || '';
    const body = this.getAttribute('body') || '';
    const avatar = this.getAttribute('avatar') || './assets/avatar.svg';

    $('author').textContent = author;
    $('when').textContent = when;

    const bodyEl = $('body');
    bodyEl.textContent = body;
    bodyEl.style.whiteSpace = 'pre-wrap';

    const img = $('avatar');
    img.src = avatar;
    img.alt = author || 'avatar';
    img.addEventListener('error', () => {
      img.src = './assets/avatar.svg';
    });

    // Ver más / Ver menos (como lo tenías)
    const moreBtn = $('more');
    const maxLines = parseInt(this.getAttribute('max-lines') || '3', 10);
    bodyEl.style.setProperty('--max-lines', maxLines);
    const applyClamp = () => {
      bodyEl.classList.add('clamped');
      moreBtn.hidden = !(bodyEl.scrollHeight > bodyEl.clientHeight + 1);
      if (moreBtn.hidden) {
        bodyEl.classList.add('clamped');
        moreBtn.textContent = 'Ver más';
      }
    };
    moreBtn.addEventListener('click', () => {
      const isClamped = bodyEl.classList.toggle('clamped');
      moreBtn.textContent = isClamped ? 'Ver más' : 'Ver menos';
    });
    queueMicrotask(applyClamp);
    this._resizeHandler = () => applyClamp();
    window.addEventListener('resize', this._resizeHandler, { passive: true });

    // === Replies integration ===
    this._thread = $('thread');
    this._actions = $('actions');

    // permitir inyectar replies desde afuera
    Object.defineProperty(this, 'replies', {
      set: (arr) => {
        this._thread.replies = arr || [];
        this._updateSecondaryLabel();
      },
      get: () => this._thread.replies,
    });

    // botones: Responder / Ver respuestas (toggle)
    this._actions.addEventListener('action:primary', () => {
      this.openThread();
      this._thread.focusInput();
    });
    this._actions.addEventListener('action:secondary', () => {
      if (this._thread._open) {
        this._thread.close();
        this._updateSecondaryLabel(false);
        this.dispatchEvent(new CustomEvent('thread:close', { bubbles: true }));
      } else {
        this._thread.open();
        this._updateSecondaryLabel(true);
        this.dispatchEvent(new CustomEvent('thread:open', { bubbles: true }));
      }
    });

    // cuando el thread emite reply, redisparamos hacia arriba
    this._thread.addEventListener('reply:submit', (ev) => {
      this.dispatchEvent(
        new CustomEvent('reply:add', { detail: { text: ev.detail.text }, bubbles: true })
      );
    });

    this._actions.addEventListener('action:secondary', () => {
      this._thread.toggle();
      const isOpen = this._thread._open;
      this._updateSecondaryLabel(isOpen);
      this.dispatchEvent(
        new CustomEvent(isOpen ? 'thread:open' : 'thread:close', { bubbles: true })
      );
    });

    this._updateSecondaryLabel(false);
    this._resolveReady?.();
  }

  _updateSecondaryLabel(open) {
    const hasReplies = (this._thread?.replies?.length || 0) > 0;
    const label = open ? 'Ocultar respuestas' : hasReplies ? 'Ver respuestas' : 'Ver respuestas';
    this._actions?.setAttribute('secondary-label', label);
  }

  disconnectedCallback() {
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  }
  openThread() {
    this._thread.open();
    this._updateSecondaryLabel(true);
  }
  setReplies(replies) {
    this._thread.replies = replies || [];
    this._updateSecondaryLabel(this._thread._open);
  }
}
customElements.define('comment-item', CommentItem);
