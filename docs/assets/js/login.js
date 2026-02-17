// login.js
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Buscar usuario en Supabase
        const { data, error } = await supabase
            .from("usuarios")
            .select("username, password, role")
            .eq("username", username)
            .single();

        if (error || !data || data.password !== password) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        // Guardar sesión (igual que antes)
        const session = {
            user: data.username,
            role: data.role
        };

        localStorage.setItem("session", JSON.stringify(session));

        // Redirigir a la página de usuarios
        window.location.href = "users.html";
    });
});
