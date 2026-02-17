 // === HACER EL NAV ARRASTRABLE ===
const nav = document.querySelector('.neo-nav-container');
const hint = document.getElementById('dragHint');

let offsetX = 0;
let offsetY = 0;
let dragging = false;

// Cargar posición guardada
const savedX = localStorage.getItem('neoNavX');
const savedY = localStorage.getItem('neoNavY');

if (savedX && savedY) {
    nav.style.left = savedX + "px";
    nav.style.top = savedY + "px";
    nav.style.bottom = "auto";
    nav.style.transform = "none";
}

// Mostrar hint solo primera vez
if (!localStorage.getItem("seenNavDragHint")) {
    setTimeout(() => {
        hint.style.opacity = "1";
        hint.classList.add("pulsing");

        // Pequeño movimiento animado del nav (para indicar que se mueve)
        TinyAnimate.animate(nav, "bottom", 20, 30, 600, "easeInOutSine", () => {
            TinyAnimate.animate(nav, "bottom", 30, 20, 600, "easeInOutSine");
        });

    }, 800);
}

// Iniciar arrastre
nav.addEventListener('mousedown', (e) => {
    dragging = true;

    offsetX = e.clientX - nav.offsetLeft;
    offsetY = e.clientY - nav.offsetTop;

    nav.style.transition = "none";

    // Ocultar hint en cuanto empiece a mover
    if (!localStorage.getItem("seenNavDragHint")) {
        hint.style.opacity = "0";
        hint.classList.remove("pulsing");
        localStorage.setItem("seenNavDragHint", "true");
    }
});

document.addEventListener('mousemove', (e) => {
    if (!dragging) return;

    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // Limitar a pantalla
    x = Math.max(0, Math.min(window.innerWidth - nav.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - nav.offsetHeight, y));

    nav.style.left = x + "px";
    nav.style.top = y + "px";
    nav.style.bottom = "auto";
    nav.style.transform = "none";
});

document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;

    // Guardar posición
    localStorage.setItem('neoNavX', nav.offsetLeft);
    localStorage.setItem('neoNavY', nav.offsetTop);

    nav.style.transition = "";
});

// Botón Atrás
document.getElementById("neoNavBack").addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
});

// Botón Inicio
document.getElementById("neoNavHome").addEventListener("click", () => {
    window.location.href = "index.html"; // Cambia por tu ruta principal
});