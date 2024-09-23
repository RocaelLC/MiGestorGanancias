// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0g3hI2fFBf8dD5rYkt00IY6iyKf0HoUU",
  authDomain: "migestor-fc269.firebaseapp.com",
  projectId: "migestor-fc269",
  storageBucket: "migestor-fc269.appspot.com",
  messagingSenderId: "901999644556",
  appId: "1:901999644556:web:d39a8aebd3a22069ca10a9"
  
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Manejar el inicio de sesión
const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();  // Prevenir que el formulario se envíe por defecto

  const email = document.querySelector("#emailLogin").value;
  const password = document.querySelector("#passwordLogin").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Inicio de sesión exitoso
      console.log("Usuario autenticado:", userCredential.user);
      // Redirigir al inicio
      window.location.href = "Inicio.html";
    })
    .catch((error) => {
      console.error("Error en el inicio de sesión:", error.message);
      alert("Error: " + error.message);  // Mostrar el error al usuario
    });
});

// Verificar autenticación y redirigir si es necesario
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Usuario está autenticado, redirige a la página de inicio
    if (window.location.pathname === "/") {  // Asumiendo que el archivo principal es index.html
      window.location.href = "Inicio.html";
    }
  }
});
