// ----------------------------- 
//  Conexión directa a Supabase 
// ----------------------------- 
let supabase = null;
let isInitializing = false;

async function initSupabase(retries = 3) {
    if (supabase) return supabase;
    if (isInitializing) {
        while (isInitializing) await new Promise(r => setTimeout(r, 100));
        return supabase;
    }
    isInitializing = true;
    for (let i = 0; i < retries; i++) {
        try {
            const mod = await import("https://esm.sh/@supabase/supabase-js");
            supabase = mod.createClient(
                "https://ojpyfjgkffmzwvukjagf.supabase.co",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHlmamdrZmZtend2dWtqYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDIwMzYsImV4cCI6MjA3OTcxODAzNn0.dlVYmoMumBse_O1PLBx0FeNITqY4YktefD6l_uonSgo"
            );
            console.log("Supabase inicializado en users.js");
            break;
        } catch (err) {
            console.error(`Error cargando Supabase en users.js (intento ${i+1}):`, err);
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i+1)));
        }
    }
    isInitializing = false;
    return supabase;
}

initSupabase();
 
// Global session object 
let session = null; 
let originalUsername = null; // To track the original username during an edit 
 
// ----------------------------------------------------------- 
// FUNCIÓN PARA MOSTRAR POPUPS 
// ----------------------------------------------------------- 
function showPopup(message, isError = false) { 
    const popup = document.getElementById("popup"); 
    popup.textContent = message; 
    popup.className = "popup show"; // Reset classes and show 
    if (isError) { 
        popup.classList.add("error"); 
    } 
    setTimeout(() => { 
        popup.classList.remove("show"); 
    }, 3000); 
} 
 
// ----------------------------------------------------------- 
// INICIALIZACIÓN 
// ----------------------------------------------------------- 
document.addEventListener("DOMContentLoaded", () => { 
    const savedSession = localStorage.getItem("session"); 
    if (savedSession) { 
        session = JSON.parse(savedSession); 
        initializeUserView(session); 
    } 
    setupEventListeners(); 
}); 
 
// ----------------------------------------------------------- 
// CONFIGURACIÓN DE EVENTOS 
// ----------------------------------------------------------- 
function setupEventListeners() { 
    document.getElementById("login-icon").onclick = () => { 
        if (!session) toggleLoginPanel(); 
        else toggleBadgeMenu(); 
    }; 
    document.getElementById("login-btn").onclick = doLogin; 
    const passInput = document.getElementById("pass"); 
    if(passInput) { 
        passInput.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter') doLogin(); 
        }); 
    } 
    document.getElementById("logout-btn").onclick = doLogout; 
    document.getElementById("user-badge").addEventListener("click", e => { 
        if (!session) return; 
        e.stopPropagation(); 
        toggleBadgeMenu(); 
    }); 
    document.getElementById("badge-menu").addEventListener("click", e => e.stopPropagation()); 
    document.addEventListener("click", e => { 
        const menu = document.getElementById("badge-menu"); 
        if (!e.target.closest("#user-badge") && !e.target.closest("#badge-menu") && menu.classList.contains("show")) { 
            menu.classList.remove("show"); 
        } 
    }); 
 
    const addUserForm = document.getElementById("add-user-form"); 
    if (addUserForm) { 
        addUserForm.addEventListener("submit", (e) => { 
            e.preventDefault(); 
            addUser(session); 
        }); 
    } 
 
    const editModal = document.getElementById("edit-modal"); 
    if (editModal) { 
        document.getElementById("modal-cancel-btn").onclick = () => editModal.classList.remove("visible"); 
        document.getElementById("modal-save-btn").onclick = () => updateUser(session); 
    } 
} 
 
