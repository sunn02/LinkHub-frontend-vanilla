// app.js

// 1. URL base del servidor
const API_URL = "http://localhost:3005"; // Cambia esto si tu backend usa otra dirección o puerto

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
  

// 3. Seleccionar el contenedor principal
const app = document.getElementById("app");

// 4. Enrutador básico para manejar las vistas
function navigate(view) {
  app.innerHTML = ""; 
  switch (view) {
    case "home":
      app.innerHTML = `
        <h2>Home</h2>
        <p>Bienvenido al administrador de enlaces. Agrega, filtra y organiza tus enlaces fácilmente.</p>
      `;
      fetchLinks(); // Cargar los enlaces cuando se muestra la vista de inicio
      break;
    case "details":
      app.innerHTML = `
        <h2>Details</h2>
        <p>Detalles de los enlaces. Aquí aparecerán los comentarios y votos.</p>
      `;
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
