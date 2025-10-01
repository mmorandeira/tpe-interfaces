class CommentSection extends HTMLElement {
  constructor(){ super(); this._root = this.attachShadow({mode:'open'}); }

  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch("./components/comments/comment-section/comment-section.html").then(r => r.text()),
      fetch("./components/comments/comment-section/comment-section.css").then(r => r.text())
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;

    const root = this._root;
    const list = root.getElementById("list");
    const composer = root.querySelector("comment-composer");
    const counter = root.getElementById("count"); // si lo añadiste

    // Mock de comentarios
    const comments = [
      { id:"1", author:"mxr_", when:"hoy 16:42", body:"Texto del comentario…", avatar:"./assets/avatar.svg", replies:[] },
      { id:"2", author:"ana",  when:"ayer",      body:"Otro comentario…",     avatar:"./assets/avatar.svg", replies:[] },
    ];

    const render = () => {
      list.innerHTML = "";
      const frag = document.createDocumentFragment();
      for (const c of comments){
        const li = document.createElement("li");
        const item = document.createElement("comment-item");
        item.setAttribute("author", c.author);
        item.setAttribute("when",   c.when);
        item.setAttribute("body",   c.body);
        if (c.avatar) item.setAttribute("avatar", c.avatar);
        li.appendChild(item);
        frag.appendChild(li);
      }
      list.appendChild(frag);
      if (counter) counter.textContent = comments.length; // 🔢
    };

    // ⬅️ alta de comentario nuevo
    composer?.addEventListener('comment:submit', (ev) => {
      const { text } = ev.detail;
      comments.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        author: "vos",
        when: "ahora",
        body: text,
        avatar: "./assets/avatar.svg",
        replies: []
      });
      render();
    });

    render();
  }
}
customElements.define("comment-section", CommentSection);