// ------------------------------------------------------- 
// VISTA DE USUARIO LOGUEADO 
// ------------------------------------------------------- 
function initializeUserView(currentSession) { 
    const badge = document.getElementById("user-badge"); 
    const drawer = document.getElementById("main-drawer"); 
 
    document.getElementById("badge-username").innerText = currentSession.user; 
    document.getElementById("badge-role").innerText = currentSession.role; 
    badge.classList.remove("hidden"); 
    if(drawer) { 
        drawer.classList.remove("hidden"); 
    } 
 
 
    if (document.getElementById("user-table-body")) { 
        if (!currentSession.role || !currentSession.role.startsWith("Admin")) { 
            showPopup("No tienes permiso para acceder a esta página.", true); 
            setTimeout(() => window.location.href = "index.html", 1500); 
            return; 
        } 
        populateRoles(document.getElementById("new-role"), currentSession.role); 
        loadUsers(currentSession); 
    } 
} 
 
// ------------------------------------------------------- 
// LOGIN Y LOGOUT 
// ------------------------------------------------------- 
async function doLogin() { 
    const username = document.getElementById("user").value.trim(); 
    const password = document.getElementById("pass").value.trim(); 
    const status = document.getElementById("login-status"); 
 
    if (!username || !password) { 
        status.innerText = "Rellena ambos campos"; 
        return; 
    } 
    status.innerText = ""; 

    if (!supabase) {
        await initSupabase(2);
        if (!supabase) {
            status.innerText = "Error de conexión con el servidor";
            return;
        }
    }
 
    const { data, error } = await supabase 
        .from("usuarios") 
        .select("username, password, role") 
        .eq("username", username) 
        .maybeSingle();
 
    if (error) {
        console.error("Login error:", error);
        status.innerText = "Error de conexión";
        return;
    }

    if (!data || data.password !== password) {
        status.innerText = "Usuario o contraseña incorrectos"; 
        return; 
    } 
 
    session = { user: data.username, role: data.role }; 
    localStorage.setItem("session", JSON.stringify(session)); 
    toggleLoginPanel(); 
    initializeUserView(session); 
} 
 
function doLogout() { 
    localStorage.removeItem("session"); 
    session = null; 
    window.location.href = "index.html"; 
} 
 
// ------------------------------------------------------- 
// HELPERS DE UI 
// ------------------------------------------------------- 
function toggleLoginPanel() {  
    const panel = document.getElementById("login-panel"); 
    if(panel) { 
        panel.classList.toggle("hidden"); 
    } 
} 
function toggleBadgeMenu() {  
    const menu = document.getElementById("badge-menu"); 
    if(menu) { 
        menu.classList.toggle("show"); 
    } 
} 
 
// ------------------------------------------------------- 
// LÓGICA DE GESTIÓN DE USUARIOS 
// ------------------------------------------------------- 
 
function populateRoles(selectElement, adminRole) { 
    if (!selectElement) return; 
    selectElement.innerHTML = ""; 
     
    const availableRoles = { 
        "Admin": ["Admin", "Admin CS", "Admin Openers", "Admin Closers", "Admin Design", "CS", "Openers", "Closers", "Design"], 
        "Admin CS": ["CS"], "Admin Openers": ["Openers"], "Admin Closers": ["Closers"], "Admin Design": ["Design"] 
    }; 
 
    const roles = availableRoles[adminRole] || []; 
    roles.forEach(role => { 
        const option = document.createElement("option"); 
        option.value = role; option.textContent = role; 
        selectElement.appendChild(option); 
    }); 
} 
 
