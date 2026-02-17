
document.addEventListener("DOMContentLoaded", () => {
    const uiContainer = document.createElement("div");
    uiContainer.innerHTML = `
        <!-- ICONO Y BADGE -->
        <img id="login-icon" class="login-icon" src="./assets/img/user.svg">
        
        <div id="user-badge" class="user-badge hidden" style="position: fixed;">
            <div id="badge-username"></div>
            <div id="badge-role"></div>
        </div>

        <!-- Menú del badge -->
        <div id="badge-menu" class="hidden">
            <button id="logout-btn" class="logout-btn">Cerrar sesión</button>
        </div>

        <!-- DRAWER -->
        <menutech-drawer id="main-drawer" class="hidden"></menutech-drawer>
    `;
    
    // Inyecta los elementos al principio del body
    document.body.prepend(uiContainer);
});
