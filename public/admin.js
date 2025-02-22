import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.addEventListener("DOMContentLoaded", async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const role = userDoc.data().role;

                if (role !== "admin") {
                    // 🔹 Si NO es admin, redirigir a la página de trabajador
                    window.location.href = "trabajador.html";
                }
            }
        } else {
            // 🔹 Si no hay usuario autenticado, redirigir al login
            window.location.href = "login.html";
        }
    });
});
