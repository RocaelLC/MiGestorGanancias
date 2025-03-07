import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Código secreto del administrador (puedes guardarlo en Firestore si prefieres)
const ADMIN_SECRET_CODE = "Somacafe23"; // 🔹 Cámbialo por un código seguro

// Manejar el registro
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passwordRegister").value;
    const name = document.getElementById("name").value;
    const apellido = document.getElementById("apellido").value;
    const selectedRole = document.getElementById("roleSelector").value;
    const adminCode = document.getElementById("adminCode")?.value || null; // Captura el código si existe

    try {
        if (selectedRole === "admin" && adminCode !== ADMIN_SECRET_CODE) {
            alert("Código de administrador incorrecto.");
            return;
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar datos en Firestore con el rol asignado
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            name: name,
            apellido: apellido,
            role: selectedRole
        });

        console.log("Usuario registrado como:", selectedRole);

        // Redirigir al login después del registro
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error en el registro:", error.message);
        alert("Error: " + error.message);
    }
});
