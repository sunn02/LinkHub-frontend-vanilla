// Configuración inicial
const API_URL = "http://localhost:3005";
const app = document.getElementById("app");

// Manejo de errores HTTP
function handleHTTPError(response) {
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

// Mostrar enlaces
async function showLinks(tagFilter = null) {
  const linksContainer = document.getElementById("links-container");
  const url = tagFilter ? `${API_URL}/links/tags/${tagFilter}` : `${API_URL}/links`;

  try {
    const response = await fetch(url);
    const links = await handleHTTPError(response);
    linksContainer.innerHTML = links.length
      ? links.map(link => renderLink(link)).join("")
      : "<p>No se encontraron enlaces.</p>";
  } catch (error) {
    linksContainer.innerHTML = `<p>Error al cargar los enlaces: ${error.message}</p>`;
  }
}

// Renderizar enlace
function renderLink(link) {
  return `
    <div>
      <p><strong>Título:</strong> ${link.title}</p>
      <p><strong>URL:</strong> <a href="${link.url}" target="_blank">${link.url}</a></p>
      <p><strong>Descripción:</strong> ${link.description}</p>
      <p><strong>Etiquetas:</strong> ${link.tags?.join(", ") || "Sin etiquetas"}</p>
      <button onclick="navigate('details', '${link._id}')">Ver detalles</button>
      <button onclick="navigate('comment', '${link._id}')">Comentar</button>
    </div>`;
}

// Cargar detalles del enlace
async function loadLinkDetails(linkId) {
  const commentsList = document.getElementById("commentsList");
  const votesContainer = document.getElementById("votesContainer");

  try {
    const link = await fetch(`${API_URL}/links/${linkId}`).then(handleHTTPError);
    const comments = await fetch(`${API_URL}/comments/${linkId}`).then(handleHTTPError);

    commentsList.innerHTML = comments.length
      ? comments.map(comment => renderComment(comment)).join("")
      : "<p>No hay comentarios para mostrar.</p>";

    votesContainer.innerHTML = `<p><strong>Votos:</strong> ${link.votes || 0}</p>`;
    document.getElementById("voteButton").onclick = () => voteLink(linkId);
  } catch (error) {
    commentsList.innerHTML = `<p>Error al cargar los detalles: ${error.message}</p>`;
  }
}

// Renderizar comentario
function renderComment(comment) {
  return `
    <div>
      <p><strong>Comentario:</strong> ${comment.content}</p>
      <p><strong>Fecha:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
    </div>`;
}

// Votar enlace
async function voteLink(linkId) {
  try {
    const response = await fetch(`${API_URL}/links/vote/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: 1 }),
    });
    const updatedLink = await handleHTTPError(response);
    document.getElementById("votesContainer").innerHTML = `<p><strong>Votos:</strong> ${updatedLink.votes}</p>`;
  } catch (error) {
    console.error("Error al votar:", error.message);
  }
}

// Comentar enlace
async function commentLink(linkId) {
  const commentInput = document.getElementById("commentInput");
  const comment = commentInput.value.trim();

  if (!comment) return alert("Debes escribir un comentario.");

  try {
    const response = await fetch(`${API_URL}/comments/${linkId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    await handleHTTPError(response);
    alert("Comentario enviado con éxito.");
    commentInput.value = "";
  } catch (error) {
    alert(`Error al enviar el comentario: ${error.message}`);
  }
}

// Guardar enlace
async function saveLink() {
  const title = document.getElementById("link-title").value;
  const url = document.getElementById("link-url").value;
  const description = document.getElementById("link-description").value;
  const tagsInput = document.getElementById("link-tags").value;
  const tags = tagsInput.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0); // Separar y limpiar etiquetas

  if (!title || !url) {
    alert("Por favor, ingresa un título y una URL.");
    return;
  }

  const newLink = { title, url, description, tags };

  try {
    const response = await fetch(`${API_URL}/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newLink),
    });

      await handleHTTPError(response);
      alert("Enlace guardado exitosamente.");
      showLinks();  
      
  } catch (error) {
    alert("Error al guardar el enlace.");
  }
}

// Navegación
function navigate(view, linkId = null) {
  app.innerHTML = "";
  switch (view) {
    case "home":
      app.innerHTML = `
        <h2>Home</h2>
        <input type="text" id="tag-filter" placeholder="Filtrar por etiqueta" />
        <button id="filter-button">Filtrar</button>
        <button id="save-link-button">Guardar enlace</button>
        <div id="links-container"></div>`;

      showLinks();
      document.getElementById("filter-button").onclick = () => showLinks(document.getElementById("tag-filter").value);
      document.getElementById("save-link-button").onclick = () => navigate("savelink");
      break;

    case "details":
      app.innerHTML = `
        <h2>Detalles</h2>
        <div id="commentsList"></div>
        <div id="votesContainer"></div>
        <button id="voteButton">Votar</button>`;
      loadLinkDetails(linkId);
      break;

    case "savelink":
      app.innerHTML = `
      <div>
        <input type="text" id="link-title" placeholder="Título del enlace" />
        <input type="url" id="link-url" placeholder="URL del enlace" />
        <input type="text" id="link-description" placeholder="Descripción del enlace" />
        <input type="text" id="link-tags" placeholder="Etiquetas (separadas por comas)" />
        <button id="save-link-button">Guardar enlace</button>
        <button onclick="navigate('home')">Volver</button>
      </div>
      `
      document.getElementById("save-link-button").onclick = () => saveLink();
      break;

    case "comment":
      app.innerHTML = `
        <h2>Comentar</h2>
        <textarea id="commentInput" placeholder="Escribe tu comentario aquí"></textarea>
        <button id="submitComment">Enviar</button>
        <button onclick="navigate('home')">Volver</button>`;
      document.getElementById("submitComment").onclick = () => commentLink(linkId);
      break;

    default:
      app.innerHTML = `<p>Página no encontrada.</p>`;
  }
}

//Eventos para cambiar entre vistas
document.getElementById("nav-home").addEventListener("click", () => navigate("home"));
// document.getElementById("nav-details").addEventListener("click", () => navigate("details"));
navigate("home");
