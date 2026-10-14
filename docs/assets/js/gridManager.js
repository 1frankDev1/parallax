/**
 * Menutech Grid Manager - Customizable Dashboard Grid
 * Allows users to resize, reorder, change colors, delete, and restore slots via Tools Panel.
 * Synchronizes layout with LocalStorage & Supabase (user_grid_configs table).
 */

(function () {
  'use strict';

  // Default Grid Slot Configurations
  const DEFAULT_SLOTS = [
    { id: "tile-1",  name: "Formularios", url: "./forms.html", colSpan: 2, rowSpan: 2, bgColor: "#d4ebf7", textColor: "#aeaeae", visible: true, order: 1 },
    { id: "tile-2",  name: "Pos", url: "https://menutech.biz/p40o7s/index.html", colSpan: 2, rowSpan: 1, bgColor: "#ead8ff", textColor: "#aeaeae", visible: true, order: 2 },
    { id: "tile-3",  name: "Website", url: "https://menutech.biz/w111/website.html", colSpan: 2, rowSpan: 1, bgColor: "#ffdfdf", textColor: "#aeaeae", visible: true, order: 3 },
    { id: "tile-4",  name: "Apps", url: "https://menutech.biz/p104/phone.html", colSpan: 1, rowSpan: 2, bgColor: "#ffe1c7", textColor: "#aeaeae", visible: true, order: 4 },
    { id: "tile-5",  name: "Directorio", url: "./directorio.html", colSpan: 3, rowSpan: 2, bgColor: "#d4ebf7", textColor: "#aeaeae", visible: true, order: 5 },
    { id: "tile-6",  name: "T-Shirt", url: "https://menutech.biz/s04/shirt.html", colSpan: 1, rowSpan: 1, bgColor: "#fff7c7", textColor: "#aeaeae", visible: true, order: 6 },
    { id: "tile-7",  name: "Menus", url: "https://menutech.biz/m10/index.html", colSpan: 1, rowSpan: 1, bgColor: "#ffdfdf", textColor: "#aeaeae", visible: true, order: 7 },
    { id: "tile-8",  name: "Flyers", url: "https://menutech.biz/f32/index.html", colSpan: 1, rowSpan: 1, bgColor: "#ead8ff", textColor: "#aeaeae", visible: true, order: 8 },
    { id: "tile-9",  name: "Plataforma", url: "https://menutech.biz/pl555f9a/index.html", colSpan: 3, rowSpan: 1, bgColor: "#d4ebf7", textColor: "#aeaeae", visible: true, order: 9 },
    { id: "tile-10", name: "Audios", url: "./audios.html", colSpan: 2, rowSpan: 1, bgColor: "#ffdfdf", textColor: "#aeaeae", visible: true, order: 10 },
    { id: "tile-11", name: "Render 2D", url: "./render2D.html", colSpan: 1, rowSpan: 1, bgColor: "#e4ffd8", textColor: "#aeaeae", visible: true, order: 11 },
    { id: "tile-12", name: "Render 3D", url: "./render3D.html", colSpan: 1, rowSpan: 1, bgColor: "#fff7c7", textColor: "#aeaeae", visible: true, order: 12 },
    { id: "tile-13", name: "Customer Website", url: "https://menutech.biz/portal", colSpan: 2, rowSpan: 2, bgColor: "#ffe1c7", textColor: "#aeaeae", visible: true, order: 13 },
    { id: "tile-14", name: "Facebook Ads", url: "./fbads.html", colSpan: 2, rowSpan: 1, bgColor: "#ead8ff", textColor: "#aeaeae", visible: true, order: 14 },
    { id: "tile-15", name: "Lector QR", url: "./lectorQR.html", colSpan: 2, rowSpan: 1, bgColor: "#e4ffd8", textColor: "#aeaeae", visible: true, order: 15 },
    { id: "tile-16", name: "Stickers Design", url: "./sticker.html", colSpan: 2, rowSpan: 1, bgColor: "#fff7c7", textColor: "#aeaeae", visible: true, order: 16 },
    { id: "tile-17", name: "Manual Menutech", url: "./manual.html", colSpan: 2, rowSpan: 1, bgColor: "#d4ebf7", textColor: "#aeaeae", visible: true, order: 17 },
    { id: "tile-18", name: "packages", url: "./pricing.html", colSpan: 2, rowSpan: 1, bgColor: "#ead8ff", textColor: "#aeaeae", visible: true, order: 18 },
    { id: "tile-19", name: "Notificaciones", url: "./notificaciones.html", colSpan: 2, rowSpan: 1, bgColor: "#ffdfdf", textColor: "#aeaeae", visible: true, order: 19 },
    { id: "tile-20", name: "Admin Pricing", url: "./adminPricing.html", colSpan: 2, rowSpan: 1, bgColor: "#ffe1c7", textColor: "#aeaeae", visible: true, order: 20 },
    { id: "tile-21", name: "Meeting", url: "https://menutech.whereby.com/org/rooms/create-room", colSpan: 2, rowSpan: 1, bgColor: "#ffdfdf", textColor: "#aeaeae", visible: true, order: 21 }
  ];

  let currentSlots = [];
  let currentUsername = 'default';
  let draggedTileId = null;
  let activeColorTileId = null;

  // Initialize Manager
  document.addEventListener("DOMContentLoaded", () => {
    initGridManager();
  });

  function getUsername() {
    try {
      const saved = localStorage.getItem("session");
      if (saved) {
        const sess = JSON.parse(saved);
        if (sess && sess.user) return sess.user;
      }
    } catch (e) { console.error(e); }
    return 'default';
  }

  async function initGridManager() {
    currentUsername = getUsername();
    injectStyles();
    await loadConfig();
    renderGrid();
    injectToolsPanelUI();
    injectColorModalUI();
  }

  // Inject CSS Styles
  function injectStyles() {
    if (document.getElementById("mt-grid-styles")) return;
    const style = document.createElement("style");
    style.id = "mt-grid-styles";
    style.textContent = `
      .square {
        position: relative;
        transition: all 0.3s ease;
      }

      .square .tile {
        position: relative;
        user-select: none;
        transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
      }

      .square .tile.dragging {
        opacity: 0.4;
        transform: scale(0.96);
        box-shadow: 0 0 15px rgba(255, 140, 0, 0.6);
      }

      .square .tile.drag-over {
        border: 2px dashed #ff8c00 !important;
        transform: scale(1.02);
      }

      /* Control Buttons on Tiles */
      .tile-ctrl-btn {
        position: absolute;
        top: 6px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.55);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0.6;
        transition: all 0.2s ease;
        z-index: 20;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      }

      .tile-ctrl-btn:hover {
        opacity: 1;
        transform: scale(1.15);
      }

      .tile-delete-btn {
        right: 6px;
      }
      .tile-delete-btn:hover {
        background: #ff4d4d;
      }

      .tile-color-btn {
        left: 6px;
      }
      .tile-color-btn:hover {
        background: #ff8c00;
      }

      /* Corner Resize Handle */
      .tile-resize-handle {
        position: absolute;
        bottom: 3px;
        right: 3px;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        z-index: 20;
        user-select: none;
        font-weight: bold;
        transition: transform 0.2s, color 0.2s;
      }

      .tile-resize-handle:hover {
        color: #ff8c00;
        transform: scale(1.25);
      }

      /* Resize Preview Indicator */
      .tile-size-badge {
        position: absolute;
        bottom: 6px;
        left: 6px;
        font-size: 10px;
        background: rgba(0,0,0,0.4);
        color: #fff;
        padding: 2px 6px;
        border-radius: 6px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .square .tile:hover .tile-size-badge {
        opacity: 0.7;
      }

      /* Tools Panel Trigger Button & Drawer */
      #tools-panel-trigger {
        position: fixed;
        bottom: 20px;
        left: 310px;
        z-index: 9990;
        background: #161b22;
        color: #ffffff;
        border: 1px solid rgba(255, 140, 0, 0.4);
        padding: 10px 18px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      #tools-panel-trigger:hover {
        background: var(--brand-color, #ff8c00);
        box-shadow: 0 8px 25px rgba(255, 140, 0, 0.5);
        transform: translateY(-2px);
      }

      #tools-badge {
        background: #ff4d4d;
        color: #fff;
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 11px;
        font-weight: bold;
      }

      /* Tools Drawer Modal */
      #tools-drawer {
        position: fixed;
        bottom: -450px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 850px;
        height: 380px;
        background: rgba(22, 27, 34, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        backdrop-filter: blur(16px);
        box-shadow: 0 -10px 40px rgba(0,0,0,0.6);
        z-index: 10005;
        transition: bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
      }

      #tools-drawer.open {
        bottom: 0;
      }

      .tools-drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 12px;
        margin-bottom: 15px;
      }

      .tools-drawer-header h3 {
        margin: 0;
        font-size: 18px;
        color: var(--brand-color, #ff8c00);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tools-drawer-close {
        background: transparent;
        border: none;
        color: #8b949e;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.2s;
      }
      .tools-drawer-close:hover {
        color: #ffffff;
      }

      .tools-slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        overflow-y: auto;
        flex: 1;
        padding-right: 5px;
      }

      .tools-slot-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        gap: 8px;
        transition: all 0.2s ease;
      }

      .tools-slot-card:hover {
        background: rgba(255,255,255,0.1);
        border-color: var(--brand-color, #ff8c00);
      }

      .tools-slot-title {
        font-size: 13px;
        font-weight: 600;
        color: #e6edf3;
      }

      .tools-add-btn {
        background: var(--brand-color, #ff8c00);
        border: none;
        color: #fff;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
      }
      .tools-add-btn:hover {
        background: var(--brand-hover, #ffa733);
        transform: scale(1.05);
      }

      .tools-drawer-actions {
        margin-top: 15px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .btn-reset-layout {
        background: transparent;
        border: 1px solid #ff4d4d;
        color: #ff4d4d;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-reset-layout:hover {
        background: rgba(255,77,77,0.15);
      }

      /* Color Modal Overlay & Dialog */
      #grid-color-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10010;
      }

      #grid-color-modal.open {
        display: flex;
        animation: fadeIn 0.25s ease;
      }

      .color-modal-box {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 16px;
        width: 90%;
        max-width: 380px;
        padding: 22px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        color: #ffffff;
      }

      .color-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid #30363d;
        padding-bottom: 10px;
      }

      .color-modal-header h4 {
        margin: 0;
        color: var(--brand-color, #ff8c00);
        font-size: 16px;
      }

      .color-group {
        margin-bottom: 16px;
      }

      .color-group label {
        display: block;
        font-size: 12px;
        color: #8b949e;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .color-swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.2);
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s;
      }

      .color-swatch:hover {
        transform: scale(1.2);
        border-color: #ffffff;
      }

      .custom-color-input {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        padding: 0;
      }

      @media (max-width: 768px) {
        #tools-panel-trigger {
          left: 15px;
          bottom: 80px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Load configuration from Supabase or LocalStorage
  async function loadConfig() {
    let loadedConfig = null;

    // 1. Try Supabase if initialized
    if (window.mtSupabase && currentUsername !== 'default') {
      try {
        const { data, error } = await window.mtSupabase
          .from("user_grid_configs")
          .select("grid_config")
          .eq("username", currentUsername)
          .maybeSingle();

        if (data && data.grid_config && Array.isArray(data.grid_config)) {
          loadedConfig = data.grid_config;
        }
      } catch (err) {
        console.warn("Could not load grid config from Supabase:", err);
      }
    }

    // 2. Fallback to LocalStorage
    if (!loadedConfig) {
      try {
        const local = localStorage.getItem(`mt_grid_config_${currentUsername}`);
        if (local) loadedConfig = JSON.parse(local);
      } catch (e) { console.error(e); }
    }

    // 3. Merge loadedConfig with DEFAULT_SLOTS
    if (loadedConfig && Array.isArray(loadedConfig)) {
      currentSlots = DEFAULT_SLOTS.map(defSlot => {
        const found = loadedConfig.find(s => s.id === defSlot.id);
        if (found) {
          return {
            ...defSlot,
            colSpan: found.colSpan || defSlot.colSpan,
            rowSpan: found.rowSpan || defSlot.rowSpan,
            bgColor: found.bgColor || defSlot.bgColor,
            textColor: found.textColor || defSlot.textColor,
            visible: typeof found.visible === 'boolean' ? found.visible : defSlot.visible,
            order: typeof found.order === 'number' ? found.order : defSlot.order
          };
        }
        return defSlot;
      });
      currentSlots.sort((a, b) => a.order - b.order);
    } else {
      currentSlots = JSON.parse(JSON.stringify(DEFAULT_SLOTS));
    }
  }

  // Save Config to LocalStorage and Supabase
  async function saveConfig() {
    try {
      localStorage.setItem(`mt_grid_config_${currentUsername}`, JSON.stringify(currentSlots));
    } catch (e) { console.error(e); }

    if (window.mtSupabase && currentUsername !== 'default') {
      try {
        await window.mtSupabase.from("user_grid_configs").upsert({
          username: currentUsername,
          grid_config: currentSlots,
          updated_at: new Date().toISOString()
        }, { onConflict: 'username' });
      } catch (err) {
        console.warn("Error persisting grid config to Supabase:", err);
      }
    }

    updateToolsBadge();
  }

  // Render Grid Tiles in Container
  function renderGrid() {
    const container = document.getElementById("squareContainer") || document.querySelector(".square");
    if (!container) return;

    // Ensure all tiles are ordered correctly
    currentSlots.forEach((slot, idx) => slot.order = idx + 1);

    currentSlots.forEach(slot => {
      let tileEl = document.getElementById(slot.id);
      if (!tileEl) return;

      if (!slot.visible) {
        tileEl.style.display = "none";
        return;
      }

      // Show and position tile
      tileEl.style.display = "flex";
      tileEl.style.gridColumn = `span ${slot.colSpan}`;
      tileEl.style.gridRow = `span ${slot.rowSpan}`;
      tileEl.style.backgroundColor = slot.bgColor;
      tileEl.style.color = slot.textColor;

      // Ensure text span reflects text color
      const textSpan = tileEl.querySelector("span");
      if (textSpan) textSpan.style.color = slot.textColor;

      // Ensure Controls are injected
      attachTileControls(tileEl, slot);
    });

    // Reorder DOM elements inside .square according to currentSlots
    currentSlots.forEach(slot => {
      const tileEl = document.getElementById(slot.id);
      if (tileEl && tileEl.parentElement === container) {
        container.appendChild(tileEl);
      }
    });

    updateToolsBadge();
  }

  // Attach control overlay (Delete, Color, Resize, Drag) to a Tile
  function attachTileControls(tileEl, slot) {
    tileEl.setAttribute("draggable", "true");

    // 1. Delete Button
    let delBtn = tileEl.querySelector(".tile-delete-btn");
    if (!delBtn) {
      delBtn = document.createElement("button");
      delBtn.className = "tile-ctrl-btn tile-delete-btn";
      delBtn.title = "Quitar slot";
      delBtn.innerText = "✕";
      tileEl.appendChild(delBtn);
    }
    delBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      slot.visible = false;
      saveConfig();
      renderGrid();
      renderToolsDrawerList();
    };

    // 2. Color Button
    let colorBtn = tileEl.querySelector(".tile-color-btn");
    if (!colorBtn) {
      colorBtn = document.createElement("button");
      colorBtn.className = "tile-ctrl-btn tile-color-btn";
      colorBtn.title = "Personalizar color";
      colorBtn.innerText = "🎨";
      tileEl.appendChild(colorBtn);
    }
    colorBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      openColorModal(slot.id);
    };

    // 3. Resize Corner Handle
    let resizeHandle = tileEl.querySelector(".tile-resize-handle");
    if (!resizeHandle) {
      resizeHandle = document.createElement("div");
      resizeHandle.className = "tile-resize-handle";
      resizeHandle.title = "Arrastrar para cambiar tamaño";
      resizeHandle.innerText = "↘";
      tileEl.appendChild(resizeHandle);
    }

    // 4. Size Badge Indicator
    let sizeBadge = tileEl.querySelector(".tile-size-badge");
    if (!sizeBadge) {
      sizeBadge = document.createElement("div");
      sizeBadge.className = "tile-size-badge";
      tileEl.appendChild(sizeBadge);
    }
    sizeBadge.innerText = `${slot.colSpan}x${slot.rowSpan}`;

    // Resize Handle Drag Logic
    let isResizing = false;
    let startX = 0, startY = 0;
    let startCol = slot.colSpan, startRow = slot.rowSpan;

    const onMouseMove = (e) => {
      if (!isResizing) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Approximate grid cell size
      const cellWidth = (tileEl.parentElement.clientWidth / 6) || 120;
      const cellHeight = 85;

      let newCol = Math.max(1, Math.min(6, startCol + Math.round(deltaX / cellWidth)));
      let newRow = Math.max(1, Math.min(6, startRow + Math.round(deltaY / cellHeight)));

      if (newCol !== slot.colSpan || newRow !== slot.rowSpan) {
        slot.colSpan = newCol;
        slot.rowSpan = newRow;
        tileEl.style.gridColumn = `span ${newCol}`;
        tileEl.style.gridRow = `span ${newRow}`;
        sizeBadge.innerText = `${newCol}x${newRow}`;
      }
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        saveConfig();
      }
    };

    resizeHandle.onmousedown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startCol = slot.colSpan;
      startRow = slot.rowSpan;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    // Drag and Drop Reordering
    tileEl.ondragstart = (e) => {
      draggedTileId = slot.id;
      tileEl.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", slot.id);
    };

    tileEl.ondragend = () => {
      tileEl.classList.remove("dragging");
      document.querySelectorAll(".square .tile").forEach(t => t.classList.remove("drag-over"));
      draggedTileId = null;
    };

    tileEl.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedTileId && draggedTileId !== slot.id) {
        tileEl.classList.add("drag-over");
      }
    };

    tileEl.ondragleave = () => {
      tileEl.classList.remove("drag-over");
    };

    tileEl.ondrop = (e) => {
      e.preventDefault();
      tileEl.classList.remove("drag-over");
      if (!draggedTileId || draggedTileId === slot.id) return;

      const fromIdx = currentSlots.findIndex(s => s.id === draggedTileId);
      const toIdx = currentSlots.findIndex(s => s.id === slot.id);

      if (fromIdx !== -1 && toIdx !== -1) {
        const movedItem = currentSlots.splice(fromIdx, 1)[0];
        currentSlots.splice(toIdx, 0, movedItem);
        saveConfig();
        renderGrid();
      }
    };
  }

  // Inject UI for Tools Panel Button & Slide-up Drawer
  function injectToolsPanelUI() {
    if (document.getElementById("tools-panel-trigger")) return;

    // Trigger Button
    const trigger = document.createElement("button");
    trigger.id = "tools-panel-trigger";
    trigger.innerHTML = `
      <span>🧰</span>
      <span class="tools-btn-label">Panel de Herramientas</span>
      <span id="tools-badge">0</span>
    `;
    document.body.appendChild(trigger);

    // Drawer Container
    const drawer = document.createElement("div");
    drawer.id = "tools-drawer";
    drawer.innerHTML = `
      <div class="tools-drawer-header">
        <h3>🧰 Panel de Herramientas (Slots)</h3>
        <button id="close-tools-drawer" class="tools-drawer-close">✕</button>
      </div>
      <div id="tools-slots-list" class="tools-slots-grid"></div>
      <div class="tools-drawer-actions">
        <button id="btn-reset-grid" class="btn-reset-layout">Restablecer Diseño Original</button>
      </div>
    `;
    document.body.appendChild(drawer);

    // Events
    trigger.onclick = () => {
      drawer.classList.toggle("open");
      renderToolsDrawerList();
    };

    document.getElementById("close-tools-drawer").onclick = () => {
      drawer.classList.remove("open");
    };

    document.getElementById("btn-reset-grid").onclick = () => {
      if (confirm("¿Deseas restablecer el diseño y colores de todos los slots al estado original?")) {
        currentSlots = JSON.parse(JSON.stringify(DEFAULT_SLOTS));
        saveConfig();
        renderGrid();
        renderToolsDrawerList();
        drawer.classList.remove("open");
      }
    };

    updateToolsBadge();
  }

  // Render list of removed slots in Tools Drawer
  function renderToolsDrawerList() {
    const listContainer = document.getElementById("tools-slots-list");
    if (!listContainer) return;

    const removedSlots = currentSlots.filter(s => !s.visible);

    if (removedSlots.length === 0) {
      listContainer.innerHTML = `<p style="grid-column: 1/-1; color: #8b949e; text-align: center; padding: 20px;">Todos los slots están visibles en el grid.</p>`;
      return;
    }

    listContainer.innerHTML = "";
    removedSlots.forEach(slot => {
      const card = document.createElement("div");
      card.className = "tools-slot-card";
      card.innerHTML = `
        <div class="tools-slot-title">${slot.name}</div>
        <button class="tools-add-btn">+ Agregar al Grid</button>
      `;

      card.querySelector(".tools-add-btn").onclick = () => {
        slot.visible = true;
        saveConfig();
        renderGrid();
        renderToolsDrawerList();
      };

      listContainer.appendChild(card);
    });
  }

  function updateToolsBadge() {
    const badge = document.getElementById("tools-badge");
    if (!badge) return;
    const count = currentSlots.filter(s => !s.visible).length;
    badge.innerText = count;
  }

  // Inject UI for Color Customization Modal
  function injectColorModalUI() {
    if (document.getElementById("grid-color-modal")) return;

    const modal = document.createElement("div");
    modal.id = "grid-color-modal";
    modal.innerHTML = `
      <div class="color-modal-box">
        <div class="color-modal-header">
          <h4 id="color-modal-title">Personalizar Slot</h4>
          <button id="close-color-modal" class="tools-drawer-close">✕</button>
        </div>

        <div class="color-group">
          <label>COLOR DE FONDO</label>
          <div class="color-swatches" id="bg-swatches">
            <div class="color-swatch" data-bg="#d4ebf7" style="background:#d4ebf7;"></div>
            <div class="color-swatch" data-bg="#ead8ff" style="background:#ead8ff;"></div>
            <div class="color-swatch" data-bg="#ffdfdf" style="background:#ffdfdf;"></div>
            <div class="color-swatch" data-bg="#ffe1c7" style="background:#ffe1c7;"></div>
            <div class="color-swatch" data-bg="#fff7c7" style="background:#fff7c7;"></div>
            <div class="color-swatch" data-bg="#e4ffd8" style="background:#e4ffd8;"></div>
            <div class="color-swatch" data-bg="#1e293b" style="background:#1e293b;"></div>
            <div class="color-swatch" data-bg="#ff8c00" style="background:#ff8c00;"></div>
            <input type="color" id="bg-custom-picker" class="custom-color-input" title="Color personalizado">
          </div>
        </div>

        <div class="color-group">
          <label>COLOR DE LETRA</label>
          <div class="color-swatches" id="text-swatches">
            <div class="color-swatch" data-text="#aeaeae" style="background:#aeaeae;"></div>
            <div class="color-swatch" data-text="#ffffff" style="background:#ffffff;"></div>
            <div class="color-swatch" data-text="#222222" style="background:#222222;"></div>
            <div class="color-swatch" data-text="#ff8c00" style="background:#ff8c00;"></div>
            <div class="color-swatch" data-text="#87CEEB" style="background:#87CEEB;"></div>
            <input type="color" id="text-custom-picker" class="custom-color-input" title="Color personalizado">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("close-color-modal").onclick = closeColorModal;

    // Attach swatch handlers
    document.querySelectorAll("#bg-swatches .color-swatch").forEach(sw => {
      sw.onclick = () => {
        if (!activeColorTileId) return;
        const bg = sw.getAttribute("data-bg");
        updateTileColor(activeColorTileId, bg, null);
      };
    });

    document.getElementById("bg-custom-picker").oninput = (e) => {
      if (!activeColorTileId) return;
      updateTileColor(activeColorTileId, e.target.value, null);
    };

    document.querySelectorAll("#text-swatches .color-swatch").forEach(sw => {
      sw.onclick = () => {
        if (!activeColorTileId) return;
        const textCol = sw.getAttribute("data-text");
        updateTileColor(activeColorTileId, null, textCol);
      };
    });

    document.getElementById("text-custom-picker").oninput = (e) => {
      if (!activeColorTileId) return;
      updateTileColor(activeColorTileId, null, e.target.value);
    };
  }

  function openColorModal(tileId) {
    activeColorTileId = tileId;
    const slot = currentSlots.find(s => s.id === tileId);
    if (!slot) return;

    const titleEl = document.getElementById("color-modal-title");
    if (titleEl) titleEl.innerText = `Personalizar Slot: ${slot.name}`;

    const modal = document.getElementById("grid-color-modal");
    if (modal) modal.classList.add("open");
  }

  function closeColorModal() {
    activeColorTileId = null;
    const modal = document.getElementById("grid-color-modal");
    if (modal) modal.classList.remove("open");
  }

  function updateTileColor(tileId, bg, text) {
    const slot = currentSlots.find(s => s.id === tileId);
    if (!slot) return;

    if (bg) slot.bgColor = bg;
    if (text) slot.textColor = text;

    saveConfig();
    renderGrid();
  }

  // Expose global re-render function in case external scripts update tiles
  window.mtRenderGrid = renderGrid;

})();
