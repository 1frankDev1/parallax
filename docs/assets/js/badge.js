(function() {
    // === HACER EL NAV ARRASTRABLE ===
    const mtNeoNav = document.querySelector('.neo-nav-container');
    const dragHintEl = document.getElementById('dragHint');

    if (!mtNeoNav) return;

    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    // Cargar posición guardada
    const savedX = localStorage.getItem('neoNavX');
    const savedY = localStorage.getItem('neoNavY');

    if (savedX && savedY) {
        mtNeoNav.style.left = savedX + "px";
        mtNeoNav.style.top = savedY + "px";
        mtNeoNav.style.bottom = "auto";
        mtNeoNav.style.transform = "none";
    }

    // Mostrar hint solo primera vez
    if (!localStorage.getItem("seenNavDragHint") && dragHintEl) {
        setTimeout(() => {
            dragHintEl.style.opacity = "1";
            dragHintEl.classList.add("pulsing");

            // Pequeño movimiento animado del nav (para indicar que se mueve)
            if (typeof TinyAnimate !== 'undefined') {
                TinyAnimate.animate(mtNeoNav, "bottom", 20, 30, 600, "easeInOutSine", () => {
                    TinyAnimate.animate(mtNeoNav, "bottom", 30, 20, 600, "easeInOutSine");
                });
            }

        }, 800);
    }

    // Iniciar arrastre
    mtNeoNav.addEventListener('mousedown', (e) => {
        dragging = true;

        offsetX = e.clientX - mtNeoNav.offsetLeft;
        offsetY = e.clientY - mtNeoNav.offsetTop;

        mtNeoNav.style.transition = "none";

        // Ocultar hint en cuanto empiece a mover
        if (!localStorage.getItem("seenNavDragHint")) {
            if (dragHintEl) {
                dragHintEl.style.opacity = "0";
                dragHintEl.classList.remove("pulsing");
            }
            localStorage.setItem("seenNavDragHint", "true");
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Limitar a pantalla
        x = Math.max(0, Math.min(window.innerWidth - mtNeoNav.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - mtNeoNav.offsetHeight, y));

        mtNeoNav.style.left = x + "px";
        mtNeoNav.style.top = y + "px";
        mtNeoNav.style.bottom = "auto";
        mtNeoNav.style.transform = "none";
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;

        // Guardar posición
        localStorage.setItem('neoNavX', mtNeoNav.offsetLeft);
        localStorage.setItem('neoNavY', mtNeoNav.offsetTop);

        mtNeoNav.style.transition = "";
    });

    // Botón Atrás
    const backBtn = document.getElementById("neoNavBack");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (window.history.length > 1) window.history.back();
        });
    }

    // Botón Inicio
    const homeBtn = document.getElementById("neoNavHome");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "index.html"; // Cambia por tu ruta principal
        });
    }
})();
