// Configuración inicial
const API_URL = "http://localhost:3005";
const app = document.getElementById("app");

// Manejo de errores HTTP
function handleHTTPError(response) {
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
}

// Mostrar enlaces
async function showLinks(tagFilter = '') {
  const linksContainer = document.getElementById("links-container");
  const url = tagFilter ? `${API_URL}/links/tags/${tagFilter}` : `${API_URL}/links`;

  const response = await fetch(url);
  const links = await handleHTTPError(response);
  
  linksContainer.innerHTML = links.length
    ? links.map(link => renderLink(link)).join("")
    : "<p>No se encontraron enlaces.</p>";

}

function filterLinks() {
  const tagFilter = document.getElementById("tag-filter").value.trim();
  showLinks(tagFilter);
}

// Renderizar enlace
function renderLink(link) {
  return `
    <div>
      <p><strong>${link.title}</strong></p>
      <p><a href="${link.url}" target="_blank">${link.url}</a></p>
      <p>${link.description}</p>
      <p><strong>Tags:</strong> ${link.tags?.join(", ") || "Sin etiquetas"}</p>
      <button onclick="navigate('details', '${link._id}')">Ver detalles</button>
    </div>`;
}

// Cargar detalles del enlace
async function loadLinkDetails(linkId) {
  const commentsList = document.getElementById("commentsList");
  const votesContainer = document.getElementById("votesContainer");
  try {
    const link = await fetch(`${API_URL}/links/${linkId}`).then(handleHTTPError);
    const comments = await fetch(`${API_URL}/comments/${linkId}`).then(handleHTTPError);

    commentsList.innerHTML = `
    <div>
      <p><strong>Comentarios:</strong></p>
      ${comments.length
        ? `<ul>${comments.map(comment => renderComment(comment)).join("")}</ul>`
        : "<p>No hay comentarios para mostrar.</p>"}
    </div>
    `;
    votesContainer.innerHTML = `<p><strong>Votos:</strong> ${link.votes || 0}</p>`;

  } catch (error) {
    commentsList.innerHTML = `<p>Error al cargar los detalles: ${error.message}</p>`;
  }
}

// Renderizar comentario
function renderComment(comment) {
  return `<li>${comment.content}</li>`;
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
    console.log("Comentario enviado con éxito.");
    commentInput.value = "";
    loadLinkDetails(linkId)
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
        <input type="text" id="tag-filter" placeholder="Filtrar por etiqueta" />
        <div id="links-container"></div>
        <button id="save-link-button">Añadir enlace</button>
      `;
        
      showLinks(); 
      document.getElementById("tag-filter").addEventListener("input", filterLinks);
      document.getElementById("save-link-button").onclick = () => navigate("savelink");
      break;

    case "details":
      app.innerHTML = `
        <h2>Detalles</h2>
        <div id="votesContainer"></div>
        <button id="voteButton">Votar</button>

        <div id="commentsList"></div>

        <textarea id="commentInput" placeholder="Escribe tu comentario aquí"></textarea>
        <button id="submitComment">Enviar</button>

        <button onclick="navigate('home')">Volver</button>`;
      loadLinkDetails(linkId);
      document.getElementById("submitComment").onclick = () => commentLink(linkId);
      document.getElementById("voteButton").onclick = () => voteLink(linkId);
      break;

    case "savelink":
      app.innerHTML = `
      <div>
        <input type="text" id="link-title" placeholder="Título del enlace"required />
        <input type="url" id="link-url" placeholder="URL del enlace" required />
        <input type="text" id="link-description" placeholder="Descripción del enlace" />
        <input type="text" id="link-tags" placeholder="Etiquetas (separadas por comas)" />
        <button id="save-link-button">Guardar enlace</button>
        <button onclick="navigate('home')">Volver</button>
      </div>
      `
      document.getElementById("save-link-button").onclick = () => saveLink();
      break;

    default:
      app.innerHTML = `<p>Página no encontrada.</p>`;
  }
}

//Eventos para cambiar entre vistas
// document.getElementById("nav-home").addEventListener("click", () => navigate("home"));
// document.getElementById("nav-details").addEventListener("click", () => navigate("details"));
navigate("home");
