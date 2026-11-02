document.addEventListener("DOMContentLoaded", () => {
  /* ===== Modal Perfil (Capa / Avatar / Bio) ===== */
  const modalPerfil = document.getElementById("modal-perfil");
  const btnAbrirPerfil = document.getElementById("btn-abrir-perfil");
  const btnFecharPerfil = document.getElementById("btn-fechar-perfil");
  const formPerfil = document.getElementById("form-perfil");

  const fotoCapaEl = document.getElementById("foto-capa");
  const fotoAvatarEl = document.getElementById("foto-avatar");
  const bioPerfilEl = document.getElementById("bio-perfil");
  const inputBio = document.getElementById("input-bio");

  btnAbrirPerfil?.addEventListener("click", () => {
    if (inputBio && bioPerfilEl) {
      inputBio.value = bioPerfilEl.textContent.trim();
    }
    modalPerfil?.removeAttribute("hidden");
  });

  btnFecharPerfil?.addEventListener("click", () => modalPerfil?.setAttribute("hidden", ""));

  function carregarPerfilSalvo() {
    const perfilSalvo = JSON.parse(localStorage.getItem("perfil_diario") || "{}");
    if (perfilSalvo.capa && fotoCapaEl) fotoCapaEl.src = perfilSalvo.capa;
    if (perfilSalvo.avatar && fotoAvatarEl) fotoAvatarEl.src = perfilSalvo.avatar;
    if (perfilSalvo.bio && bioPerfilEl) bioPerfilEl.textContent = perfilSalvo.bio;
  }

  carregarPerfilSalvo();

  formPerfil?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileCapa = document.getElementById("input-foto-capa")?.files[0];
    const fileAvatar = document.getElementById("input-foto-avatar")?.files[0];
    const novaBio = inputBio?.value;

    const perfilSalvo = JSON.parse(localStorage.getItem("perfil_diario") || "{}");

    if (fileCapa) perfilSalvo.capa = await converterImagemParaBase64(fileCapa);
    if (fileAvatar) perfilSalvo.avatar = await converterImagemParaBase64(fileAvatar);
    if (novaBio !== undefined && novaBio !== "") perfilSalvo.bio = novaBio;

    localStorage.setItem("perfil_diario", JSON.stringify(perfilSalvo));
    carregarPerfilSalvo();

    formPerfil.reset();
    modalPerfil?.setAttribute("hidden", "");
  });

  /* ===== Modal de Notas & Diário ===== */
  const modalNota = document.getElementById("modal-nota");
  const btnAbrirNota = document.getElementById("btn-abrir-modal");
  const btnFecharNota = document.getElementById("btn-fechar-modal");
  const formNota = document.getElementById("form-nota");
  const containerDiario = document.querySelector(".diario");
  const galeriaMemorias = document.getElementById("galeria-memorias");
  const modalTituloTexto = document.getElementById("modal-titulo-texto");
  const notaIdInput = document.getElementById("nota-id");

  const inputImagem = document.getElementById("imagem-nota");
  const previewContainer = document.getElementById("preview-container");
  const avisoLimiteFotos = document.getElementById("aviso-limite-fotos");

  const LIMITE_IMAGENS = 4;
  const TAMANHO_MAX_MB = 2;

  function resetarFormulario() {
    formNota.reset();
    notaIdInput.value = "";
    if (previewContainer) {
      previewContainer.innerHTML = "";
      previewContainer.style.display = "none";
    }
    if (avisoLimiteFotos) avisoLimiteFotos.style.display = "none";
    if (modalTituloTexto) modalTituloTexto.textContent = "Nova Página do Diário";
  }

  btnAbrirNota?.addEventListener("click", () => {
    resetarFormulario();
    modalNota?.removeAttribute("hidden");
  });

  btnFecharNota?.addEventListener("click", () => modalNota?.setAttribute("hidden", ""));

  // Preview em tempo real ao selecionar arquivos
  inputImagem?.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (avisoLimiteFotos) avisoLimiteFotos.style.display = "none";

    if (files.length > LIMITE_IMAGENS) {
      if (avisoLimiteFotos) {
        avisoLimiteFotos.textContent = `⚠️ Não é possível adicionar mais fotos! Limite: máximo de ${LIMITE_IMAGENS} imagens (até ${TAMANHO_MAX_MB}MB por foto).`;
        avisoLimiteFotos.style.display = "block";
      }
      inputImagem.value = "";
      return;
    }

    for (const file of files) {
      if (file.size > TAMANHO_MAX_MB * 1024 * 1024) {
        if (avisoLimiteFotos) {
          avisoLimiteFotos.textContent = `⚠️ A foto "${file.name}" ultrapassa o limite de ${TAMANHO_MAX_MB}MB.`;
          avisoLimiteFotos.style.display = "block";
        }
        inputImagem.value = "";
        return;
      }
    }

    if (previewContainer) previewContainer.innerHTML = "";

    for (const file of files) {
      const base64 = await converterImagemParaBase64(file);
      if (previewContainer) {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `<img src="${base64}" alt="Preview">`;
        previewContainer.appendChild(item);
      }
    }

    if (previewContainer && files.length > 0) {
      previewContainer.style.display = "grid";
    }
  });

  function obterNotas() {
    return JSON.parse(localStorage.getItem("notas_diario") || "[]");
  }

  function salvarNotas(notas) {
    localStorage.setItem("notas_diario", JSON.stringify(notas));
    atualizarGaleriaMemorias(notas);
  }

  function converterImagemParaBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  function atualizarGaleriaMemorias(notas) {
    if (!galeriaMemorias) return;
    galeriaMemorias.innerHTML = "";

    notas.forEach((nota) => {
      const listaImagens = Array.isArray(nota.imagens)
        ? nota.imagens
        : nota.imagem
        ? [nota.imagem]
        : [];

      listaImagens.forEach((imgSrc) => {
        const figure = document.createElement("figure");
        figure.className = "polaroid";
        figure.innerHTML = `
          <span class="fita" aria-hidden="true"></span>
          <img src="${imgSrc}" alt="${nota.titulo}">
          <figcaption>${nota.titulo}</figcaption>
        `;
        galeriaMemorias.appendChild(figure);
      });
    });
  }

  function renderizarNotaNaTela(nota, noTopo = false) {
    if (!containerDiario) return;

    const elementoExistente = document.querySelector(`article[data-id="${nota.id}"]`);
    const novoArticle = document.createElement("article");
    novoArticle.className = "pagina";
    novoArticle.setAttribute("data-id", nota.id);

    const listaImagens = Array.isArray(nota.imagens)
      ? nota.imagens
      : nota.imagem
      ? [nota.imagem]
      : [];

    let htmlImagens = "";
    if (listaImagens.length > 0) {
      const imgsHtml = listaImagens
        .map((img) => `<figure class="foto-moldura"><img src="${img}" alt="${nota.titulo}"></figure>`)
        .join("");
      htmlImagens = `<div class="grid-fotos-post">${imgsHtml}</div>`;
    }

    const curtidoClass = nota.curtido ? "curtido" : "";
    const iconeCoracao = nota.curtido ? "❤️" : "🤍";

    novoArticle.innerHTML = `
      <header class="pagina__cab">
        <time>${nota.data}</time>
        <h3>${nota.titulo}</h3>
      </header>
      <p>${nota.texto}</p>
      ${htmlImagens}
      
      <footer class="tumblr-post-footer">
        <div class="tumblr-acoes-sociais">
          <button class="btn-social-estatico" title="Repostar" disabled>🔁</button>
          <button class="btn-social-estatico" title="Comentar" disabled>💬</button>
          <button class="btn-like ${curtidoClass}" title="Curtir">
            <span class="btn-like__icone">${iconeCoracao}</span>
            <span class="btn-like__contador">${nota.likes || 0}</span>
          </button>
        </div>
        <div class="acoes-nota">
          <button class="btn-editar-nota">✏️ Editar</button>
          <button class="btn-excluir-nota">🗑️ Excluir</button>
        </div>
      </footer>
    `;

    // Interatividade do botão de Like
    const btnLike = novoArticle.querySelector(".btn-like");
    btnLike?.addEventListener("click", () => {
      let notas = obterNotas();
      notas = notas.map((n) => {
        if (n.id === nota.id) {
          const jaCurtido = n.curtido || false;
          const numLikes = n.likes || 0;
          return {
            ...n,
            curtido: !jaCurtido,
            likes: jaCurtido ? Math.max(0, numLikes - 1) : numLikes + 1
          };
        }
        return n;
      });

      salvarNotas(notas);
      const notaAtualizada = notas.find((n) => n.id === nota.id);
      if (notaAtualizada) renderizarNotaNaTela(notaAtualizada);
    });

    // Exclusão de Nota
    novoArticle.querySelector(".btn-excluir-nota")?.addEventListener("click", () => {
      if (confirm("Deseja apagar esta página do diário?")) {
        const notas = obterNotas().filter((n) => n.id !== nota.id);
        salvarNotas(notas);
        novoArticle.remove();
      }
    });

    // Edição de Nota
    novoArticle.querySelector(".btn-editar-nota")?.addEventListener("click", () => {
      document.getElementById("titulo-nota").value = nota.titulo;
      document.getElementById("texto-nota").value = nota.texto;
      notaIdInput.value = nota.id;

      if (previewContainer) {
        previewContainer.innerHTML = "";
        listaImagens.forEach((img) => {
          const item = document.createElement("div");
          item.className = "preview-item";
          item.innerHTML = `<img src="${img}" alt="Preview">`;
          previewContainer.appendChild(item);
        });
        previewContainer.style.display = listaImagens.length > 0 ? "grid" : "none";
      }

      if (modalTituloTexto) modalTituloTexto.textContent = "Editar Página do Diário";
      modalNota?.removeAttribute("hidden");
    });

    if (elementoExistente) {
      elementoExistente.replaceWith(novoArticle);
    } else if (noTopo) {
      const tituloSecao = containerDiario.querySelector(".secao-titulo");
      if (tituloSecao && tituloSecao.nextSibling) {
        containerDiario.insertBefore(novoArticle, tituloSecao.nextSibling);
      } else {
        containerDiario.appendChild(novoArticle);
      }
    } else {
      containerDiario.appendChild(novoArticle);
    }
  }

  function carregarNotas() {
    const notasSalvas = obterNotas();
    notasSalvas.forEach((nota) => renderizarNotaNaTela(nota, false));
    atualizarGaleriaMemorias(notasSalvas);
  }

  carregarNotas();

  // Submissão do Formulário de Notas (Processa todos os arquivos selecionados)
  formNota?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idExistente = notaIdInput.value;
    const titulo = document.getElementById("titulo-nota")?.value || "";
    const texto = document.getElementById("texto-nota")?.value || "";
    const filesInput = Array.from(inputImagem?.files || []);

    try {
      let imagensFinal = [];

      if (filesInput.length > 0) {
        imagensFinal = await Promise.all(filesInput.map((file) => converterImagemParaBase64(file)));
      } else if (idExistente) {
        const notaAntiga = obterNotas().find((n) => n.id === Number(idExistente));
        if (notaAntiga) {
          imagensFinal = Array.isArray(notaAntiga.imagens)
            ? notaAntiga.imagens
            : notaAntiga.imagem
            ? [notaAntiga.imagem]
            : [];
        }
      }

      let notas = obterNotas();

      if (idExistente) {
        notas = notas.map((n) => {
          if (n.id === Number(idExistente)) {
            return { ...n, titulo, texto, imagens: imagensFinal };
          }
          return n;
        });
        salvarNotas(notas);
        const notaEditada = notas.find((n) => n.id === Number(idExistente));
        if (notaEditada) renderizarNotaNaTela(notaEditada);
      } else {
        const novaNota = {
          id: Date.now(),
          data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
          titulo,
          texto,
          imagens: imagensFinal,
          likes: 0,
          curtido: false
        };

        notas.unshift(novaNota);
        salvarNotas(notas);
        renderizarNotaNaTela(novaNota, true);
      }

      resetarFormulario();
      modalNota?.setAttribute("hidden", "");
    } catch (erro) {
      alert("Erro ao processar a nota.");
    }
  });
});