// 1. URL base del servidor
const API_URL = "http://localhost:3005";

const app = document.getElementById("app");

// 2. Función para obtener los enlaces desde el backend
async function fetchLinks() {
    try {
      const response = await fetch(`${API_URL}/links`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const links = await response.json();
      console.log(links);
      return links;
    } catch (error) {
      console.error("Error al obtener los enlaces:", error.message);
      app.innerHTML += `<p style="color: red;">Error al cargar los enlaces: ${error.message}</p>`;
    }
  }
  
async function renderLinks() {
  const links = await fetchLinks(); // Llamada a la función fetchLinks
  const container = document.getElementById("links-container");

  if (links && Array.isArray(links)) {
    links.forEach((link) => {
      const linkElement = document.createElement("div");
      linkElement.innerHTML = `
      <p><strong>Título:</strong> ${link.title}</p>
      <p><strong>URL:</strong> <a href="${link.url}" target="_blank">${link.url}</a></p>
      <p><strong>Descripcion:</strong> ${link.description}</p>
      `;

      const commentsButton = document.createElement("button");
      commentsButton.textContent = "Ver comentarios";
      commentsButton.addEventListener("click", () => {
        loadComments(link._id) 
      });

      linkElement.appendChild(commentsButton);
      container.appendChild(linkElement);
    });
  } else {
    container.innerHTML = "<p style='color: red;'>No se pudieron cargar los enlaces.</p>";
  }
}
  
async function loadComments(linkId) {
  const commentsList = document.getElementById("commentsList");

  try {
    // Fetch de comentarios desde el backend
    const response = await fetch(`${API_URL}/comments/${linkId}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const comments = await response.json();

    // Limpiar el contenedor de comentarios
    commentsList.innerHTML = "";

    if (comments && Array.isArray(comments)) {
      // Iterar sobre los comentarios y renderizarlos
      comments.forEach((comment) => {
        const commentElement = document.createElement("div");
        // Agregar contenido HTML al comentario
        commentElement.innerHTML = `
          <p><strong>Comentario:</strong> ${comment.content}
          <p><strong>Fecha:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
        `;

        // Añadir el comentario al contenedor
        commentsList.appendChild(commentElement);
      });
    } else {
      commentsList.innerHTML = "<p>No hay comentarios para mostrar.</p>";
    }
  } catch (error) {
    // Manejo de errores
    console.error("Error al cargar los comentarios:", error.message);
    commentsList.innerHTML = `<p style="color: red;">Error al cargar los comentarios: ${error.message}</p>`;
  }
}

// 4. Enrutador básico para manejar las vistas
function navigate(view) {
  app.innerHTML = ""; 
  switch (view) {
    case "home":
      app.innerHTML = `
        <h2>Home</h2>
        <p>Bienvenido al administrador de enlaces. Agrega, filtra y organiza tus enlaces fácilmente.</p>
      `;
      renderLinks(); // Cargar los enlaces cuando se muestra la vista de inicio
      break;
    case "details":
      app.innerHTML = `
        <h2>Details</h2>
        <p>Detalles de los enlaces. Aquí aparecerán los comentarios y votos.</p>
        <div id="commentsList></div>
      `;
      if (linkId){
        loadComments(linkId)
      }
      break;
    default:
      app.innerHTML = `<p>Página no encontrada.</p>`;
  }
}


// // 5. Eventos para cambiar entre vistas
// document.getElementById("nav-home").addEventListener("click", () => navigate("home"));
// document.getElementById("nav-details").addEventListener("click", () => navigate("details"));

// 6. Cargar la vista inicial
navigate("home");
