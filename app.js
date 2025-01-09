// 1. URL base del servidor
const API_URL = "http://localhost:3005";

const app = document.getElementById("app");

  
async function showLinks(tagFilter = null) {
  const linksContainer = document.getElementById("links-container");

  try {
    const url = tagFilter ? `${API_URL}/links/tags/${tagFilter}` : `${API_URL}/links`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const links = await response.json();
    console.log(links)

    linksContainer.innerHTML = "";

    

    if (links && Array.isArray(links)) {
      if (links.length === 0) {
        linksContainer.innerHTML = "<p style='color: red;'>No se encontraron enlaces con esta etiqueta.</p>";
        return;
      }

      links.forEach((link) => {
        const linkElement = document.createElement("div");
        linkElement.innerHTML = `
        <p><strong>Título:</strong> ${link.title}</p>
        <p><strong>URL:</strong> <a href="${link.url}" target="_blank">${link.url}</a></p>
        <p><strong>Descripcion:</strong> ${link.description}</p>
        <p><strong>Etiquetas:</strong> ${link.tags ? link.tags.join(", ") : "Sin etiquetas"}</p>
        `;

        const commentsButton = document.createElement("button");
        commentsButton.textContent = "Ver comentarios";
        commentsButton.addEventListener("click", () => {
          navigate("details", link._id);
        });

        linkElement.appendChild(commentsButton);
        linksContainer.appendChild(linkElement);
      });
    } else {
      linksContainer.innerHTML = "<p style='color: red;'>No se pudieron cargar los enlaces.</p>";
    }
  }
  catch (error) {
    console.error("Error al obtener los enlaces:", error.message);
    app.innerHTML += `<p style="color: red;">Error al cargar los enlaces: ${error.message}</p>`;
  }
}
  
async function loadLinkDetails(linkId) {
  const commentsList = document.getElementById("commentsList");
  const votesContainer = document.getElementById("votesContainer");

  try {
    const linkResponse = await fetch(`${API_URL}/links/${linkId}`);
    if (!linkResponse.ok) {
      throw new Error(`HTTP Error: ${linkResponse.status}`);
    }
    const link = await linkResponse.json();

    // Fetch de comentarios desde el backend
    const response = await fetch(`${API_URL}/comments/${linkId}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const comments = await response.json();
  
    // Limpiar el contenedor de comentarios
    commentsList.innerHTML = "";
  
    if (Array.isArray(comments)) {
      if (comments.length === 0) {
        commentsList.innerHTML = "<p>No hay comentarios para mostrar.</p>";
      } else {
        comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          // Agregar contenido HTML al comentario
          commentElement.innerHTML = `
            <p><strong>Comentario:</strong> ${comment.content}</p>
            <p><strong>Fecha:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
          `;
  
          commentsList.appendChild(commentElement);
        });
      }
    } else {
      commentsList.innerHTML = "<p style='color: red;'>No se pudieron cargar los comentarios.</p>";
    }


    if (votesContainer) {
      votesContainer.innerHTML = `<p><strong>Votos:</strong> ${link.votes || 0}</p>`;
    }
    const voteButton = document.getElementById("voteButton");
    if (voteButton) {
      voteButton.addEventListener("click", async () => {
        try {
          const voteResponse = await fetch(`${API_URL}/links/vote/${linkId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ vote: 1 }), 
          });

          if (!voteResponse.ok) {
            throw new Error("Error al votar.");
          }

          const updatedLink = await voteResponse.json();
          votesContainer.innerHTML = `<p><strong>Votos:</strong> ${updatedLink.votes}</p>`;
        } catch (error) {
          console.error("Error al votar:", error.message);
        }
      });
    }
  } catch (error) {
    console.error("Error al cargar los comentarios:", error.message);
    commentsList.innerHTML = `<p style="color: red;">Error al cargar los comentarios: ${error.message}</p>`;
  }
}

function navigate(view, linkId = null) {
  app.innerHTML = ""; 
  switch (view) {
    case "home":
      app.innerHTML = `
        <h2>Home</h2>
        <p>Bienvenido al administrador de enlaces. Agrega, filtra y organiza tus enlaces fácilmente.</p>
        <div>
          <input type="text" id="tag-filter" placeholder="Filtrar por etiqueta" />
          <button id="filter-button">Filtrar</button>
        </div>
        <div id="links-container"></div>`;
      showLinks(); 
      
      document.getElementById("filter-button").addEventListener("click", () => {
        const tag = document.getElementById("tag-filter").value;
        showLinks(tag); 
      });
      
      break;


    case "details":
      app.innerHTML = `
        <h2>Details</h2>
        <p>Detalles de los enlaces. Aquí aparecerán los comentarios y votos.</p>
        <div id="commentsList"></div>
        <div id="votesContainer"></div>
        <button id="voteButton">Votar</button>
      `;
      if (linkId){
        loadLinkDetails(linkId)
      }
      break;
    default:
      app.innerHTML = `<p>Página no encontrada.</p>`;
  }
}



// // 5. Eventos para cambiar entre vistas
document.getElementById("nav-home").addEventListener("click", () => navigate("home"));
document.getElementById("nav-details").addEventListener("click", () => navigate("details"));

// 6. Cargar la vista inicial
navigate("home");
