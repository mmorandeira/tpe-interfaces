class CommentItem extends HTMLElement {
    constructor() { super(); this._root = this.attachShadow({ mode: 'open' }); }

    async connectedCallback() {
        const [html, css] = await Promise.all([
            fetch("./components/comments/comment-item/comment-item.html").then(r => r.text()),
            fetch("./components/comments/comment-item/comment-item.css").then(r => r.text())
        ]);
        this._root.innerHTML = `<style>${css}</style>${html}`;

        const $ = (ref) => this._root.querySelector(`[data-ref="${ref}"]`);

        const author = this.getAttribute('author') || '';
        const when = this.getAttribute('when') || '';
        const body = this.getAttribute('body') || '';
        const avatar = this.getAttribute('avatar') || './assets/avatar.svg';

        $('author').textContent = author;
        $('when').textContent = when;
        $('body').textContent = body;

        const img = $('avatar');
        img.src = avatar;
        img.alt = author || "avatar";

        img.addEventListener('error', () => { img.src = './assets/avatar.png'; });
        const moreBtn = $('more');
        const bodyEl = $('body');
        const maxLines = parseInt(this.getAttribute('max-lines') || '3', 10);
        bodyEl.style.setProperty('--max-lines', maxLines);

        const applyClamp = () => {
            // aplicar clamp por defecto
            bodyEl.classList.add('clamped');
            // si realmente hay overflow, mostramos el botón
            moreBtn.hidden = !(bodyEl.scrollHeight > bodyEl.clientHeight + 1);
            // si quitamos overflow (p.ej. redimensionando), aseguramos texto plegado
            if (moreBtn.hidden) {
                bodyEl.classList.add('clamped');
                moreBtn.textContent = 'Ver más';
            }
        };

        moreBtn.addEventListener('click', () => {
            const isClamped = bodyEl.classList.toggle('clamped'); // alterna
            moreBtn.textContent = isClamped ? 'Ver más' : 'Ver menos';
        });

        // recalcular ante cambios de ancho
        this._resizeHandler = () => applyClamp();
        window.addEventListener('resize', this._resizeHandler, { passive: true });

        // aplicar al montar (espera un microtask para que calcule tamaños)
        queueMicrotask(applyClamp);
        this._resizeHandler = () => applyClamp();
        window.addEventListener('resize', this._resizeHandler, { passive: true });
    }

    disconnectedCallback() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);

    }
}
customElements.define('comment-item', CommentItem);