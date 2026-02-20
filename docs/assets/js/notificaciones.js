let supabase = null;

async function initSupabase() {
    try {
        const mod = await import("https://esm.sh/@supabase/supabase-js");
        supabase = mod.createClient(
            "https://ojpyfjgkffmzwvukjagf.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHlmamdrZmZtend2dWtqYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDIwMzYsImV4cCI6MjA3OTcxODAzNn0.dlVYmoMumBse_O1PLBx0FeNITqY4YktefD6l_uonSgo"
        );
    } catch (err) {
        console.error("Error inicializando Supabase:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initSupabase();
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.role.startsWith("Admin")) {
        window.location.href = "index.html";
        return;
    }

    const form = document.getElementById("notification-form");
    const tipoDestino = document.getElementById("tipo_destino");
    const rolesSelection = document.getElementById("roles-selection");
    const usersSelection = document.getElementById("users-selection");
    const usuariosSelect = document.getElementById("usuarios-select");

    // Mostrar/ocultar campos según el tipo de destino
    tipoDestino.addEventListener("change", () => {
        rolesSelection.classList.toggle("hidden", tipoDestino.value !== "roles");
        usersSelection.classList.toggle("hidden", tipoDestino.value !== "users");

        if (tipoDestino.value === "users" && usuariosSelect.options.length === 0) {
            loadUsers();
        }
    });

    // Restringir opciones si no es el admin principal
    if (session.role !== "Admin") {
        // Los admins de departamento tal vez solo puedan enviar a su propio departamento
        // Pero el requerimiento dice "el usuario admin el que solo es admin ese puede seleccionar si a todos los usuario veran el mensaje o solo algunos cuantos"
        // Lo que implica que los otros admins TIENEN una restricción o una opción predefinida.
        // Por ahora dejaré que todos vean las opciones pero avisaré si no tienen permiso al enviar.
    }

    async function loadUsers() {
        if (!supabase) return;
        const { data, error } = await supabase.from("usuarios").select("username").order("username");
        if (error) {
            showPopup("Error cargando usuarios", true);
            return;
        }
        usuariosSelect.innerHTML = "";
        data.forEach(user => {
            const option = document.createElement("option");
            option.value = user.username;
            option.textContent = user.username;
            usuariosSelect.appendChild(option);
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!supabase) {
            showPopup("Error: Supabase no cargado", true);
            return;
        }

        const mensaje = document.getElementById("mensaje").value;
        const tipo = tipoDestino.value;
        let destinos = [];

        if (tipo === "roles") {
            destinos = Array.from(document.querySelectorAll('input[name="roles"]:checked')).map(cb => cb.value);
            if (destinos.length === 0) {
                showPopup("Selecciona al menos un rol", true);
                return;
            }
        } else if (tipo === "users") {
            destinos = Array.from(usuariosSelect.selectedOptions).map(opt => opt.value);
            if (destinos.length === 0) {
                showPopup("Selecciona al menos un usuario", true);
                return;
            }
        }

        // Validación de permisos extra
        if (session.role !== "Admin") {
            if (tipo === "all") {
                showPopup("Solo el administrador general puede enviar mensajes a todos", true);
                return;
            }
            // Podríamos añadir más restricciones aquí
        }

        const { error } = await supabase.from("notificaciones").insert([{
            mensaje,
            tipo_destino: tipo,
            destinos,
            emisor: session.user
        }]);

        if (error) {
            showPopup("Error al enviar: " + error.message, true);
        } else {
            showPopup("Notificación enviada correctamente");
            form.reset();
            rolesSelection.classList.add("hidden");
            usersSelection.classList.add("hidden");
        }
    });
});

function showPopup(message, isError = false) {
    const popup = document.getElementById("popup");
    if (!popup) {
        alert(message);
        return;
    }
    popup.textContent = message;
    popup.className = "popup show" + (isError ? " error" : "");
    setTimeout(() => popup.classList.remove("show"), 3000);
}
