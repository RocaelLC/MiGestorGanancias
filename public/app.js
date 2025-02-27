// Importar Firebase y sus servicios correctamente
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// 🔹 Configuración de Firebase (debe ser la misma que usaste en `register.js`)
const firebaseConfig = {
    apiKey: "AIzaSyB0g3hI2fFBf8dD5rYkt00IY6iyKf0HoUU",
    authDomain: "migestor-fc269.firebaseapp.com",
    projectId: "migestor-fc269",
    storageBucket: "migestor-fc269.appspot.com",
    messagingSenderId: "901999644556",
    appId: "1:901999644556:web:d39a8aebd3a22069ca10a9"
};

// 🔹 Inicializar Firebase SOLO si no está inicializado antes
const app = initializeApp(firebaseConfig);

// 🔹 Inicializar los servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Manejo del formulario de login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;
    const selectedRole = document.getElementById("roleSelector").value;
    const adminCode = document.getElementById("adminCode")?.value || null; // Captura el código si existe

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Usuario autenticado con rol en Firestore:", userData.role);

            if (selectedRole === "admin") {
                if (adminCode === "123456") { // 🔹 Cambia este código por el real
                    window.location.href = "Inicio.html";
                } else {
                    alert("Código de administrador incorrecto.");
                }
            } else if (selectedRole === "trabajador") {
                window.location.href = "ventas.html";
            } else {
                alert("Rol no reconocido.");
            }
        } else {
            alert("No se encontró el perfil del usuario en Firestore.");
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error.message);
        alert("Error: " + error.message);
    }
});
