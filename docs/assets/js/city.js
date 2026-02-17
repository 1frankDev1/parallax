// Datos de restaurantes con nombre, url y url imagen
const restaurantData = {
    "texas": {
        "dallas": [
            {
                name: "La Cocina de Tijuana",
                url: "https://acatras.com",
                img: "https://menutech.services/assets/img/LA%20COCINA%20DE%20TIJUANA%20(38).png"
            },
            {
                name: "Buffalo",
                url: "https://bufalo.com",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Alex Tacos",
                url: "https://vikingantonio.github.io/alextacosapp/",
                img: "https://menutech.services/assets/img/LA%20COCINA%20DE%20TIJUANA%20(18).png"
            }
        ]
        // Puedes agregar más ciudades y restaurantes
    },
    "california": {
        "losangeles": [
            {
                name: "Buffalo",
                url: "https://menutechdeveloper.github.io/restaurante2/",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Buffalo",
                url: "https://menutechdeveloper.github.io/restaurante2/",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Buffalo",
                url: "https://menutechdeveloper.github.io/restaurante2/",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Buffalo",
                url: "https://menutechdeveloper.github.io/restaurante2/",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Buffalo",
                url: "https://menutechdeveloper.github.io/restaurante2/",
                img: "https://menutech.services/assets/img/herradero.png"
            },
            {
                name: "Alex Tacos",
                url: "https://vikingantonio.github.io/alextacosapp/",
                img: "https://menutech.services/assets/img/LA%20COCINA%20DE%20TIJUANA%20(38).png"
            }
            
        ]
        // Puedes agregar más ciudades y restaurantes
    },
    "florida": {
        "miami": [
            {
                name: "Restaurante A",
                url: "#",
                img: "https://example.com/imgA.png"
            }
            // Más restaurantes...
        ]
    }
    // Más estados...
};

// Obtener parámetros de URL
const params = new URLSearchParams(window.location.search);
const state = params.get('state');
const city = params.get('city');


const heading = document.getElementById('heading');
const container = document.getElementById('citys');

if (!state || !city || !restaurantData[state] || !restaurantData[state][city]) {
    heading.textContent = "Ciudad no encontrada";
    container.innerHTML = "";
} else {
    heading.textContent = `Restaurantes en ${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.charAt(0).toUpperCase() + state.slice(1)}`;

    // Limpiamos contenido previo
    container.innerHTML = "";

    // Crear contenedor principal .container.linea
    const containerDiv = document.createElement('div');
    containerDiv.className = "container linea";

    // Crear fila .row
    const rowDiv = document.createElement('div');
    rowDiv.className = "row";

    // Recorrer restaurantes y crear estructura con col-4 col-md-4
    restaurantData[state][city].forEach(rest => {
        const colDiv = document.createElement('div');
        colDiv.className = "col-4 col-md-4";

        const a = document.createElement('a');
        a.href = rest.url;
        a.title = rest.name;
        a.target = "_blank";  // Abrir en pestaña nueva

        const img = document.createElement('img');
        img.src = rest.img;
        img.alt = rest.name;
        img.style.width = "100%"; // Ajusta según necesites

        a.appendChild(img);
        colDiv.appendChild(a);
        rowDiv.appendChild(colDiv);
    });

    containerDiv.appendChild(rowDiv);
    container.appendChild(containerDiv);
}