async function loadUsers(session) { 
    const tableBody = document.getElementById("user-table-body"); 
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando...</td></tr>'; 
 
    let query = supabase.from("usuarios").select("username, role, password"); 
    if (session.role !== "Admin") { 
        const targetRole = session.role.replace("Admin ", ""); 
        query = query.in("role", [targetRole, session.role]); 
    } 
    let { data: users, error } = await query; 
 
    if (error) { 
        tableBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`; 
        return; 
    } 
 
    tableBody.innerHTML = ""; 
    if (users.length === 0) { 
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay usuarios para mostrar.</td></tr>'; 
        return; 
    } 
     
    users.forEach(user => {
        const row = document.createElement("tr");
        const sessionDept = session.role.replace("Admin ", "");
        const userDept = user.role.replace("Admin ", "");

        const isSelf = user.username === session.user;
        const isAdmin = session.role === "Admin";
        const isDeptAdmin = session.role.startsWith("Admin ") && sessionDept === userDept;

        const canEdit = isSelf || isAdmin || isDeptAdmin;
        const canDelete = (isAdmin || isDeptAdmin) && !isSelf;

        row.innerHTML = `<td>${user.username}</td><td>${user.password}</td><td>${user.role}</td>`;

        const actionsCell = document.createElement("td");
        actionsCell.className = "action-buttons";
        if (canEdit) {
            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Editar";
            editBtn.onclick = () => openEditModal(user, session);
            actionsCell.appendChild(editBtn);
        }
        if (canDelete) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Eliminar";
            deleteBtn.onclick = () => openDeleteModal(user.username, session);
            actionsCell.appendChild(deleteBtn);
        }
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
} 
 
async function addUser(session) { 
    const newUser = { 
        username: document.getElementById("new-username").value.trim(), 
        password: document.getElementById("new-password").value.trim(), 
        role: document.getElementById("new-role").value 
    }; 
 
    if (!newUser.username || !newUser.password || !newUser.role) { 
        showPopup("Completa todos los campos.", true); 
        return; 
    } 
 
    // Security validation for roles 
    if (session.role !== "Admin") { 
        const allowedRole = session.role.replace("Admin ", ""); 
        if (newUser.role !== allowedRole) { 
            showPopup("No puedes asignar un rol diferente al tuyo.", true); 
            return; 
        } 
    } 
 
    const { error } = await supabase.from("usuarios").insert([newUser]); 
    if (error) { 
        showPopup(`Error: ${error.message}`, true); 
        return; 
    } 
 
    showPopup("Usuario añadido correctamente."); 
    loadUsers(session); 
    document.getElementById("add-user-form").reset(); 
} 
 
function openEditModal(user, session) {
    originalUsername = user.username;
    const modal = document.getElementById("edit-modal");
    const usernameInput = document.getElementById("modal-username");
    const roleSelect = document.getElementById("modal-role");

    usernameInput.value = user.username;
    document.getElementById("modal-password").value = user.password;

    populateRoles(roleSelect, session.role);
    roleSelect.value = user.role;

    const isMainAdmin = session.role === "Admin";
    usernameInput.disabled = !isMainAdmin;
    roleSelect.disabled = !isMainAdmin;

    modal.classList.add("visible");
}
 
async function updateUser(session) { 
    const updatedUser = { 
        username: document.getElementById("modal-username").value.trim(), 
        password: document.getElementById("modal-password").value.trim(), 
        role: document.getElementById("modal-role").value 
    }; 
 
    if (!updatedUser.username || !updatedUser.password) { 
        showPopup("El nombre de usuario y la contraseña no pueden estar vacíos.", true); 
        return; 
    } 
 
    const { error } = await supabase.from("usuarios").update(updatedUser).eq("username", originalUsername); 
 
    if (error) { 
        showPopup(`Error: ${error.message}`, true); 
        return; 
    } 
 
    showPopup("Usuario actualizado correctamente."); 
    document.getElementById("edit-modal").classList.remove("visible"); 
     
    // If a user changes their own data, update the session 
    if (originalUsername === session.user) { 
        session.user = updatedUser.username; 
        localStorage.setItem("session", JSON.stringify(session)); 
        initializeUserView(session); // Re-initialize to update badge 
    } 
     
    loadUsers(session); 
} 
 
function openDeleteModal(username, session) { 
    const confirmModal = document.getElementById("confirm-modal"); 
    document.getElementById("confirm-text").textContent = `¿Estás seguro de que quieres eliminar al usuario ${username}?`; 
    confirmModal.classList.add("visible"); 
 
    document.getElementById("confirm-yes-btn").onclick = () => { 
        deleteUser(username, session); 
        confirmModal.classList.remove("visible"); 
    }; 
 
    document.getElementById("confirm-no-btn").onclick = () => { 
        confirmModal.classList.remove("visible"); 
    }; 
} 
 
 
async function deleteUser(username, session) { 
    const { error } = await supabase.from("usuarios").delete().eq("username", username); 
    if (error) { 
        showPopup(`Error: ${error.message}`, true); 
        return; 
    } 
 
    showPopup("Usuario eliminado correctamente."); 
    loadUsers(session); 
} 
