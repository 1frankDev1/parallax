// badge.js -> Versión adaptada a Supabase (mantiene todas las funciones/animaciones)
// Reemplaza completamente tu badge.js anterior (elimina la constante API_URL y el Apps Script).

(function () {
  // ------------------------------
  // Importar Supabase dinámicamente
  // ------------------------------
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
        const createClient = mod.createClient;
        supabase = createClient(
          "https://ojpyfjgkffmzwvukjagf.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHlmamdrZmZtend2dWtqYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDIwMzYsImV4cCI6MjA3OTcxODAzNn0.dlVYmoMumBse_O1PLBx0FeNITqY4YktefD6l_uonSgo"
        );
        console.log("Supabase inicializado correctamente");
        break;
      } catch (err) {
        console.error(`Error cargando Supabase (intento ${i + 1}):`, err);
        if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    isInitializing = false;
    return supabase;
  }

  initSupabase();

  // ------------------------------
  // Estado global
  // ------------------------------
  let session = null;

  // --- INICIO: Corrección de parpadeo ---
  // Esta verificación se ejecuta de inmediato para evitar que el panel de login
  // parpadee al cargar la página si ya existe una sesión.
  (function checkSessionAndToggleLogin() {
    const saved = localStorage.getItem("session");
    const loginOverlay = document.getElementById("login-overlay");

    if (saved) {
      session = JSON.parse(saved);
      if (loginOverlay) {
        loginOverlay.style.display = "none";
      }
    } else {
      // Si no hay sesión, nos aseguramos de que el panel sea visible en la página de inicio.
      if (loginOverlay && (window.location.pathname.endsWith("index.html") || window.location.pathname === "/")) {
        loginOverlay.style.display = "flex";
      }
    }
  })();
  // --- FIN: Corrección de parpadeo ---

  // ------------------------------
  // DOM ready
  // ------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initializeApp(); // init listeners, refs, etc.

    // La lógica de mostrar/ocultar el login ya se ejecutó.
    // Ahora solo rellenamos los datos si la sesión existe.
    if (session) {
      // Rellenar badge
      const badgeUsername = document.getElementById("badge-username");
      const badgeRole = document.getElementById("badge-role");
      if (badgeUsername) badgeUsername.innerText = session.user;
      if (badgeRole) badgeRole.innerText = session.role;

      const badgeEl = document.getElementById("user-badge");
      if (badgeEl) {
        badgeEl.classList.remove("hidden");
        setTimeout(() => badgeEl.classList.add("expand"), 10);
      }

      checkAccessHours(session.role); // show/hide time overlay
      applyRolePermissions(session.role);

      // Periodic session verification (verifica existencia en DB)
      setInterval(verifySession, 300000); // cada 5 minutos
    }
    // El 'else' para mostrar el login ya no es necesario aquí.
  });

  // ------------------------------
  // verifySession: ahora comprueba existencia del usuario en Supabase
  // ------------------------------
  async function verifySession() {
    const saved = localStorage.getItem("session");
    if (!saved) {
      // si no hay sesión y estamos en página protegida, forzar login
      if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
        window.location.href = "index.html";
      }
      return false;
    }

    const localSession = JSON.parse(saved);
    // si no hay usuario, cerrar
    if (!localSession.user) {
      logout();
      return false;
    }

    // si supabase no cargó aún, asumimos válido (para no bloquear offline) y reintentamos luego
    if (!supabase) return true;

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("username, role")
        .eq("username", localSession.user)
        .maybeSingle();

      if (error) {
        console.error("Error de conexión con Supabase durante la verificación:", error);
        return true; // Asumimos sesión válida para evitar logouts accidentales por red
      }

      if (!data) {
        // usuario no existe -> logout
        console.warn("Usuario no encontrado en la base de datos, cerrando sesión");
        logout();
        return false;
      }

      // si rol cambió en la DB, forzamos logout (mantener comportamiento estricto)
      if (localSession.role !== data.role) {
        logout();
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error verificando sesión:", err);
      return true; // evita expulsar si hay fallo de red
    }
  }

  // ------------------------------
  // applyRolePermissions (mantener igual)
  // ------------------------------
  function applyRolePermissions(role) {
    const roleGridConfig = {
      "CS": {
        "tile-1": { text: "Formularios", url: "./forms.html" },
        "tile-2": { text: "POS", url: "https://menutech.biz/p40o7s/index.html" },
        "tile-3": { text: "Website", url: "https://menutech.biz/w111/website.html" },
        "tile-4": { text: "Apps", url: "https://menutech.biz/p104/phone.html" },
        "tile-5": { text: "Directorio", url: "./directorio.html" },
        "tile-6": { text: "T-Shirt", url: "https://menutech.biz/s04/shirt.html" },
        "tile-7": { text: "Menus", url: "https://menutech.biz/m10/index.html" },
        "tile-8": { text: "Flyers", url: "https://menutech.biz/f32/index.html" },
        "tile-9": { text: "Plataforma", url: "https://menutech.biz/pl555f9a/index.html" },
        "tile-10": { text: "Audios", url: "./audios.html" },
        "tile-11": { text: "Ender 2D", url: "./render2D.html" },
        "tile-12": { text: "Render 3D", url: "./render3D.html" },
        "tile-17": { text: "Manual Menutech", url: "./manual.html" }
      },
      "Closers": {
        "tile-1": { text: "Formularios", url: "./forms.html" },
        "tile-2": { text: "POS", url: "https://menutech.biz/p40o7s/index.html" },
        "tile-3": { text: "Website", url: "https://menutech.biz/w111/website.html" },
        "tile-4": { text: "Apps", url: "https://menutech.biz/p104/phone.html" },
        "tile-5": { text: "Directorio", url: "./directorio.html" },
        "tile-6": { text: "T-Shirt", url: "https://menutech.biz/s04/shirt.html" },
        "tile-7": { text: "Menus", url: "https://menutech.biz/m10/index.html" },
        "tile-8": { text: "Flyers", url: "https://menutech.biz/f32/index.html" },
        "tile-9": { text: "Plataforma", url: "https://menutech.biz/pl555f9a/index.html" },
        "tile-10": { text: "Audios", url: "./audios.html" },
        "tile-11": { text: "Ender 2D", url: "./render2D.html" },
        "tile-12": { text: "Render 3D", url: "./render3D.html" },
        "tile-17": { text: "Manual Menutech", url: "./manual.html" }
      },
      "Openers": {
        "tile-1": { text: "Formularios", url: "./forms.html" },
        "tile-2": { text: "POS", url: "https://menutech.biz/p40o7s/index.html" },
        "tile-3": { text: "Website", url: "https://menutech.biz/w111/website.html" },
        "tile-4": { text: "Apps", url: "https://menutech.biz/p104/phone.html" },
        "tile-5": { text: "Directorio", url: "./directorio.html" },
        "tile-6": { text: "T-Shirt", url: "https://menutech.biz/s04/shirt.html" },
        "tile-7": { text: "Menus", url: "https://menutech.biz/m10/index.html" },
        "tile-8": { text: "Flyers", url: "https://menutech.biz/f32/index.html" },
        "tile-9": { text: "Plataforma", url: "https://menutech.biz/pl555f9a/index.html" },
        "tile-10": { text: "Audios", url: "./audios.html" },
        "tile-11": { text: "Ender 2D", url: "./render2D.html" },
        "tile-12": { text: "Render 3D", url: "./render3D.html" },
        "tile-17": { text: "Manual Menutech", url: "./manual.html" }
      },
      "Design": {
        "tile-1": { text: "Formularios", url: "./forms.html" },
        "tile-2": { text: "POS", url: "https://menutech.biz/p40o7s/index.html" },
        "tile-3": { text: "Website", url: "https://menutech.biz/w111/website.html" },
        "tile-4": { text: "Apps", url: "https://menutech.biz/p104/phone.html" },
        "tile-5": { text: "Directorio", url: "./directorio.html" },
        "tile-6": { text: "T-Shirt", url: "https://menutech.biz/s04/shirt.html" },
        "tile-7": { text: "Menus", url: "https://menutech.biz/m10/index.html" },
        "tile-8": { text: "Flyers", url: "https://menutech.biz/f32/index.html" },
        "tile-9": { text: "Plataforma", url: "https://menutech.biz/pl555f9a/index.html" },
        "tile-10": { text: "Audios", url: "./audios.html" },
        "tile-11": { text: "Ender 2D", url: "./render2D.html" },
        "tile-12": { text: "Render 3D", url: "./render3D.html" },
        "tile-17": { text: "Manual Menutech", url: "./manual.html" }
      }
    };

    const config = roleGridConfig[role];
    if (config) {
      document.querySelectorAll(".tile").forEach(tile => {
        const tileId = tile.id;
        if (config[tileId]) {
          tile.textContent = config[tileId].text;
          tile.setAttribute("data-url", config[tileId].url);
        }
      });
    }

    // Mantener link a gestión de usuarios para Admins
    if (role.startsWith("Admin")) {
      const userManagementLink = document.createElement("a");
      userManagementLink.href = "users.html";
    //  userManagementLink.textContent = "Gestionar Usuarios";
      userManagementLink.style.display = "block";
      userManagementLink.style.textAlign = "center";
      userManagementLink.style.marginTop = "20px";
      if (!document.querySelector('a[href="users.html"]')) {
        const square = document.querySelector(".square");
        if (square) square.insertAdjacentElement('afterend', userManagementLink);
      }
    }

    const drawer = document.getElementById("main-drawer");
    if (drawer) {
      if (role.startsWith("Admin")) drawer.classList.remove("hidden");
      else drawer.classList.add("hidden");
    }
  }

  // ------------------------------
  // initializeApp: listeners + behavior (mantengo animaciones/teclas)
  // ------------------------------
  function initializeApp() {
    const icon = document.getElementById("login-icon");
    const badge = document.getElementById("user-badge");
    const menu = document.getElementById("badge-menu");
    const logoutBtn = document.getElementById("logout-btn");

    // Soportar distintos ids: `login-btn`/`login-user`/`login-pass` y `login-panel`/`user`/`pass`
    const loginBtn = document.getElementById("login-btn");
    const statusEl = document.getElementById("login-status");
    const user_input = document.getElementById("user") || document.getElementById("login-user");
    const pass_input = document.getElementById("pass") || document.getElementById("login-pass");
    const loginPanel = document.getElementById("login-panel");

    if (icon) {
      icon.onclick = () => { if (session) toggleBadgeMenu(); else toggleLoginPanel(); };
    }

    if (badge) {
      badge.addEventListener("click", e => {
        if (!session) return;
        e.stopPropagation();
        toggleBadgeMenu();
      });
    }

    if (menu) menu.addEventListener("click", e => e.stopPropagation());

    if (logoutBtn) logoutBtn.onclick = () => logout();

    if (loginBtn) {
      loginBtn.onclick = doLogin;

      document.addEventListener("keydown", e => {
        const overlayVisible = document.getElementById("login-overlay")?.style.display !== "none";
        if (e.key === "Enter" && overlayVisible) doLogin();
      });
    }

    // Toggle login panel animation (mantengo tu lógica)
    function toggleLoginPanel() {
      const panel = loginPanel || document.getElementById("login-overlay") || document.getElementById("login-panel");
      if (!panel) return;

      if (panel.classList.contains("hidden") || panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "flex";
        panel.classList.remove("fade-out");
        void panel.offsetWidth;
        panel.classList.add("fade-in");
      } else {
        panel.classList.remove("fade-in");
        panel.classList.add("fade-out");
        panel.addEventListener("animationend", function handler() {
          panel.style.display = "none";
          panel.classList.remove("fade-out");
          panel.removeEventListener("animationend", handler);
        });
      }
    }

    // Mantener menú del badge con transiciones
    function toggleBadgeMenu() {
      if (!menu || !badge) return;
      const rect = badge.getBoundingClientRect();
      const top = rect.bottom + 6 + window.scrollY;
      const left = rect.left + window.scrollX;
      menu.style.position = 'fixed';
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;

      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        const onHide = function () {
          menu.classList.add('hidden');
          menu.removeEventListener('transitionend', onHide);
        };
        menu.addEventListener('transitionend', onHide);
      } else {
        menu.classList.remove('hidden');
        void menu.offsetWidth;
        menu.classList.add('show');
      }
    }

    // Click fuera para cerrar menú
    document.addEventListener("click", e => {
      if (!menu) return;
      const clickedInsideBadge = !!e.target.closest("#user-badge");
      const clickedInsideMenu = !!e.target.closest("#badge-menu");
      if (!clickedInsideBadge && !clickedInsideMenu && menu.classList.contains("show")) {
        menu.classList.remove("show");
        const onHide = function () {
          menu.classList.add('hidden');
          menu.removeEventListener('transitionend', onHide);
        };
        menu.addEventListener('transitionend', onHide);
      }
    });
  }

  // ------------------------------
  // doLogin: reemplaza fetch(Apps Script) por Supabase
  // Mantengo exactamente tus animaciones/estados.
  // ------------------------------
  async function doLogin() {
    // Obtener inputs (compatibilidad)
    const userInputEl = document.getElementById("user") || document.getElementById("login-user");
    const passInputEl = document.getElementById("pass") || document.getElementById("login-pass");
    const loginBtn = document.getElementById("login-btn");
    const status = document.getElementById("login-status");
    const badge = document.getElementById("user-badge");
    const loginPanel = document.getElementById("login-panel") || document.getElementById("login-overlay");

    if (!userInputEl || !passInputEl || !loginBtn) {
      console.warn("Inputs de login no encontrados en el DOM");
      return;
    }

    const user = String(userInputEl.value || "").trim();
    const pass = String(passInputEl.value || "").trim();

    if (!user || !pass) {
      if (status) {
        status.innerText = "Rellena ambos campos";
        status.style.color = "#ff4d4d";
      }
      return;
    }

    loginBtn.classList.add("loading");
    if (status) status.innerText = "";

    // Si supabase no está listo aún, intentar inicializarlo
    if (!supabase) {
      console.warn("Supabase no cargado aún, intentando inicializar...");
      await initSupabase(2);
      if (!supabase) {
        loginBtn.classList.remove("loading");
        if (status) {
          status.innerText = "Error de conexión con el servidor";
          status.style.color = "#ff4d4d";
        }
        return;
      }
    }

    try {
      // búsqueda exacta por username
      let { data, error } = await supabase
        .from("usuarios")
        .select("username, password, role")
        .eq("username", user)
        .maybeSingle();

      // si no hay resultado exacto, fallback ilike (case-insensitive)
      if ((!data || error) && user) {
        const res = await supabase
          .from("usuarios")
          .select("username, password, role")
          .ilike("username", user);
        if (res && res.data && res.data.length === 1) {
          data = res.data[0];
          error = null;
        } else if (res && res.data && res.data.length > 1) {
          // intentar match exacto ignorando spaces/case
          const found = res.data.find(r => String(r.username).trim().toLowerCase() === user.toLowerCase());
          if (found) { data = found; error = null; }
        } else {
          data = null;
        }
      }

      if (error) {
        console.error("Error de búsqueda durante login:", error);
        throw error; // Ir al catch de red
      }

      if (!data) {
        // Login fallido (no existe)
        loginBtn.classList.remove("loading");
        loginBtn.innerText = "Entrar";
        if (status) {
          status.innerText = "Credenciales incorrectas";
          status.style.color = "#ff4d4d";
        }
        if (loginPanel) {
          loginPanel.classList.remove("vibrate-error");
          void loginPanel.offsetWidth;
          loginPanel.classList.add("vibrate-error");
          loginPanel.addEventListener("animationend", function x() {
            loginPanel.classList.remove("vibrate-error");
            loginPanel.removeEventListener("animationend", x);
          });
        }
        if (passInputEl) { passInputEl.value = ""; passInputEl.focus(); }
        return;
      }

      // comparar password (trim)
      if (String(data.password).trim() !== pass) {
        loginBtn.classList.remove("loading");
        loginBtn.innerText = "Entrar";
        if (status) {
          status.innerText = "Credenciales incorrectas";
          status.style.color = "#ff4d4d";
        }
        if (loginPanel) {
          loginPanel.classList.remove("vibrate-error");
          void loginPanel.offsetWidth;
          loginPanel.classList.add("vibrate-error");
          loginPanel.addEventListener("animationend", function x() {
            loginPanel.classList.remove("vibrate-error");
            loginPanel.removeEventListener("animationend", x);
          });
        }
        if (passInputEl) { passInputEl.value = ""; passInputEl.focus(); }
        return;
      }

      // Login OK: mantener mismas acciones que tenías antes
      loginBtn.classList.remove("loading");
      loginBtn.classList.add("success");
      loginBtn.innerText = "✔";

      session = { user: data.username, role: data.role };
      localStorage.setItem("session", JSON.stringify(session));

      // Aplicar permisos y UI
      if (document.getElementById("login-overlay")) document.getElementById("login-overlay").style.display = "none";
      if (document.getElementById("login-panel")) document.getElementById("login-panel").style.display = "none";

      const badgeUsernameEl = document.getElementById("badge-username");
      const badgeRoleEl = document.getElementById("badge-role");
      if (badgeUsernameEl) badgeUsernameEl.innerText = data.username;
      if (badgeRoleEl) badgeRoleEl.innerText = data.role;

      if (badge) {
        badge.classList.remove("hidden");
        setTimeout(() => badge.classList.add("expand"), 10);
      }

      checkAccessHours(data.role);
      applyRolePermissions(data.role);

      // Restaurar botón luego de animación
      setTimeout(() => {
        loginBtn.classList.remove("success");
        loginBtn.innerText = "Entrar";
      }, 800);

    } catch (err) {
      console.error("Error en doLogin:", err);
      loginBtn.classList.remove("loading");
      loginBtn.innerText = "Entrar";
      if (status) {
        status.innerText = "Error de conexión";
        status.style.color = "#ff4d4d";
      }
    }
  }

  // ------------------------------
  // logout (igual comportamiento visual)
  // ------------------------------
  function logout() {
    localStorage.removeItem("session");
    session = null;

    // Si no estamos en index, redirigir a index
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
      window.location.href = "index.html";
    } else {
      location.reload();
    }
  }

  // ------------------------------
  // checkAccessHours (igual que tu versión)
  // ------------------------------
  function checkAccessHours(role) {
    const timeLockOverlay = document.getElementById("time-lock-overlay");
    if (!timeLockOverlay) return true;

    if (role === "Admin") {
      timeLockOverlay.style.display = "none";
      return true;
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    let isAllowed = false;

    if (day >= 1 && day <= 5 && hour >= 6 && hour < 18) {
      isAllowed = true;
    } else if (day === 6 && hour >= 7 && hour < 15) {
      isAllowed = true;
    }

    if (isAllowed) timeLockOverlay.style.display = "none";
    else timeLockOverlay.style.display = "flex";

    return true;
  }

  // Re-run checkAccessHours cada minuto
  setInterval(() => {
    if (session && session.role) checkAccessHours(session.role);
  }, 60000);

  // ------------------------------
  // Exponer logout al global (por si otros scripts lo usan)
  // ------------------------------
  window.appLogout = logout;
  window.appVerifySession = verifySession;
})();
