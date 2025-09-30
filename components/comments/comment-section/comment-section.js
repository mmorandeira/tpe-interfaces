// components/comments/comment-section/comment-section.js
class CommentSection extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    // Cargar template y estilos (ajustá rutas si movés archivos)
    const [html, css] = await Promise.all([
      fetch("./components/comments/comment-section/comment-section.html").then(r => r.text()),
      fetch("./components/comments/comment-section/comment-section.css").then(r => r.text())
    ]);

    this._root.innerHTML = `<style>${css}</style>${html}`;

    // ✅ ahora sí: root existe
    const root = this._root;
    const list = root.getElementById("list");

    // Mock de comentarios (luego lo reemplazás por tu servicio)
    const comments = [
      { id: "1", author: "mxr_", when: "hoy 16:42", body: "Texto del comentario…", replies: [] },
      { id: "2", author: "ana",  when: "ayer",      body: "Otro comentario…",     replies: [] },
    ];

    function render() {
      list.innerHTML = "";
      const frag = document.createDocumentFragment();
      for (const c of comments) {
        const li = document.createElement("li");

        // Si ya tenés registrado <comment-item>, usalo:
        const item = document.createElement("comment-item");
        item.setAttribute("author", c.author);
        item.setAttribute("when",   c.when);
        item.setAttribute("body",   c.body);
        item.replies = c.replies;

        li.appendChild(item);

        frag.appendChild(li);
      }
      list.appendChild(frag);
    }

    render();
  }
}

customElements.define("comment-section", CommentSection);