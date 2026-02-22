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
      initNotifications();

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

      // Mostrar el tile de notificaciones para admins
      const notifTile = document.getElementById("tile-18");
      if (notifTile) notifTile.classList.remove("hidden");
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

  // ------------------------------
  // Lógica de Notificaciones
  // ------------------------------
  let currentMaxId = 0;

  async function initNotifications() {
    injectNotificationUI();
    const iconContainer = document.getElementById("notification-icon-container");
    const panel = document.getElementById("notification-panel");
    const closeBtn = document.getElementById("close-notifications");

    if (!iconContainer || !session) return;

    // Asegurar que Supabase esté inicializado
    if (!supabase) {
        await initSupabase();
    }

    iconContainer.classList.remove("hidden");

    iconContainer.onclick = (e) => {
        e.stopPropagation();
        toggleNotificationPanel();
    };

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationPanel(false);
        };
    }

    // Cerrar panel al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (panel && !panel.classList.contains("hidden") && !panel.contains(e.target) && !iconContainer.contains(e.target)) {
            toggleNotificationPanel(false);
        }
    });

    loadNotifications();
    setInterval(loadNotifications, 60000); // Verificar cada minuto
  }

  function toggleNotificationPanel(show) {
    const panel = document.getElementById("notification-panel");
    if (!panel) return;

    const isHidden = panel.classList.contains("hidden");
    const shouldShow = show !== undefined ? show : isHidden;

    if (shouldShow) {
        panel.classList.remove("hidden");
        void panel.offsetWidth;
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0)";

        // Al abrir, marcar como leídas
        markNotificationsAsRead();
    } else {
        panel.style.opacity = "0";
        panel.style.transform = "translateY(-10px)";
        setTimeout(() => {
            panel.classList.add("hidden");
        }, 300);
    }
  }

  async function loadNotifications() {
    if (!supabase || !session) return;

    try {
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        const filtered = data.filter(n => {
            if (n.tipo_destino === 'all') return true;
            if (n.tipo_destino === 'roles' && Array.isArray(n.destinos) && n.destinos.includes(session.role)) return true;
            if (n.tipo_destino === 'users' && Array.isArray(n.destinos) && n.destinos.includes(session.user)) return true;
            return false;
        });

        if (filtered.length > 0) {
            currentMaxId = Math.max(...filtered.map(n => n.id));
        }

        renderNotifications(filtered);
        updateBadge(filtered);
    } catch (err) {
        console.error("Error al cargar notificaciones:", err);
    }
  }

  function renderNotifications(notifications) {
    const list = document.getElementById("notification-list");
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = `<p style="color: #8b949e; text-align: center; padding: 20px;">No hay mensajes nuevos</p>`;
        return;
    }

    list.innerHTML = '';
    notifications.forEach(n => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 12px; border-bottom: 1px solid #30363d; margin-bottom: 8px; background: #1c2128; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);";

        const meta = document.createElement('div');
        meta.style.cssText = "font-size: 11px; color: #8b949e; margin-bottom: 5px; display: flex; justify-content: space-between;";

        const emisor = document.createElement('span');
        emisor.textContent = `De: ${n.emisor}`;

        const fecha = document.createElement('span');
        const dateObj = new Date(n.created_at);
        fecha.textContent = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        meta.appendChild(emisor);
        meta.appendChild(fecha);

        const content = document.createElement('div');
        content.style.cssText = "font-size: 14px; line-height: 1.4; color: #e6edf3; white-space: pre-wrap;";
        content.textContent = n.mensaje;

        item.appendChild(meta);
        item.appendChild(content);
        list.appendChild(item);
    });
  }

  function updateBadge(notifications) {
    const badge = document.getElementById("notification-badge");
    if (!badge) return;

    const lastSeenId = parseInt(localStorage.getItem('last_seen_notification_id') || '0');
    const unreadCount = notifications.filter(n => n.id > lastSeenId).length;

    if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
  }

  function markNotificationsAsRead() {
    if (currentMaxId > 0) {
        localStorage.setItem('last_seen_notification_id', currentMaxId);
        const badge = document.getElementById("notification-badge");
        if (badge) badge.classList.add("hidden");
    }
  }

  function injectNotificationUI() {
    if (document.getElementById("notification-icon-container")) return;

    const notifContainer = document.createElement("div");
    notifContainer.innerHTML = `
        <!-- ICONO DE NOTIFICACIONES -->
        <div id="notification-icon-container" class="hidden" style="position: fixed; top: 15px; right: 80px; z-index: 2000; cursor: pointer; display: flex; align-items: center;">
            <span id="notification-badge" class="hidden" style="background: #ff0000; color: white; border-radius: 10px; padding: 2px 8px; font-size: 12px; font-weight: bold; margin-right: 20px; box-shadow: 0 0 5px rgba(0,0,0,0.3); z-index: 2001;">0</span>
            <div style="background: #ffffff !important; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3); transition: transform 0.25s;">
                <svg id="notification-icon" viewBox="0 0 24 24" style="width: 26px; height: 26px; fill: #ff8c00 !important; display: block !important;">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#ff8c00"/>
                </svg>
            </div>
        </div>

        <!-- PANEL DE NOTIFICACIONES -->
        <div id="notification-panel" class="hidden" style="position: fixed; top: 60px; right: 20px; width: 320px; max-height: 450px; background: #161b22; border: 1px solid #30363d; border-radius: 12px; color: white; z-index: 2001; overflow-y: auto; padding: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.5); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; transition: opacity 0.3s, transform 0.3s; opacity: 0; transform: translateY(-10px);">
            <div style="padding: 15px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; background: #0d1117; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                <h3 style="margin: 0; font-size: 16px;">Notificaciones</h3>
                <span id="close-notifications" style="cursor: pointer; opacity: 0.7;">✕</span>
            </div>
            <div id="notification-list" style="padding: 10px;">
                <p style="color: #8b949e; text-align: center; padding: 20px;">Cargando...</p>
            </div>
        </div>
    `;
    document.body.appendChild(notifContainer);
  }
})();
