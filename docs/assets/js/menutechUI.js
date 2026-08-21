class MenutechGradient extends HTMLElement{static get observedAttributes(){return["colors","speed","angle","overlay-opacity","blur"]}constructor(){super(),this.shadow=this.attachShadow({mode:"open"})}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute("colors")||"#ff6b6b,#f06595,#845ef7,#339af0,#22b8cf,#51cf66,#fcc419",t=this.getAttribute("speed")||"30s",i=this.getAttribute("angle")||"45deg",r=this.getAttribute("overlay-opacity")||.1,o=this.getAttribute("blur")||"5px";this.shadow.innerHTML=`
      <style>
        :host {display:block;position:fixed; top:0; left:0;width:100vw; height:100vh;overflow:hidden;z-index:-1;}

     .background-wrapper{position:absolute;top:0;left:0;width:200%;height:200%;background:linear-gradient(${i},${e});background-size:200% 200%;will-change:transform;animation:moveGradient ${t} linear infinite}.overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,${r});backdrop-filter:blur(${o});z-index:0}@keyframes moveGradient{0%{transform:translate(0%,0%)}50%{transform:translate(-50%,-50%)}100%{transform:translate(0%,0%)}}

      </style>
     <div class="background-wrapper"></div><div class="overlay"></div><slot></slot>
    `}}customElements.define("menutech-gradient",MenutechGradient);class MenutechParticles extends HTMLElement{static get observedAttributes(){return["count","color","min-size","max-size","speed","image","opacity","direction"]}constructor(){super(),this.shadow=this.attachShadow({mode:"open"})}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=parseInt(this.getAttribute("count"))||50,t=this.getAttribute("color")||"#ffffff",i=parseFloat(this.getAttribute("min-size"))||3,r=parseFloat(this.getAttribute("max-size"))||8,o=parseFloat(this.getAttribute("speed"))||1,s=parseFloat(this.getAttribute("opacity"))||1,a=(this.getAttribute("direction")||"all").toLowerCase(),n=this.getAttribute("image")||null;this.shadow.innerHTML=`
      <style>:host { position: fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:1000; }canvas { width:100%; height:100%; display:block; }</style><canvas></canvas>
    `;let l=this.shadow.querySelector("canvas"),d=l.getContext("2d"),c=()=>{l.width=window.innerWidth,l.height=window.innerHeight};window.addEventListener("resize",c),c();let p=[];for(let h=0;h<e;h++){let $=i+Math.random()*(r-i),u=0,b=0;switch(a){case"top":u=0,b=-o*(.5+Math.random());break;case"bottom":u=0,b=o*(.5+Math.random());break;case"left":u=-o*(.5+Math.random()),b=0;break;case"right":u=o*(.5+Math.random()),b=0;break;case"all":u=(Math.random()-.5)*o,b=(Math.random()-.5)*o}p.push({x:Math.random()*l.width,y:Math.random()*l.height,vx:u,vy:b,size:$,opacity:s})}let g=null;n&&((g=new Image).src=n);let x=()=>{for(let e of(d.clearRect(0,0,l.width,l.height),p))e.x+=e.vx,e.y+=e.vy,e.x<-e.size&&(e.x=l.width+e.size),e.x>l.width+e.size&&(e.x=-e.size),e.y<-e.size&&(e.y=l.height+e.size),e.y>l.height+e.size&&(e.y=-e.size),d.globalAlpha=e.opacity,g&&g.complete?d.drawImage(g,e.x-e.size/2,e.y-e.size/2,e.size,e.size):(d.fillStyle=t,d.beginPath(),d.arc(e.x,e.y,e.size,0,2*Math.PI),d.fill());d.globalAlpha=1,requestAnimationFrame(x)};x()}}customElements.define("menutech-particles",MenutechParticles);class MenutechModel3D extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
      <link rel="stylesheet" href="https://unpkg.com/@egjs/view3d@latest/css/view3d-bundle.min.css">
      <div id="view3d"><canvas class="view3d-canvas"></canvas><div class="v3d-loader"><div class="v3d-loader-progress"></div></div></div>
      <style>:host{display:block;width:100%;height:100%;position:relative}#view3d{width:100%;height:100%;position:relative;overflow:hidden;background:#000}.v3d-loader{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4)}.v3d-loader-progress{width:0%;height:4px;background:#09f;transition:width 0.2s}</style>
    `}connectedCallback(){this.initView3D()}async initView3D(){"undefined"==typeof View3D&&await this.loadScript("https://unpkg.com/@egjs/view3d@latest/dist/view3d.pkgd.min.js");let e=this.shadowRoot.querySelector("#view3d"),t=this.getAttribute("src")||"https://vikingantonio.github.io/bddCards/assets/pos/pos.gltf",i=this.getAttribute("poster")||"./pos.png",r=new View3D(e,{src:t,poster:i,autoInit:!0}),o=this.shadowRoot.querySelector(".v3d-loader-progress"),s=this.shadowRoot.querySelector(".v3d-loader");r.on("loadStart",()=>o.style.width="0%"),r.on("progress",e=>o.style.width=100*e.loaded+"%"),r.on("load",()=>s.style.display="none"),r.on("ready",()=>{r.scene.scale.set(3,3,3),s.style.display="none"})}loadScript(e){return new Promise((t,i)=>{let r=document.createElement("script");r.src=e,r.onload=t,r.onerror=i,document.head.appendChild(r)})}}customElements.define("menutech-model3d",MenutechModel3D);class MenutechForm extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});let e=this.getAttribute("bg-color")||"#fff",t=this.getAttribute("label-color")||"#000",i=this.getAttribute("input-color")||"#000",r=this.getAttribute("placeholder-color")||"#000",o=this.getAttribute("max-width")||"800px",s=this.getAttribute("button-color")||"#f7d6d6",a=this.getAttribute("button-text-color")||"#000";this.shadowRoot.innerHTML=`
      <style>:host{display:block;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-sizing:border-box;padding:20px}form{background:${e};max-width:${o};margin:0 auto;padding:28px 36px;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,0.12);display:flex;flex-direction:column;gap:16px}label{color:${t};font-weight:bold;margin-bottom:4px}input,textarea{font-family:inherit;padding:10px 12px;border-radius:8px;border:1px solid rgba(0,0,0,0.12);color:${i};background:#fff;outline:none}input::placeholder,textarea::placeholder{color:${r}}button{align-self:flex-start;padding:10px 16px;border-radius:8px;border:none;background:${s};color:${a};cursor:pointer;font-weight:bold;transition:transform 0.2s ease}button:hover{transform:translateY(-2px)}#popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);background:#fff9e8;padding:28px 36px;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,0.18);text-align:center;font-size:1.1rem;color:#333;z-index:9999;opacity:0;transition:transform 0.4s ease,opacity 0.4s ease}#popup.show{transform:translate(-50%,-50%) scale(1);opacity:1}.spinner{margin:12px auto;width:36px;height:36px;border:4px dashed #444;border-top:4px solid #f7d6d6;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
      <form id="contactForm"><label for="nombre">Nombre</label><input type="text" name="nombre" placeholder="Tu nombre" required><label for="email">Correo</label><input type="email" name="email" placeholder="Tu correo" required><label for="mensaje">Mensaje</label><textarea name="mensaje" placeholder="Escribe tu mensaje" required></textarea><button type="submit">Enviar</button></form>
      <div id="popup"><div class="spinner"></div><div id="popupText">Enviando mensaje...</div></div>`;let n=this.shadowRoot.getElementById("contactForm"),l=this.shadowRoot.getElementById("popup"),d=this.shadowRoot.getElementById("popupText");n.addEventListener("submit",e=>{e.preventDefault(),d.textContent="Enviando mensaje...",l.classList.add("show");let t=new FormData(n);t.append("dominio",window.location.hostname),fetch("https://script.google.com/macros/s/AKfycbzkS-PWHOxgcpOPl_V179BTF8egKI8_yvJC6TaYVy2b1A1wbeHsaaVnHAqkJFU3rc9P9g/exec",{method:"POST",body:t}).then(e=>e.json()).then(e=>{"success"===e.result?(d.textContent=" Mensaje enviado con \xe9xito!",n.reset()):d.textContent=" Error al enviar. Intenta de nuevo.",setTimeout(()=>l.classList.remove("show"),2500)}).catch(e=>{console.error(e),d.textContent=" Error al conectar con el servidor.",setTimeout(()=>l.classList.remove("show"),2500)})})}}customElements.define("menutech-form",MenutechForm);class MenutechNeomorphism extends HTMLElement{static get observedAttributes(){return["color","radius","distance","blur","inset"]}constructor(){super(),this.attachShadow({mode:"open"}),this.wrapper=document.createElement("div"),this.wrapper.classList.add("neo"),this.wrapper.innerHTML="<slot></slot>";let e=document.createElement("style");e.textContent=`
      :host{display:inline-block;padding:1rem}.neo{background:var(--neo-color,#e0e0e0);border-radius:var(--neo-radius,20px);box-shadow:var(--neo-distance,9px) var(--neo-distance,9px) var(--neo-blur,16px) #bebebe,calc(var(--neo-distance,9px)*-1) calc(var(--neo-distance,9px)*-1) var(--neo-blur,16px) #ffffff;transition:all 0.25s ease}.neo.inset{box-shadow:inset var(--neo-distance,9px) var(--neo-distance,9px) var(--neo-blur,16px) #bebebe,inset calc(var(--neo-distance,9px)*-1) calc(var(--neo-distance,9px)*-1) var(--neo-blur,16px) #ffffff}
      `,this.shadowRoot.append(e,this.wrapper)}connectedCallback(){this.#a()}attributeChangedCallback(){this.#a()}#a(){let e=this.getAttribute("color")||"#e0e0e0",t=this.getAttribute("radius")||"20px",i=this.getAttribute("distance")||"9px",r=this.getAttribute("blur")||"16px",o=this.hasAttribute("inset");this.wrapper.style.setProperty("--neo-color",e),this.wrapper.style.setProperty("--neo-radius",t),this.wrapper.style.setProperty("--neo-distance",i),this.wrapper.style.setProperty("--neo-blur",r),o?this.wrapper.classList.add("inset"):this.wrapper.classList.remove("inset")}}customElements.define("menutech-neomorphism",MenutechNeomorphism);class MenuTechCarrusel extends HTMLElement{constructor(){super()}connectedCallback(){if(!this.querySelector(".menus")){let e=document.createElement("div");e.classList.add("menus"),e.innerHTML=`
        <div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>
      `,this.appendChild(e)}if(!this.querySelector("#popup")){let t=document.createElement("div");t.id="popup",t.classList.add("popup"),t.innerHTML=`
        <div class="popup-content"><span class="close">&times;</span><iframe id="popupFrame" src="" frameborder="0"></iframe>
        </div>
      `,this.appendChild(t)}if(!document.getElementById("menutech-carrusel-style")){let i=document.createElement("style");i.id="menutech-carrusel-style",i.textContent=`
       menutech-carrusel{display:flex;justify-content:center;align-items:center;width:100%;height:auto;box-sizing:border-box;padding:40px 0}.swiper-container{width:100%;max-width:1000px;overflow:hidden;display:flex;justify-content:center;align-items:center}.swiper-wrapper{display:flex;align-items:center}.swiper-slide{background-position:center;background-size:cover;display:flex;justify-content:center;align-items:center;transition:transform 0.5s ease}.menus img{width:100%;cursor:pointer;display:block;border-radius:10px}.popup{display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,0.7);justify-content:center;align-items:center;overflow:hidden}.popup-content{background:#fff;width:80%;max-width:800px;height:70%;border-radius:10px;overflow:hidden;position:relative;display:flex;justify-content:center;align-items:center;flex-direction:column}.popup-content iframe{width:100%;max-width:700px;height:100%;border:none;margin:auto;display:block}.close{position:absolute;top:8px;right:15px;font-size:30px;font-weight:bold;color:#333;cursor:pointer;z-index:10}
      `,document.head.appendChild(i)}let r=this.querySelector(".swiper-wrapper"),o=this.getAttribute("images"),s=this.getAttribute("slide-width")||"300px",a=this.getAttribute("slide-height")||"400px",n=o?o.split(",").map(e=>({src:e.trim()})):Array.from({length:6},(e,t)=>({src:`https://placehold.co/500x500?text=Imagen+${t+1}`}));r.innerHTML="",n.forEach(e=>{let t=document.createElement("div");t.classList.add("swiper-slide"),t.style.width=s,t.style.height=a,t.innerHTML=`<img src="${e.src}" data-url="${e.url||""}">`,r.appendChild(t)}),new Promise(e=>{if(window.Swiper)return e();let t=document.createElement("link");t.rel="stylesheet",t.href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",document.head.appendChild(t);let i=document.createElement("script");i.src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",i.onload=()=>e(),document.head.appendChild(i)}).then(()=>{let e=this.querySelector(".swiper-container"),t=e.querySelectorAll("img"),i=Promise.all(Array.from(t).map(e=>e.complete?Promise.resolve():new Promise(t=>e.onload=t)));i.then(()=>{new Swiper(e,{effect:"coverflow",grabCursor:!0,centeredSlides:!0,loop:!0,autoplay:{delay:2500,disableOnInteraction:!1},coverflowEffect:{rotate:40,stretch:0,depth:150,modifier:1.5,slideShadows:!0},pagination:{el:this.querySelector(".swiper-pagination"),clickable:!0},breakpoints:{0:{slidesPerView:1},600:{slidesPerView:2},900:{slidesPerView:3}}})})});let l=this.querySelector("#popup"),d=this.querySelector("#popupFrame"),c=this.querySelector(".close"),p=e=>{let t=e.getAttribute("data-url");t&&(d.src=t,l.style.display="flex")},h=()=>{this.querySelectorAll(".swiper-slide img").forEach(e=>{e.removeEventListener("click",e._popupClick),e._popupClick=()=>p(e),e.addEventListener("click",e._popupClick)})};h();let $=new MutationObserver(()=>h());$.observe(r,{childList:!0}),c.addEventListener("click",()=>{l.style.display="none",d.src=""}),l.addEventListener("click",e=>{e.target===l&&(l.style.display="none",d.src="")})}}customElements.define("menutech-carrusel",MenuTechCarrusel);class MenutechNavbar extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}static get observedAttributes(){return["color","opacity","text-color","hover-color","link1","link2","link3","link4","link5","text1","text2","text3","text4","text5","icon1","icon2","icon3","icon4","icon5"]}attributeChangedCallback(e,t,i){if(this.shadowRoot){if(e.startsWith("text")){let r=parseInt(e.replace("text",""))-1,o=this.shadowRoot.querySelectorAll("a span");o[r]&&(o[r].textContent=i||"")}if(e.startsWith("link")){let s=parseInt(e.replace("link",""))-1,a=this.shadowRoot.querySelectorAll("a");a[s]&&(a[s].href=i||"#")}if(e.startsWith("icon")){let n=parseInt(e.replace("icon",""))-1,l=this.shadowRoot.querySelectorAll("a i");l[n]&&(l[n].className=i||"ri-question-line")}if("color"===e||"opacity"===e){let d=this.getAttribute("color")||"#e0e0e0",c=this.getAttribute("opacity")||"0.7",p=this.shadowRoot.querySelector(".neo-navbar");p&&(p.style.background=`rgba(${this.hexToRgb(d)}, ${c})`)}if("text-color"===e){let h=this.getAttribute("text-color")||"#444";this.shadowRoot.querySelectorAll("a").forEach(e=>e.style.color=h)}if("hover-color"===e){let $=this.getAttribute("hover-color")||"#007aff";this.shadowRoot.querySelectorAll("a:hover, a:hover i").forEach(e=>e.style.color=$)}}}render(){let e=this.getAttribute("color")||"#e0e0e0",t=this.getAttribute("opacity")||"0.7",i=[this.getAttribute("link1")||"index.html",this.getAttribute("link2")||"index.html#services",this.getAttribute("link3")||"index.html#gallery",this.getAttribute("link4")||"index.html#contact",this.getAttribute("link5")||""],r=[this.getAttribute("icon1")||"ri-home-5-line",this.getAttribute("icon2")||"ri-tools-line",this.getAttribute("icon3")||"ri-image-2-line",this.getAttribute("icon4")||"ri-mail-line",this.getAttribute("icon5")||""],o=[this.getAttribute("text1")||"Home",this.getAttribute("text2")||"Services",this.getAttribute("text3")||"Gallery",this.getAttribute("text4")||"Contact",this.getAttribute("text5")||""];this.shadow.innerHTML=`
      <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet">
      <style>:host{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif}.neo-navbar{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);width:760px;padding:14px 30px;background:rgba(${this.hexToRgb(e)},${t});border-radius:35px;box-shadow:8px 8px 16px rgba(0,0,0,0.15),-8px -8px 16px rgba(255,255,255,0.9);display:flex;justify-content:space-around;align-items:center;backdrop-filter:blur(10px);transition:all 0.3s ease;z-index:1000}a{text-decoration:none;color:#444;font-size:.9rem;font-weight:500;padding:10px 18px;border-radius:18px;background:rgba(${this.hexToRgb(e)},0.4);box-shadow:inset 2px 2px 4px rgba(255,255,255,0.6),inset -2px -2px 4px rgba(190,190,190,0.5);display:flex;align-items:center;gap:8px;transition:all .25s ease}a i{font-size:1.3rem;opacity:.75;transition:all .25s ease}a:hover{color:#007aff;box-shadow:inset 3px 3px 6px rgba(190,190,190,0.65),inset -3px -3px 6px rgba(255,255,255,0.7);transform:translateY(-2px)}a:hover i{color:#007aff;opacity:1}@media(max-width:768px){.neo-navbar{width:90%;padding:10px 20px;border-radius:25px}a{padding:10px;border-radius:15px;font-size:0;background:rgba(${this.hexToRgb(e)},0.35)}a i{font-size:1.5rem;opacity:.85}a:hover{transform:translateY(-3px)}}</style>
      <nav class="neo-navbar">${i.map((e,t)=>o[t]?`<a href="${e.trim()}"><i class="${r[t]?r[t].trim():"ri-question-line"}"></i><span>${o[t].trim()}</span></a>`:"").join("")}</nav>
    `}hexToRgb(e){3===(e=e.replace(/^#/,"")).length&&(e=e.split("").map(e=>e+e).join(""));let t=parseInt(e,16);return`${t>>16&255},${t>>8&255},${255&t}`}}customElements.define("menutech-navbar",MenutechNavbar);

     class MenutechNavidad extends HTMLElement {
  static get observedAttributes() {
    return [
      "color","cantidad","tamano","velocidad","opacidad",
      "popup-activo","popup-image","popup-link",
      "fecha-inicio","fecha-fin","santa-tamano","santa-velocidad"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const color = this.getAttribute("color") || "#ffffff";
    const cantidad = parseInt(this.getAttribute("cantidad")) || 60;
    const tamano = parseFloat(this.getAttribute("tamano")) || 3;
    const velocidad = parseFloat(this.getAttribute("velocidad")) || 1;
    const opacidad = parseFloat(this.getAttribute("opacidad")) || 0.8;
    const popupImage = this.getAttribute("popup-image") || "";
    const popupLink = this.getAttribute("popup-link") || "";
    const fechaInicio = this.getAttribute("fecha-inicio") || "2025-12-25";
    const fechaFin = this.getAttribute("fecha-fin") || "2025-12-25";
    const santaTamano = parseFloat(this.getAttribute("santa-tamano")) || 450;
    const santaVelocidad = parseFloat(this.getAttribute("santa-velocidad")) || 3;

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const navidad = new Date(hoy.getFullYear(), 11, 25);

    const fechasPorDefecto =
      fechaInicio === "2025-12-25" && fechaFin === "2025-12-25";

    let activo = false;
    if (fechasPorDefecto) {
      activo = hoy.toDateString() === navidad.toDateString();
    } else {
      activo = hoy >= inicio && hoy <= fin;
    }

    if (!activo) {
      this.shadowRoot.innerHTML = "";
      return;
    }

    const popupActivo =
      this.getAttribute("popup-activo") === "true" ||
      this.getAttribute("popup-activo") === "on";

    // === Copos de nieve ===
    const snowImages = [
      "https://menutechdeveloper.github.io/libreria/snow1.png",
      "https://menutechdeveloper.github.io/libreria/snow2.png",
      "https://menutechdeveloper.github.io/libreria/snow3.png"
    ];

    let dots = "";
    for (let i = 0; i < cantidad; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = tamano + Math.random() * tamano;
      const dur = 4 + Math.random() * 3;
      const delay = Math.random() * 2;
      const img = snowImages[i % snowImages.length];

      dots += `
        <div class="flake" style="
          left:${x}%;
          top:${y}%;
          width:${size * 2}px;
          height:${size * 2}px;
          animation-duration:${dur / velocidad}s;
          animation-delay:${delay}s;
          opacity:${opacidad};
          background-image:url('${img}');
          background-size:contain;
          background-repeat:no-repeat;
          background-position:center;
        "></div>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position:fixed;
          top:0; left:0;
          width:100%; height:100%;
          pointer-events:none;
          z-index:9999;
          overflow:hidden;
        }
        .flake {
          position:absolute;
          animation:fall linear infinite;
          will-change: transform, opacity;
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity:0; }
        }

        /* POPUP */
        .popup-overlay {
          position:fixed;
          top:0; left:0;
          width:100%; height:100%;
          background:rgba(0,0,0,0.5);
          display:${popupActivo ? "flex" : "none"};
          justify-content:center;
          align-items:center;
          pointer-events:auto;
          z-index:10000;
        }
        .popup-content {
          position:relative;
          background:#fff;
          max-width:90%;
          max-height:80%;
          border-radius:12px;
          box-shadow:0 4px 20px rgba(0,0,0,0.3);
          padding:20px;
          text-align:center;
          display:flex;
          flex-direction:column;
          gap:12px;
          overflow:hidden;
        }
        .popup-content img {
          max-width:100%;
          max-height:60vh;
          border-radius:8px;
          object-fit:contain;
        }
        .popup-content button {
          background:#d32f2f;
          color:#fff;
          border:none;
          padding:10px 16px;
          border-radius:6px;
          cursor:pointer;
          font-size:1rem;
        }
        .popup-close {
          position:absolute;
          top:10px; right:10px;
          background:transparent;
          border:none;
          font-size:1.5rem;
          cursor:pointer;
          color:#333;
        }

        /* Santa Claus */
        #santa {
          position: fixed;
          width: ${santaTamano}px;
          top: 50%;
          left: -200px;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 10001;
        }
      </style>

      ${dots}

      <div class="popup-overlay">
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          ${popupImage ? `<img src="${popupImage}" alt="Promocin">` : ""}
          ${popupLink ? `<button onclick="window.open('${popupLink}','_blank')">Ver promocin</button>` : ""}
        </div>
      </div>

      <img id="santa" src="https://menutechdeveloper.github.io/libreria/santa.gif" alt="Santa volando">
    `;

    // ===== POPUP CLOSE =====
    const overlay = this.shadowRoot.querySelector(".popup-overlay");
    const closeBtn = this.shadowRoot.querySelector(".popup-close");
    if (overlay && closeBtn) {
      closeBtn.onclick = () => (overlay.style.display = "none");
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.style.display = "none";
      };
    }

    // ===== ANIMACI07N DE SANTA =====
    const santa = this.shadowRoot.querySelector("#santa");
    if (santa) {
      if (santa._animFrame) cancelAnimationFrame(santa._animFrame);

      let posX = -200;
      let posY = window.innerHeight / 2;
      let dirX = 1;
      let dirY = Math.random() < 0.5 ? 1 : -1;
      let vel = santaVelocidad;

      function moverSanta() {
        posX += dirX * vel;
        posY += dirY * 0.5;

        if (posY < 50 || posY > window.innerHeight - 150) dirY *= -1;
        if (posX > window.innerWidth) {
          dirX = -1;
          santa.style.transform = "translateY(-50%) scaleX(-1)";
        }
        if (posX < -200) {
          dirX = 1;
          santa.style.transform = "translateY(-50%) scaleX(1)";
        }

        santa.style.left = `${posX}px`;
        santa.style.top = `${posY}px`;

        santa._animFrame = requestAnimationFrame(moverSanta);
      }

      moverSanta();
    }
  }
}

customElements.define("menutech-navidad", MenutechNavidad);







/******************************
 * MENUTECH HALLOWEEN
 ******************************/
class MenutechHalloween extends HTMLElement {
  static get observedAttributes() {
    return [
      "color-hw","cantidad-hw","tamano-hw","velocidad-hw","opacidad-hw",
      "popup-activo-hw","popup-image-hw","popup-link-hw","popup-color-hw",
      "fecha-inicio-hw","fecha-fin-hw", "tamano-pumpkin-hw","tamano-bat-hw",
      "velocidad-bat-hw"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const color = this.getAttribute("color-hw") || "#ff6600";
    const cantidad = parseInt(this.getAttribute("cantidad-hw")) || 60;
    const tamano = parseFloat(this.getAttribute("tamano-hw")) || 3;
    const velocidad = parseFloat(this.getAttribute("velocidad-hw")) || 1;
    const opacidad = parseFloat(this.getAttribute("opacidad-hw")) || 0.8;
    const popupImage = this.getAttribute("popup-image-hw") || "";
    const popupLink = this.getAttribute("popup-link-hw") || "";
    const popupColor = this.getAttribute("popup-color-hw") || "#ff6600";
    const tamanoPumpkin = parseFloat(this.getAttribute("tamano-pumpkin-hw")) || 60;
    const tamanoBat = parseFloat(this.getAttribute("tamano-bat-hw")) || 50;
    const velocidadBat = parseFloat(this.getAttribute("velocidad-bat-hw")) || 1;

    const fechaInicio = this.getAttribute("fecha-inicio-hw") || "2025-10-31";
    const fechaFin = this.getAttribute("fecha-fin-hw") || "2025-10-31";

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const halloween = new Date(hoy.getFullYear(), 9, 31);
    const fechasPorDefecto = fechaInicio === "2025-10-31" && fechaFin === "2025-10-31";

    let activo = false;
    if (fechasPorDefecto) {
      activo = hoy.toDateString() === halloween.toDateString();
    } else {
      activo = hoy >= inicio && hoy <= fin;
    }

    if (!activo && !this.closest('.preview')) {
      this.shadowRoot.innerHTML = "";
      return;
    }
    const popupActivo =
    this.getAttribute("popup-activo-hw") === "true" ||
    this.getAttribute("popup-activo-hw") === "on";

    // === Partculas base (hw1, hw2, hw3) ===
    const particleImages = [
      "https://menutechdeveloper.github.io/libreria/hw1.png",
      "https://menutechdeveloper.github.io/libreria/hw2.png",
      "https://menutechdeveloper.github.io/libreria/hw3.png"
    ];
    let dots = "";
    for (let i = 0; i < cantidad; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = tamano + Math.random() * tamano;
      const dur = 4 + Math.random() * 3;
      const delay = Math.random() * 2;
      const img = particleImages[i % particleImages.length];
      dots += `<div class="flake" style="
        left:${x}%;
        top:${y}%;
        width:${size*2}px;
        height:${size*2}px;
        animation-duration:${dur/velocidad}s;
        animation-delay:${delay}s;
        opacity:${opacidad};
        background-image:url('${img}');
        background-size:contain;
        background-repeat:no-repeat;
        background-position:center;
      "></div>`;
    }

    // === Calabazas luminosas ===
    const pumpkinImg = "https://menutechdeveloper.github.io/libreria/calabaza.gif";
    const pumpkinCount = 8;
    let pumpkins = "";
    for (let i = 0; i < pumpkinCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const scale = 0.5 + Math.random() * 0.7;
      const duration = 3 + Math.random() * 5;
      const delay = Math.random() * 6;
      pumpkins += `<div class="pumpkin" style="
        left:${x}%;
        top:${y}%;
        width:${tamanoPumpkin}px;
        height:${tamanoPumpkin}px;
        transform:scale(${scale});
        animation-duration:${duration}s;
        animation-delay:${delay}s;
        background-image:url('${pumpkinImg}');
      "></div>`;
    }

    // === Murcilagos GIF volando horizontalmente ===
    const batGif = "https://menutechdeveloper.github.io/libreria/murcielago.gif";
  const batCount = 6;
  let bats = "";
  for (let i = 0; i < batCount; i++) {
  const y = Math.random() * 80;
  const duration = (15 + Math.random() * 5) / velocidadBat;
  const delay = Math.random() * 5;
  bats += `<div class="bat" style="
    top:${y}%;
    width:${tamanoBat}px;
    height:${tamanoBat}px;
    animation-duration:${duration}s;
    animation-delay:${delay}s;
    background-image:url('${batGif}');
  "></div>`;
}


    // === Render Shadow DOM ===
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position:fixed;
          top:0; left:0;
          width:100%; height:100%;
          pointer-events:none;
          z-index:9999;
          overflow:hidden;
        }
        .smoke-layer {
          position:absolute;
          inset:0;
          background:url("https://menutechdeveloper.github.io/libreria/smoke5.png") repeat;
          background-size:cover;
          opacity:0.25;
          filter:blur(4px);
          animation:moveSmoke 60s linear infinite;
        }
        @keyframes moveSmoke {
          0% { background-position:0 0; }
          100% { background-position:2000px 1000px; }
        }
        .flake {
          position: absolute;
          width: 20px; height: 20px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          animation: appearDisappear linear infinite;
          opacity: 0;
        }
        @keyframes appearDisappear {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .pumpkin {
          position:absolute;
          width:60px; height:60px;
          background-size:contain;
          background-repeat:no-repeat;
          background-position:center;
          opacity:0;
          animation:fadePumpkin ease-in-out infinite;
          filter:drop-shadow(0 0 8px #ff6600);
        }
        @keyframes fadePumpkin {
          0%,100% { opacity:0; transform:scale(0.5) rotate(0deg); }
          40%,60% { opacity:1; transform:scale(1) rotate(10deg); }
        }
        .bat {
          position:absolute;
          width:50px; height:50px;
          background-size:contain;
          background-repeat:no-repeat;
          background-position:center;
          animation:flyX linear infinite;
        }
        @keyframes flyX {
          0% { left:-60px; }
          100% { left:100vw; }
        }
        /* POPUP igual que MenutechNavidad */
        .popup-overlay {
          position:fixed;
          top:0; left:0;
          width:100%; height:100%;
          background:rgba(0,0,0,0.5);
          display:${popupActivo ? "flex" : "none"};
          justify-content:center;
          align-items:center;
          pointer-events:auto;
          z-index:10000;
        }
        .popup-content {
          position:relative;
          background:#fff;
          max-width:90%;
          max-height:80%;
          border-radius:12px;
          box-shadow:0 4px 20px rgba(0,0,0,0.3);
          padding:20px;
          text-align:center;
          display:flex;
          flex-direction:column;
          gap:12px;
          overflow:hidden;
        }
        .popup-content img {
          max-width:100%;
          max-height:60vh;
          border-radius:8px;
          object-fit:contain;
        }
        .popup-content button {
          background:${popupColor};
          color:#fff;
          border:none;
          padding:10px 16px;
          border-radius:6px;
          cursor:pointer;
        }
        .popup-close {
          position:absolute;
          top:10px; right:10px;
          background:transparent;
          border:none;
          font-size:1.5rem;
          color:#333;
          cursor:pointer;
        }
      </style>

      <div class="smoke-layer"></div>
      ${dots}
      ${pumpkins}
      ${bats}
      <div class="popup-overlay">
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          ${popupImage ? `<img src="${popupImage}" alt="Promocin">` : ""}
          ${popupLink ? `<button onclick="window.open('${popupLink}','_blank')">Ver promocin</button>` : ""}
        </div>
      </div>
    `;

    // Lgica popup
    const overlay = this.shadowRoot.querySelector(".popup-overlay");
    const closeBtn = this.shadowRoot.querySelector(".popup-close");
    if (overlay && closeBtn) {
      closeBtn.onclick = () => overlay.style.display = "none";
      overlay.onclick = (e) => { if(e.target === overlay) overlay.style.display = "none"; };
    }
  }
}

customElements.define("menutech-halloween", MenutechHalloween);


/******************************
 * MENUTECH MENU
 ******************************/
class MenutechMenu extends HTMLElement {
  static get observedAttributes() {
    return ["imagenes"];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ===== CSS original (mantiene el responsive correcto) =====
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        margin: 40px 0;
        position: relative;
      }

      .flipbook-viewport {
        overflow: hidden;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      }

      @media (max-width: 992px) {
        .flipbook-viewport {
          width: 90%;
          height: auto;
          display: block;
        }
      }

      .flipbook-viewport .container {
        padding: 20px;
        text-align: center;
        position: relative;
        margin: 0 auto;
      }

      .flipbook {
        width: 922px;
        height: 700px;
        margin: 0 auto;
        display: block;
      }

      @media (max-width: 992px) {
        .flipbook {
          width: 100%;
          height: 400px;
          margin-top: 10px;
        }
      }

      .flipbook .page {
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
      }

      .flipbook img {
        width: 100%;
        user-select: none;
        -webkit-user-select: none;
      }

      @media (min-width: 992px) {
        .flipbook-viewport {
          justify-content: center;
          align-items: center;
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    `;

    // ===== Estructura HTML =====
    const container = document.createElement("div");
    container.classList.add("flipbook-viewport");
    container.innerHTML = `
      <div class="container">
        <div class="flipbook"></div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }

  connectedCallback() {
    this.render();
    this.ensureTurnJS();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const flipbook = this.shadowRoot.querySelector(".flipbook");
    if (!flipbook) return;

    // Obtener imgenes del atributo o usar predeterminadas
    let urls = [];
    try {
      urls = JSON.parse(this.getAttribute("imagenes") || "[]");
    } catch {
      const raw = this.getAttribute("imagenes");
      if (raw) urls = raw.split(",").map(u => u.trim());
    }

    const imagesToUse = urls.length ? urls : [
      "https://vikingantonio.github.io/cabanamenu/assets/img/1.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/2.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/3.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/4.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/5.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/6.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/7.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/8.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/9.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/10.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/11.jpg",
      "https://vikingantonio.github.io/cabanamenu/assets/img/12.jpg"
    ];

    // Renderizar las imgenes
    flipbook.innerHTML = imagesToUse
      .map(src => `<img class="page" src="${src}" alt="page">`)
      .join("");

    // Reiniciar flipbook si Turn.js ya est cargado
    if (window.jQuery && jQuery.fn.turn) {
      jQuery(flipbook).turn("destroy").turn();
    }
  }

  ensureTurnJS() {
    const init = () => {
      if (window.jQuery && jQuery.fn.turn) {
        const flipbook = this.shadowRoot.querySelector(".flipbook");
        jQuery(flipbook).turn();
      } else if (!window.jQuery) {
        const jq = document.createElement("script");
        jq.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        jq.onload = init;
        document.head.appendChild(jq);
      } else {
        const turn = document.createElement("script");
        turn.src = "https://menutech.biz/m10/assets/js/turn.js";
        turn.onload = init;
        document.head.appendChild(turn);
      }
    };
    init();
  }
}

customElements.define("menutech-menu", MenutechMenu);



class MenuTechHero extends HTMLElement {
  static get observedAttributes() {
    return [
      "background",
      "overlay-color",
      "overlay-opacity",
      "title",
      "subtitle"
      // NOTE: ya no usamos attribute 'custom-code' para almacenar HTML bruto
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // observer para detectar cambios en nodos hijos (editor actualiza script/template)
    this._mo = new MutationObserver(() => this.render());
  }

  connectedCallback() {
    // observar cambios en hijos (a09adir/editar <template> o <script type="text/plain">)
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this.render();
  }

  disconnectedCallback() {
    this._mo.disconnect();
  }

  attributeChangedCallback() {
    this.render();
  }

  // lee el custom code considerando:
  // 1) <template class="custom-code"> ... </template>
  // 2) <script type="text/plain" class="custom-code"> ... </script>
  // 3) fallback: atributo data-custom-code (si lo tienes por compat)
  _readCustomCode() {
    // prefer template
    const tpl = this.querySelector('template.custom-code');
    if (tpl) return tpl.innerHTML.trim();

    const s = this.querySelector('script[type="text/plain"].custom-code');
    if (s) return s.textContent.trim();

    // atributo por compatibilidad (html-escaped), evita si puede
    const attr = this.getAttribute('custom-code');
    if (attr) return attr.trim();

    // default
    return `
      <span class="glf-button"
        data-glf-cuid="af65ce46-dd1a-4bc2-8461-df278b715ca2"
        data-glf-ruid="4a27439a-e98e-441e-a2db-477113814476">See MENU &amp; Order</span>

      <span class="glf-reservation"
        data-glf-cuid="c6f6fcc9-ebb9-4575-b513-3f3d9ea55da0"
        data-glf-ruid="1e45b55d-4e3a-4866-a22b-30601bde9f8a"
        data-glf-reservation="true">Table Reservation</span>

      <script src="https://www.fbgcdn.com/embedder/js/ewm2.js" defer async></script>
    `;
  }

  render() {
    const background = this.getAttribute("background") || "https://picsum.photos/1200/600";
    const overlayColor = this.getAttribute("overlay-color") || "rgba(0,0,0,0.9)";
    const overlayOpacity = parseFloat(this.getAttribute("overlay-opacity")) || 0.7;
    const title = this.getAttribute("title") || "Impulsa tu negocio al siguiente nivel";
    const subtitle = this.getAttribute("subtitle") || "Descubre cmo nuestra plataforma puede ayudarte a crecer, conectar con ms clientes y aumentar tus ventas.";

    const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(background);

    // el custom code se lee desde nodos hijos (template/script) o atributo como fallback
    const customCode = this._readCustomCode();

    // render HTML en shadow UTF
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; height:100%; }
        section.hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 300px;
          ${!isVideo ? `background: url('${background}') center/cover no-repeat;` : ""}
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          overflow: hidden;
          border-radius: 12px;
        }
        .hero-overlay { position:absolute; inset:0; background: ${overlayColor}; opacity: ${overlayOpacity}; z-index:0; }
        video.hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-1; }
        .hero-content { position:relative; z-index:1; max-width:800px; padding:20px; animation: fadeInUp 1s ease-out; }
        h1{ font-size:3rem; margin:0 0 1rem; font-weight:700; line-height:1.2; }
        p{ font-size:1.2rem; margin:0 0 2rem; opacity:0.9; }
        @keyframes fadeInUp{ from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:none;} }
        @media (max-width:768px){ section.hero{height:60vh;} h1{font-size:2.2rem;} p{font-size:1rem;} }
      </style>

      <section class="hero">
        ${isVideo ? `<video class="hero-bg" src="${background}" autoplay muted loop playsinline></video>` : ''}
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>${title}</h1>
          <p>${subtitle}</p>
          <div class="custom-slot"></div>
        </div>
      </section>
    `;

    // insertar custom code tal cual dentro del shadow (sin envolver ni estilizar)
    const slot = this.shadowRoot.querySelector('.custom-slot');
    if (slot) {
      slot.innerHTML = customCode;

      // reinyectar scripts para que se ejecuten (convertimos los script-tags de slot en scripts reales)
      slot.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        // copiar atributos (src, async, defer, etc)
        for (let i = 0; i < oldScript.attributes.length; i++) {
          const attr = oldScript.attributes[i];
          newScript.setAttribute(attr.name, attr.value);
        }
        // transferir contenido inline
        newScript.text = oldScript.textContent;
        // reemplazar en DOM (esto har que el script se ejecute)
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }
}

customElements.define('menutech-hero', MenuTechHero);







class MenutechThemes extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
#theme-dropdown {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: transform .14s ease;
}
#theme-dropdown:hover { transform: scale(1.08); }

#theme-panel {
  position: fixed;
  top: 70px;
  right: 16px;
  z-index: 9998;
  background: rgba(250,250,250,0.96);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: none;
  grid-template-columns: repeat(3, 60px);
  gap: 10px;
  width: max-content;
  backdrop-filter: blur(6px);
}
#theme-panel.active { display: grid; animation: pop .18s ease; }
@keyframes pop { from {opacity:0; transform:translateY(-8px) scale(.96);} to {opacity:1; transform:none;} }

.theme-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.theme-option:hover { transform: scale(1.1); box-shadow: 0 6px 18px rgba(0,0,0,0.15); }

#liquid-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  transition: opacity .6s ease;
  background: transparent;
}
#liquid-bg.hidden { opacity: 0; pointer-events: none; }

/* OVERLAY */
#overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.0);
  z-index: -1;
  pointer-events: none;
  transition: background .3s ease;
}

/* Overlay controls inside panel */
#overlay-controls {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(255,255,255,0.9);
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.0);
  backdrop-filter: blur(6px);
  margin-top: 6px;
}
#overlay-range {
  width: 100px;
}
#overlay-toggle {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  background: #e5e5e5;
  user-select: none;
  font-size: 12px;
  font-weight: 600;
}

body.white-mode { background: #fff; color: #222; transition: background .6s, color .6s; }
body.dark-mode { background: #0d0d0d; color: #fff; transition: background .6s, color .6s; }
body.pastel-mode { background: #ffb6c1; color: #4b2e2e; transition: background .6s, color .6s; }

.theme-option[data-theme="white"] { background: #ffffff; }
.theme-option[data-theme="dark"]  { background: #111111; }
.theme-option[data-theme="pastel"] { background: linear-gradient(135deg,#ffb6c1,#ffe6eb); }

.theme-option[data-theme="waves-blue"]  { background: linear-gradient(135deg,#6ec1e4,#b3e5fc); }
.theme-option[data-theme="waves-pink"]  { background: linear-gradient(135deg,#ff7eb3,#ff9a9e); }
.theme-option[data-theme="waves-green"] { background: linear-gradient(135deg,#9be15d,#00e3ae); }

.theme-option[data-theme^="fog-"] { background-size: cover; }
.theme-option[data-theme="fog-1"] { background: linear-gradient(135deg,#a18cd1,#fbc2eb); }
.theme-option[data-theme="fog-2"] { background: linear-gradient(135deg,#84fab0,#8fd3f4); }
.theme-option[data-theme="fog-3"] { background: linear-gradient(135deg,#ffd194,#f6d365); }
.theme-option[data-theme="fog-4"] { background: linear-gradient(135deg,#ff9a9e,#fecfef); }
.theme-option[data-theme="fog-5"] { background: linear-gradient(135deg,#c2e9fb,#a1c4fd); }
.theme-option[data-theme="fog-6"] { background: linear-gradient(135deg,#fbc2eb,#a6c1ee); }

.theme-option[data-theme="clouds-1"] { background: linear-gradient(135deg,#e0eafc,#cfdef3); }
.theme-option[data-theme="clouds-2"] { background: linear-gradient(135deg,#fbc2eb,#a6c1ee); }
.theme-option[data-theme="clouds-3"] { background: linear-gradient(135deg,#fddb92,#d1fdff); }

.theme-option[data-theme="liquid-1"] { background: linear-gradient(135deg,#89f7fe,#66a6ff); }
.theme-option[data-theme="liquid-2"] { background: linear-gradient(135deg,#c471f5,#fa71cd); }
.theme-option[data-theme="liquid-3"] { background: linear-gradient(135deg,#f6d365,#fda085); }

.theme-option[data-theme="birds-1"] { background: linear-gradient(135deg,#8EC5FC,#E0C3FC); }
.theme-option[data-theme="birds-2"] { background: linear-gradient(135deg,#F6D365,#FDA085); }
.theme-option[data-theme="birds-3"] { background: linear-gradient(135deg,#84FAB0,#8FD3F4); }

@media(max-width:600px){
  #theme-panel { grid-template-columns: repeat(3,48px); gap:8px; padding:10px; }
  .theme-option { width:48px; height:48px; }
}
    `;

    const container = document.createElement("div");
    container.innerHTML = `
<div id="theme-dropdown" title="Abrir selector">&#x1F3A8;</div>
<div id="theme-panel" aria-hidden="true">
  <div class="theme-option" data-theme="white" title="Blanco"></div>
  <div class="theme-option" data-theme="dark" title="Oscuro"></div>
  <div class="theme-option" data-theme="pastel" title="Pastel Rosa"></div>

  <div class="theme-option" data-theme="waves-blue"></div>
  <div class="theme-option" data-theme="waves-pink"></div>
  <div class="theme-option" data-theme="waves-green"></div>

  <div class="theme-option" data-theme="fog-1"></div>
  <div class="theme-option" data-theme="fog-2"></div>
  <div class="theme-option" data-theme="fog-3"></div>
  <div class="theme-option" data-theme="fog-4"></div>
  <div class="theme-option" data-theme="fog-5"></div>
  <div class="theme-option" data-theme="fog-6"></div>

  <div class="theme-option" data-theme="clouds-1"></div>
  <div class="theme-option" data-theme="clouds-2"></div>
  <div class="theme-option" data-theme="clouds-3"></div>

  <div class="theme-option" data-theme="liquid-1"></div>
  <div class="theme-option" data-theme="liquid-2"></div>
  <div class="theme-option" data-theme="liquid-3"></div>

  <div class="theme-option" data-theme="birds-1"></div>
  <div class="theme-option" data-theme="birds-2"></div>
  <div class="theme-option" data-theme="birds-3"></div>

  <div id="overlay-controls">
    <input type="range" id="overlay-range" min="0" max="100" value="0">
    <div id="overlay-toggle">Negro</div>
  </div>
</div>
<div id="liquid-bg" aria-hidden="true"></div>
<div id="overlay"></div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }

  connectedCallback() {
    this.initExternalMode();
  }

  initExternalMode() {
    const shadow = this.shadowRoot;
    const btn = shadow.querySelector("#theme-dropdown");
    const panel = shadow.querySelector("#theme-panel");
    const bg = shadow.querySelector("#liquid-bg");
    const overlay = shadow.querySelector("#overlay");
    const range = shadow.querySelector("#overlay-range");
    const toggle = shadow.querySelector("#overlay-toggle");
    let vantaEffect = null;
    let metaballsInstance = null;

    // Overlay controls logic
    let overlayColor = "black";
    function applyOverlay() {
      const val = (range && range.value ? range.value : 10) / 100;
      overlay.style.background = overlayColor === "black"
        ? `rgba(0,0,0,${val})`
        : `rgba(255,255,255,${val})`;
    }
    if (range) range.addEventListener("input", applyOverlay);
    if (toggle) toggle.addEventListener("click", () => {
      overlayColor = overlayColor === "black" ? "white" : "black";
      toggle.textContent = overlayColor === "black" ? "Negro" : "Blanco";
      applyOverlay();
    });
    applyOverlay();

    function loadScriptsSequential(urls, cb) {
      let i = 0;
      function next() {
        if (i >= urls.length) return cb && cb();
        const s = document.createElement("script");
        s.src = urls[i++];
        s.onload = next;
        s.onerror = next;
        document.head.appendChild(s);
      }
      next();
    }

    const libs = [
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js",
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js",
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js",
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
    ];

    loadScriptsSequential(libs, () => {
      function Metaballs(container, opts = {}) {
        const cfg = Object.assign({
          count: 8,
          colors: ['#66a6ff','#89f7fe','#3b82f6'],
          bg: '#00111f',
          blur: 36,
          speed: 0.6,
          radiusRange: [60, 160],
          mouseRepel: 0.15
        }, opts);

        let canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const balls = [];
        for (let i=0;i<cfg.count;i++){
          const r = rand(cfg.radiusRange[0], cfg.radiusRange[1]);
          balls.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            vx: (Math.random()-0.5)*cfg.speed*4,
            vy: (Math.random()-0.5)*cfg.speed*4,
            r,
            color: cfg.colors[i % cfg.colors.length]
          });
        }

        let raf = null;
        let mouse = {x: canvas.width/2, y: canvas.height/2, vx:0, vy:0, down:false};

        function resize(){
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
        window.addEventListener('resize', resize);

        function onMove(e){
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          mouse.x = x; mouse.y = y;
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, {passive:true});

        function step(){
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.fillStyle = cfg.bg;
          ctx.fillRect(0,0,canvas.width,canvas.height);

          for (let b of balls){
            b.x += b.vx;
            b.y += b.vy;

            if (b.x < -b.r) b.x = canvas.width + b.r;
            if (b.x > canvas.width + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = canvas.height + b.r;
            if (b.y > canvas.height + b.r) b.y = -b.r;

            const dx = mouse.x - b.x;
            const dy = mouse.y - b.y;
            const dist = Math.sqrt(dx*dx + dy*dy) + 0.001;
            const force = Math.max(-1, Math.min(1, (200 - dist) / 200));
            b.vx += -dx/dist * force * cfg.mouseRepel;
            b.vy += -dy/dist * force * cfg.mouseRepel;
            b.vx *= 0.995; b.vy *= 0.995;

            const g = ctx.createRadialGradient(b.x, b.y, b.r*0.1, b.x, b.y, b.r);
            g.addColorStop(0, hexToRgba(b.color, 0.95));
            g.addColorStop(0.4, hexToRgba(b.color, 0.6));
            g.addColorStop(1, hexToRgba(b.color, 0.0));
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
            ctx.fill();
          }
          raf = requestAnimationFrame(step);
        }

        function start(){ if(!raf) raf = requestAnimationFrame(step); }
        function stop(){
          if(raf){ cancelAnimationFrame(raf); raf = null; }
          window.removeEventListener('resize', resize);
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('touchmove', onMove);
          if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }

        function rand(a,b){ return a + Math.random()*(b-a); }
        function hexToRgba(hex, a){
          hex = hex.replace('#','');
          if(hex.length === 3) hex = hex.split('').map(h=>h+h).join('');
          const r = parseInt(hex.substring(0,2),16);
          const g = parseInt(hex.substring(2,4),16);
          const b = parseInt(hex.substring(4,6),16);
          return `rgba(${r},${g},${b},${a})`;
        }

        return { start, stop, setColors: c=>{ cfg.colors = c; balls.forEach((b,i)=>b.color = cfg.colors[i%cfg.colors.length]); } };
      }

      function destroyAll() {
        if (vantaEffect && typeof vantaEffect.destroy === 'function') {
          try { vantaEffect.destroy(); } catch(e) {}
          vantaEffect = null;
        }
        if (metaballsInstance && typeof metaballsInstance.stop === 'function') {
          try { metaballsInstance.stop(); } catch(e) {}
          metaballsInstance = null;
        }
      }

      function luminanceFromHex(hex) {
        hex = hex.replace('#','');
        if(hex.length === 3) hex = hex.split('').map(h=>h+h).join('');
        const r = parseInt(hex.substr(0,2),16)/255;
        const g = parseInt(hex.substr(2,2),16)/255;
        const b = parseInt(hex.substr(4,2),16)/255;
        return 0.299*r + 0.587*g + 0.114*b;
      }

      function luminanceForPreset(p) {
        if(p.type === 'mode') return luminanceFromHex(p.bg);
        if(p.type === 'clouds') return luminanceFromHex(p.background);
        if(p.type === 'waves') return luminanceFromHex(("#" + (p.color.toString(16).padStart(6,"0"))));
        if(p.type === 'fog') return 0.33 * (luminanceFromHex(p.h) + luminanceFromHex(p.m) + luminanceFromHex(p.l));
        if(p.type === 'metaballs') return luminanceFromHex(p.bg);
        if(p.type === 'birds') return luminanceFromHex(p.bg);
        return 1;
      }

      const presets = {
        white:  { type:"mode", className:"white-mode", bg:"#ffffff" },
        dark:   { type:"mode", className:"dark-mode", bg:"#0d0d0d" },
        pastel: { type:"mode", className:"pastel-mode", bg:"#ffb6c1" },

        "waves-blue":  { type:"waves", color:0x6ec1e4 },
        "waves-pink":  { type:"waves", color:0xff7eb3 },
        "waves-green": { type:"waves", color:0x00e3ae },

        "fog-1": { type:"fog", h:"#fbc2eb", m:"#a18cd1", l:"#6b5b95" },
        "fog-2": { type:"fog", h:"#84fab0", m:"#8fd3f4", l:"#5bc0eb" },
        "fog-3": { type:"fog", h:"#ffd194", m:"#f6d365", l:"#ffb347" },
        "fog-4": { type:"fog", h:"#ff9a9e", m:"#fecfef", l:"#ff6b6b" },
        "fog-5": { type:"fog", h:"#c2e9fb", m:"#a1c4fd", l:"#6ea8fe" },
        "fog-6": { type:"fog", h:"#fbc2eb", m:"#a6c1ee", l:"#6f86d6" },

        "clouds-1": { type:"clouds", background:"#cfdef3" },
        "clouds-2": { type:"clouds", background:"#fbc2eb" },
        "clouds-3": { type:"clouds", background:"#68b8d7" },

        "liquid-1": { type:"metaballs", colors:['#66a6ff','#89f7fe','#3b82f6'], bg:"#00111f" },
        "liquid-2": { type:"metaballs", colors:['#c471f5','#fa71cd','#7b2cbf'], bg:"#1a002b" },
        "liquid-3": { type:"metaballs", colors:['#f6d365','#fda085','#d97706'], bg:"#2b0f00" },

         "birds-1": { type:"birds", bg:"#9d366c", color1:0xbc85ff, color2:0xfac0ea },
        "birds-2": { type:"birds", bg:"#6e369d", color1:0xbc85ff, color2:0xfac0ea },
        "birds-3": { type:"birds", bg:"#36969d", color1:0xbc85ff, color2:0xfac0ea }

      };

      function applySectionStyles(preset){
        if(!preset.sections)return;
        const sections = ['navbar','hero','services','newsletter','about','gallery','footer'];
        sections.forEach(id=>{
          const el=document.getElementById(id);
          if(el && preset.sections[id]){
            el.style.background=preset.sections[id].bg;
            el.style.color=preset.sections[id].color;
          }
        });
      }

      function applyTheme(key) {
        const p = presets[key];
        if (!p) return;

        destroyAll();
        bg.classList.remove('hidden');
        localStorage.setItem('theme', key);

        if (p.type === 'mode') {
          bg.classList.add('hidden');
          document.body.classList.remove('white-mode','dark-mode','pastel-mode');
          document.body.classList.add(p.className);
          if (key === "dark") {
            document.body.style.color = "#fff";
          } else {
            document.body.style.color = luminanceForPreset(p) < 0.5 ? "#fff" : "#222";
          }
          applyOverlay();
          applySectionStyles(p);
          return;
        }

        const lum = luminanceForPreset(p);
        if (p.type === "fog" || p.type === "clouds") {
          document.body.style.color = "black";
        } else {
          document.body.style.color = lum < 0.5 ? "#fff" : "#222";
        }

        if (p.type === 'waves' && window.VANTA && VANTA.WAVES) {
          vantaEffect = VANTA.WAVES({
            el: bg,
            mouseControls: true,
            touchControls: true,
            color: p.color,
            shininess: 60,
            waveHeight: 25,
            waveSpeed: 0.7,
            zoom: 1.05
          });
        } else if (p.type === 'fog' && window.VANTA && VANTA.FOG) {
          vantaEffect = VANTA.FOG({
            el: bg,
            mouseControls: true,
            touchControls: true,
            highlightColor: p.h,
            midtoneColor: p.m,
            lowlightColor: p.l,
            baseColor: "#000000",
            blurFactor: 0.7,
            speed: 1.1,
            zoom: 1.1
          });
        } else if (p.type === 'clouds' && window.VANTA && VANTA.CLOUDS) {
          vantaEffect = VANTA.CLOUDS({
            el: bg,
            mouseControls: false,
            gyroControls:true,
            touchControls: true,
            backgroundColor: p.background,
            skyColor: p.background,
            speed: 1
          });
        } else if (p.type === 'metaballs') {
          metaballsInstance = Metaballs(bg, {
            count: 9,
            colors: p.colors,
            bg: p.bg,
            speed: 0.6,
            radiusRange: [80,160],
            mouseRepel: 0.18
          });
          metaballsInstance.start();
        } else if (p.type === 'birds' && window.VANTA && VANTA.BIRDS) {
          vantaEffect = VANTA.BIRDS({
            el: bg,
            mouseControls: true,
            touchControls: true,
            backgroundColor: p.bg,
            color1: p.color1,
            color2: p.color2,
            speedLimit: 5,
            separation: 20,
            wingSpan:30,
            birdSize:1,
            alignment: 20,
            cohesion: 20.0,
            quantity: 5
          });
        } else {
          bg.style.background = p.background || p.bg || "transparent";
        }

        applyOverlay();
        applySectionStyles(p);
      }

      btn.addEventListener('click', () => {
        panel.classList.toggle('active');
        panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
      });

      panel.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const key = opt.dataset.theme;
          applyTheme(key);
          panel.classList.remove('active');
          panel.setAttribute('aria-hidden', 'true');
        });
      });

      const saved = localStorage.getItem('theme') || 'white';
      setTimeout(()=>applyTheme(saved), 50);

      window.addEventListener('beforeunload', destroyAll);
    });
  }
}

customElements.define("menutech-themes", MenutechThemes);





/******************************
 * MENUTECH CHATBOT
 ******************************/

/*******************************
 * MENUTECH CHATBOT (Exact Original Design + Supabase + Clean FAQs)
 ******************************/
class MenutechChatbot extends HTMLElement {
  constructor() {
    super();
    this.supabaseUrl = 'https://ojpyfjgkffmzwvukjagf.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHlmamdrZmZtend2dWtqYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDIwMzYsImV4cCI6MjA3OTcxODAzNn0.dlVYmoMumBse_O1PLBx0FeNITqY4YktefD6l_uonSgo';
    this.historyKey = 'menutech_chat_history_v1';
    this.kb = [];
    this.history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');

    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
    this.bindElements();
    this.loadKB(true);

    this._voskBundleUrl = 'https://unpkg.com/vosk-browser@0.0.6/dist/bundle.esm.js';
    this._voskAudioProcessorUrl = 'https://unpkg.com/vosk-browser@0.0.6/dist/vosk-audio-processor.js';
    this._voskModelUrl = 'https://menutech.xyz/vosk/model/';

    this._vosk = null;
    this._model = null;
    this._recognizer = null;
    this._audioCtx = null;
    this._mediaStream = null;
    this._listening = false;
    this._sampleRate = 16000;
    this._voskReady = false;
  }

  render() {
    this.shadow.innerHTML = `
<style>
:host { all: initial; font-family: Inter, system-ui, Arial, sans-serif; }
.chat-toggle{
  position:fixed;
  right:20px;
  bottom:20px;
  width:56px;height:56px;border-radius:50%;
  background:#fff;color:#fff;border:none;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 18px rgba(10,10,10,.18);cursor:pointer;
  z-index:999999;font-size:22px;
}
.chat-window{
  position:fixed;right:20px;bottom:88px;width:360px;height:640px;max-height:90vh;
  background:#ffffff;border-radius:12px;box-shadow:0 16px 40px rgba(10,10,10,.2);
  display:flex;flex-direction:column;overflow:hidden;
  z-index:999998;border:1px solid rgba(0,0,0,.06);
}
.chat-header{
  padding:12px 14px;
  background: linear-gradient(90deg,#ff7a00,#ff9b3a);
  color:#fff;display:flex;align-items:center;justify-content:space-between;
}
.chat-body{padding:12px;overflow:auto;flex:1;background:linear-gradient(#fff,#fbfbfb)}
.msg{margin-bottom:10px;display:flex}
.msg.user{justify-content:flex-end}
.bubble{
  max-width:78%;padding:10px 12px;border-radius:12px;
  background:#f1f5ff;color:#111;
}
.msg.user .bubble{
  background:#ffd9b3;color:#000;
}
.chat-input{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  border-top:1px solid #eee;
  background:#fff;
  height:64px;
  box-sizing:border-box;
}
.chat-input input{
  flex:1;
  padding:12px 14px;
  border-radius:10px;
  border:1px solid #d5d5d5;
  font-size:15px;
  min-width:0;
}
.chat-input button.iconbtn{
  padding:8px;
  background:transparent;
  border:none;
  border-radius:8px;
  cursor:pointer;
  font-size:20px;
  color:#ff7a00;
  flex-shrink:0;
}
.chat-input button.send{
  padding:10px 16px;
  border-radius:10px;
  border:none;
  background:#ff7a00;
  color:#fff;
  cursor:pointer;
  font-size:15px;
  font-weight:600;
  flex-shrink:0;
}
@keyframes bubble-delete {
  0% { opacity:1; transform:scale(1); }
  100% { opacity:0; transform:scale(0.7); }
}
.bubble.deleting { animation: bubble-delete .35s ease forwards; }
.iconbtn img,
.iconbtn svg { width:22px;height:22px;display:block;pointer-events:none; }

/* Clean Minimal FAQ Buttons */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.faq-btn {
  background: #ffffff;
  border: 1px solid #ffd9b3;
  color: #333333;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  text-align: left;
  line-height: 1.35;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.faq-btn:hover {
  background: #fff4eb;
  border-color: #ff7a00;
  color: #ff7a00;
  transform: translateY(-1px);
}
</style>

<button id="openBtn" class="chat-toggle" title="Abrir chat">
  <img id="openIcon" src="https://menutechdeveloper.github.io/databasewindows/img/icon.png"
  style="width:32px;height:32px;border-radius:50%" alt="abrir chat" />
</button>

<div id="chat" class="chat-window" style="display:none" aria-hidden="true">
  <div class="chat-header">
    <div><strong>Asistente</strong><div style="font-size:12px;opacity:.9">Soporte automatico</div></div>
    <button id="closeBtn" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">
      <img src="https://menutechdeveloper.github.io/libreria/icons/close.svg" style="width:20px;height:20px;filter:invert(1)">
    </button>
  </div>

  <div id="body" class="chat-body"></div>

  <div class="chat-input">
    <button id="micBtn" class="iconbtn" title="Hablar"><img id="micIcon" src="https://menutechdeveloper.github.io/libreria/icons/mic.svg"></button>
    <button id="clearBtn" class="iconbtn" title="Limpiar historial"><img src="https://menutechdeveloper.github.io/libreria/icons/trash.svg"></button>
    <input id="messageInput" placeholder="Escribe tu pregunta..." />
    <button id="sendBtn" class="send">Enviar</button>
  </div>
</div>
`;
  }

  bindElements() {
    const s = this.shadow;
    this.openBtn = s.getElementById('openBtn');
    this.chat = s.getElementById('chat');
    this.closeBtn = s.getElementById('closeBtn');
    this.bodyEl = s.getElementById('body');
    this.input = s.getElementById('messageInput');
    this.sendBtn = s.getElementById('sendBtn');
    this.clearBtn = s.getElementById('clearBtn');
    this.micBtn = s.getElementById('micBtn');

    this.openBtn.addEventListener('click', () => {
      const isOpen = this.chat.style.display === 'flex';
      this.chat.style.display = isOpen ? 'none' : 'flex';
      this.chat.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
      if (!isOpen) {
        this.input.focus();
        this.loadKB(true);
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    });

    this.closeBtn.addEventListener('click', () => {
      this.chat.style.display = 'none';
      this.chat.setAttribute('aria-hidden', 'true');
      this.stopAutoSync();
    });

    window.addEventListener('focus', () => {
      if (this.chat && this.chat.style.display === 'flex') {
        this.loadKB(false);
      }
    });

    this.sendBtn.addEventListener('click', () => {
      this.userSend(this.input.value);
      this.input.value = '';
      this.input.focus();
    });

    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.input.value.trim() !== "") this.sendBtn.click();
      }
    });

    this.clearBtn.addEventListener('click', () => {
      const bubbles = this.shadow.querySelectorAll('.bubble, .faq-btn');
      if (bubbles.length === 0) {
        this.history = [];
        localStorage.setItem(this.historyKey, JSON.stringify([]));
        this.renderHistory(true);
        this.showClearedMessage();
        return;
      }
      bubbles.forEach((bub, i) => setTimeout(() => bub.classList.add('deleting'), i * 60));
      setTimeout(() => {
        this.history = [];
        localStorage.setItem(this.historyKey, JSON.stringify([]));
        this.renderHistory(true);
        this.showClearedMessage();
      }, bubbles.length * 60 + 350);
    });

    this.initVosk();
  }

  startAutoSync() {
    this.stopAutoSync();
    this._syncInterval = setInterval(() => {
      if (this.chat && this.chat.style.display === 'flex') {
        this.loadKB(false);
      }
    }, 15000);
  }

  stopAutoSync() {
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
      this._syncInterval = null;
    }
  }

  async initVosk() {
    try {
      const mod = await import(this._voskBundleUrl);
      this._vosk = mod;

      this._model = new this._vosk.Model(this._voskModelUrl);
      await (this._model.init?.() || Promise.resolve());

      this.micIcon = this.shadow.getElementById("micIcon");

      this.micBtn.addEventListener('click', async () => {
        if (this._listening) this.stopVosk();
        else await this.startVosk();
      });

      this._voskReady = true;
    } catch (err) {
      this.micBtn.style.opacity = 0.35;
      this.micBtn.title = 'Reconocimiento Vosk no disponible';
    }
  }

  async startVosk() {
    if (!this._voskReady) return;

    try {
      this.micIcon.src = "https://menutechdeveloper.github.io/libreria/icons/mic-listening.svg";
      this._mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this._sampleRate });

      const source = this._audioCtx.createMediaStreamSource(this._mediaStream);

      this._recognizer = new this._vosk.Recognizer({ model: this._model, sampleRate: this._sampleRate });
      await (this._recognizer.init?.() || Promise.resolve());

      const processor = this._audioCtx.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(this._audioCtx.destination);

      processor.onaudioprocess = e => {
        const data = e.inputBuffer.getChannelData(0);
        this._recognizer.acceptWaveform(data);
        const res = this._recognizer.finalResult?.() || {};
        if (res.text && res.text.trim()) {
          this.input.value = res.text;
          this.sendBtn.click();
          this.stopVosk();
        }
      };

      this._workletNode = processor;
      this._listening = true;
    } catch (err) {
      this.stopVosk();
    }
  }

  stopVosk() {
    try {
      if (this._mediaStream) this._mediaStream.getTracks().forEach(t => t.stop());
      if (this._workletNode) this._workletNode.disconnect();
      this._audioCtx?.close();
    } finally {
      this._audioCtx = null;
      this._workletNode = null;
      this._recognizer = null;
      this._mediaStream = null;
      this._listening = false;
      if (this.micIcon) this.micIcon.src = "https://menutechdeveloper.github.io/libreria/icons/mic.svg";
    }
  }

  showClearedMessage() {
    const msg = document.createElement('div');
    msg.style.textAlign = "center";
    msg.style.opacity = "0";
    msg.style.padding = "10px";
    msg.style.color = "#ff7a00";
    msg.style.fontWeight = "600";
    msg.style.transition = "opacity .4s ease";
    msg.textContent = "Historial borrado";
    this.bodyEl.appendChild(msg);
    requestAnimationFrame(() => msg.style.opacity = "1");
    setTimeout(() => { msg.style.opacity = "0"; setTimeout(() => msg.remove(), 300); }, 1800);
  }

  normalize(str){
    return (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  async loadKB(autoScroll = false) {
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/chatbot_kb?select=*&order=created_at.desc`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (!res.ok) throw new Error('Error al conectar con Supabase');

      const data = await res.json();

      this.kb = data.map(row => ({
        id: row.id,
        rawQ: row.q || '',
        q: this.normalize(row.q || ''),
        a: row.a || '',
        summary: this.generateSummary(row.q || '')
      }));

      this.renderHistory(autoScroll);
    } catch (err) {
      console.error('Error cargando KB de Supabase:', err);
      this.kb = [];
      this.renderHistory(autoScroll);
    }
  }

  generateSummary(q) {
    if (!q) return '';
    let clean = q.trim().replace(/^¿|^\?|\?$|^[^\w\s]+/g, '').trim();
    if (clean.length <= 45) return clean;
    return clean.substring(0, 42) + '...';
  }

  tokenize(text) { return (text || '').toLowerCase().replace(/[^\w\s09070107030905]/g, ' ').split(/\s+/).filter(Boolean); }
  buildTf(tokens) { const tf = {}; tokens.forEach(t => tf[t] = (tf[t] || 0) + 1); return tf; }
  dot(a, b) { let s = 0; for (const k in a) if (b[k]) s += a[k] * b[k]; return s; }
  norm(a) { let s = 0; for (const k in a) s += a[k] * a[k]; return Math.sqrt(s); }
  cosineSim(aTokens, bTokens) { const A = this.buildTf(aTokens), B = this.buildTf(bTokens); const d = this.dot(A, B); const n = this.norm(A) * this.norm(B); return n === 0 ? 0 : d / n; }

  findBestAnswer(query) {
    const qTokens = this.tokenize(query);
    let best = { score: 0, index: -1 };
    this.kb.forEach((item, i) => {
      const s = this.cosineSim(qTokens, this.tokenize(item.q + ' ' + item.a));
      if (s > best.score) { best.score = s; best.index = i; }
    });
    return best;
  }

  selectFAQ(item) {
    this.history.push({ role: 'user', text: item.rawQ });
    this.history.push({ role: 'bot', text: item.a });
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    this.renderHistory(true);
  }

  userSend(text) {
    if (!text || !text.trim()) return;
    this.history.push({ role: 'user', text });
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    this.renderHistory(true);
    const best = this.findBestAnswer(text);
    const THRESHOLD = 0.18;
    if (best.score >= THRESHOLD) {
      const kbEntry = this.kb[best.index];
      this.botReply(kbEntry.a);
    } else {
      this.botReply("Lo siento, no tengo una respuesta segura para eso.");
    }
  }

  botReply(text) {
    this.history.push({ role: 'bot', text });
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    this.renderHistory(true);
  }

  renderFAQButtons() {
    if (!this.kb || this.kb.length === 0) return;

    const faqList = document.createElement('div');
    faqList.className = 'faq-list';

    this.kb.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'faq-btn';
      btn.textContent = item.summary || item.rawQ;
      btn.addEventListener('click', () => this.selectFAQ(item));
      faqList.appendChild(btn);
    });

    this.bodyEl.appendChild(faqList);
  }

  renderHistory(autoScroll = false) {
    const previousScrollTop = this.bodyEl ? this.bodyEl.scrollTop : 0;

    this.bodyEl.innerHTML = '';

    // Render stored chat bubbles
    this.history.forEach(m => {
      const div = document.createElement('div');
      div.className = 'msg ' + (m.role === 'user' ? 'user' : 'bot');
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = this.escapeHtml(m.text).replace(/\n/g, '<br>');
      div.appendChild(bubble);
      this.bodyEl.appendChild(div);
    });

    // Render clean FAQ buttons list
    this.renderFAQButtons();

    if (autoScroll) {
      this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    } else {
      this.bodyEl.scrollTop = previousScrollTop;
    }
  }

  escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  static get observedAttributes() { return ['kb-url', 'icon']; }
  attributeChangedCallback(name, oldV, newV) {
    if (name === 'kb-url' && newV) this.kbUrl = newV;
    if (name === 'icon' && newV) {
      const img = this.shadow.getElementById('openIcon');
      if (img) img.src = newV;
    }
  }
}

customElements.define('menutech-chatbot', MenutechChatbot);










/******************************
 * MENUTECH DRAWER
 ******************************/
class MenutechDrawer extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ===== CSS =====
    const style = document.createElement("style");
    style.textContent = `
      .nav-container {
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 140px;
        height: 350px;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
      }

      .nav {
        position: relative;
        width: 110px;
        height: 300px;
        padding: 30px;
      }

      .icon {
        position: absolute;
        width: 54px;
        height: 54px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition:
          transform 0.5s cubic-bezier(0.25, 1.4, 0.4, 1),
          top 0.6s cubic-bezier(0.25, 1.4, 0.4, 1),
          left 0.6s cubic-bezier(0.25, 1.4, 0.4, 1),
          opacity 0.5s ease;
        opacity: 0;
        transform: scale(0.65);
      }

      .icon:hover {
        transform: scale(1.4) !important;
      }

      .nav.close .icon {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.65);
      }
      .nav.close .icon.last {
        opacity: 1 !important;
        pointer-events: auto !important;
        transform: scale(1) !important;
      }

      .icon {
        left: 10px;
        top: 140px;
      }

      .nav.open .icon:nth-child(1) { top: -20px; left: -10px;  opacity: 1; transform: scale(1); }
      .nav.open .icon:nth-child(2) { top: 50px;  left: 35px;   opacity: 1; transform: scale(1); }
      .nav.open .icon:nth-child(3) { top: 150px; left: 75px;   opacity: 1; transform: scale(1); }
      .nav.open .icon:nth-child(4) { top: 250px; left: 35px;   opacity: 1; transform: scale(1); }
      .nav.open .icon:nth-child(5) { top: 330px; left: -10px;  opacity: 1; transform: scale(1); }

      img {
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
    `;

    // ===== HTML CON RUTAS =====
    const wrapper = document.createElement("div");
    wrapper.classList.add("nav-container");
    wrapper.innerHTML = `
      <div class="nav close">
        <div class="icon" data-url="chatbotdata.html" title="Chatbot">
          <img src="https://menutechdeveloper.github.io/bddImg/assets/iconos/iaup.png">
        </div>

        <div class="icon" data-url="audioupload.html" title="Audios">
          <img src="https://menutechdeveloper.github.io/bddImg/assets/iconos/audioup.png">
        </div>

        <div class="icon last" data-url="users.html" title="Usuarios">
          <img src="https://menutechdeveloper.github.io/bddImg/assets/iconos/userup.png">
        </div>

        <div class="icon" data-url="configdirectorio.html" title="Directorio">
          <img src="https://menutechdeveloper.github.io/bddImg/assets/iconos/directoryup.png">
        </div>

        <div class="icon" data-url="adminManual.html" title="Manuales">
          <img src="https://menutechdeveloper.github.io/bddImg/assets/iconos/manuali.png">
        </div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }

  connectedCallback() {
    this.initializeBehavior();
  }

  initializeBehavior() {
    const nav = this.shadowRoot.querySelector(".nav");
    const icons = this.shadowRoot.querySelectorAll(".icon");
    let lastIcon = this.shadowRoot.querySelector(".icon.last");
    let closeTimeout = null;

    // sonidos
    const soundEnter = new Audio("https://menutechdeveloper.github.io/bddImg/assets/iconos/click.mp3");
    const soundMove = new Audio("https://menutechdeveloper.github.io/bddImg/assets/iconos/click.mp3");

    // mantener abierto mientras el mouse est cerca
    nav.addEventListener("mouseenter", () => {
      clearTimeout(closeTimeout);
      nav.classList.remove("close");
      nav.classList.add("open");
    });

    nav.addEventListener("mouseleave", () => {
      clearTimeout(closeTimeout);
      closeTimeout = setTimeout(() => {
        nav.classList.remove("open");
        nav.classList.add("close");
      }, 200);
    });

    // reubicar icono principal
    icons.forEach(icon => {
      icon.addEventListener("mouseenter", () => {
        soundEnter.currentTime = 0;
        soundMove.currentTime = 0;
        soundEnter.play();
        soundMove.play();

        lastIcon?.classList.remove("last");
        icon.classList.add("last");
        lastIcon = icon;
      });
    });

    // click para abrir rutas
    icons.forEach(icon => {
      icon.addEventListener("click", () => {
        const url = icon.dataset.url;
        if (url) {

          // abrir en la MISMA pesta09a:
          window.location.href = url;

          // si lo quieres en otra pesta09a usa:
          // window.open(url, "_blank");
        }
      });
    });
  }
}

customElements.define("menutech-drawer", MenutechDrawer);






// ==========================================================================================================================
// Menutech ICONOS    this.iconPath = "https://menutech.xyz/icons/";
// ==========================================================================================================================

class MenutechIconLoader {
    constructor() {
        this.iconPath = "https://menutech.xyz/icons/";
        this.processAll();
    }

    processAll() {
        const icons = document.querySelectorAll("i[class*='menutech-']");
        icons.forEach(icon => this.loadIcon(icon));
    }

    async loadIcon(el) {
        const classes = [...el.classList];
        const name = classes.find(c => c.startsWith("menutech-"))?.replace("menutech-", "");
        if (!name) return;

        try {
            let svgText = await fetch(`${this.iconPath}${name}.svg`).then(r => r.text());

            svgText = svgText
                .replace(/fill="[^"]*"/g, 'fill="currentColor"')
                .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
                .replace('<svg', '<svg fill="currentColor" style="width:100%;height:100%;display:block;pointer-events:none;"')


            el.innerHTML = svgText;
            el.style.display = "inline-block";

        } catch (e) {
            console.error("Icono Menutech no encontrado:", name);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => new MenutechIconLoader());


// ==========================================================================================================================
// Menutech TOOLS
// ==========================================================================================================================

    class MenutechTools extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ===== CSS =====
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --widget-size: 55px;
        --icon-size: 32px;
        --widget-margin: 20px;
        --animation-speed: 0.3s;
        --animation-function: ease-in-out;
        --background-color: #ffffff;
        --shadow-color: rgba(0, 0, 0, 0.2);
        --icon-spacing: calc(var(--widget-size) + 15px);
      }

      #floating-widget-container {
        position: fixed;
        top: 50%;
        right: var(--widget-margin);
        transform: translateY(-50%);
        width: var(--widget-size);
        height: var(--widget-size);
        z-index: 1000;
      }

      .widget-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--widget-size);
        height: var(--widget-size);
        background-color: var(--background-color);
        border-radius: 50%;
        box-shadow: 0 4px 12px var(--shadow-color);
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transform: translateY(-10px) scale(0.95); /* Animacin desde arriba */
        transition: opacity var(--animation-speed) var(--animation-function),
          transform var(--animation-speed) var(--animation-function),
          z-index 0s linear var(--animation-speed);
        will-change: transform, opacity;
        z-index: 1;
      }

      .widget-icon img {
        width: var(--icon-size);
        height: var(--icon-size);
        user-select: none; /* Evita que la imagen sea arrastrada */
      }

      #floating-widget-container .widget-icon:last-child {
        opacity: 1;
        transform: translateY(0) scale(1);
        z-index: 5;
      }

      #floating-widget-container.expanded .widget-icon {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition-delay: 0s;
        z-index: 10;
      }

      #floating-widget-container.expanded .widget-icon:nth-last-child(2) {
        transform: translateY(calc(1 * var(--icon-spacing)));
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(3) {
        transform: translateY(calc(2 * var(--icon-spacing)));
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(4) {
        transform: translateY(calc(3 * var(--icon-spacing)));
      }

      #floating-widget-container.expanded .widget-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      }
      #floating-widget-container.expanded
        .widget-icon:nth-last-child(2):hover {
        transform: translateY(calc(1 * var(--icon-spacing))) scale(1.1);
      }
      #floating-widget-container.expanded
        .widget-icon:nth-last-child(3):hover {
        transform: translateY(calc(2 * var(--icon-spacing))) scale(1.1);
      }
      #floating-widget-container.expanded
        .widget-icon:nth-last-child(4):hover {
        transform: translateY(calc(3 * var(--icon-spacing))) scale(1.1);
      }
    `;
    shadow.appendChild(style);

    // ===== HTML =====
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="floating-widget-container">
        <a href="./sticker.html" class="widget-icon" data-icon="Stickers">
            <img src="https://vikingantonio.github.io/bddCards/assets/3dicon.png" alt="Stickers">
        </a>
        <a href="https://menutech.biz/QRmenutech" class="widget-icon" data-icon="QR Code">
            <img src="https://vikingantonio.github.io/bddCards/assets/qricon.png" alt="QR Code">
        </a>
        <a href="./videoeditor.html" class="widget-icon" data-icon="Video Editor">
            <img src="https://vikingantonio.github.io/bddCards/assets/videoicon.png" alt="Video Editor">
        </a>
        <a href="https://menutech.biz/compilador" class="widget-icon" data-icon="Compilador">
            <img src="https://vikingantonio.github.io/bddCards/assets/codeicon.png" alt="Compilador">
        </a>
      </div>
    `;
    shadow.appendChild(wrapper);
  }

  connectedCallback() {
    this.initializeBehavior();
  }

  initializeBehavior() {
    const widgetContainer = this.shadowRoot.querySelector('#floating-widget-container');
    const icons = Array.from(widgetContainer.querySelectorAll('.widget-icon'));
    const mainIcon = widgetContainer.querySelector('[data-icon="menutech"]');

    let collapseTimeout;
    let lastHoveredIcon = mainIcon;

    const swapIcons = (iconToBecomeLast) => {
        if (iconToBecomeLast && iconToBecomeLast !== icons[icons.length - 1]) {
            widgetContainer.appendChild(iconToBecomeLast);
            const a = icons.splice(icons.indexOf(iconToBecomeLast), 1);
            icons.push(a[0]);
        }
    };

    const expandWidget = () => {
        clearTimeout(collapseTimeout);
        widgetContainer.classList.add('expanded');
    };

    const collapseWidget = () => {
        widgetContainer.classList.remove('expanded');
        swapIcons(lastHoveredIcon);
    };

    widgetContainer.addEventListener('mouseenter', expandWidget);

    widgetContainer.addEventListener('mouseleave', () => {
        collapseTimeout = setTimeout(collapseWidget, 300);
    });

    icons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            clearTimeout(collapseTimeout);
            lastHoveredIcon = icon;
        });

        icon.addEventListener('click', () => {
            lastHoveredIcon = icon;
        });
    });
  }
}

customElements.define('menutech-tools', MenutechTools);

// ==========================================================================================================================
// Menutech NAVWEB
// ==========================================================================================================================
class MenutechNavweb extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ===== CSS =====
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --widget-size: 55px;
        --icon-size: 32px;
        --widget-margin: 20px;
        --animation-speed: 0.3s;
        --animation-function: ease-in-out;
        --background-color: #ffffff;
        --shadow-color: rgba(0, 0, 0, 0.2);
        --icon-spacing: calc(var(--widget-size) + 15px);
      }

      #floating-widget-container {
        position: fixed;
        bottom: var(--widget-margin);
        left: var(--widget-margin);
        width: var(--widget-size);
        height: var(--widget-size);
        z-index: 1000;
      }

      .widget-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--widget-size);
        height: var(--widget-size);
        background-color: var(--background-color);
        border-radius: 50%;
        box-shadow: 0 4px 12px var(--shadow-color);
        cursor: pointer;

        position: absolute;
        bottom: 0;
        left: 0;

        opacity: 0;
        transform: translateX(-10px) scale(0.95); /* Animacin desde la izquierda */
        transition:
            opacity var(--animation-speed) var(--animation-function),
            transform var(--animation-speed) var(--animation-function),
            z-index 0s linear var(--animation-speed); /* Delay z-index change */

        will-change: transform, opacity;
        z-index: 1;
      }

      .widget-icon img {
        width: var(--icon-size);
        height: var(--icon-size);
        user-select: none; /* Evita que la imagen sea arrastrada */
      }

      #floating-widget-container .widget-icon:last-child {
        opacity: 1;
        transform: translateX(0) scale(1);
        z-index: 5;
      }

      #floating-widget-container.expanded .widget-icon {
        opacity: 1;
        transform: translateX(0) scale(1);
        transition-delay: 0s;
        z-index: 10;
      }

      #floating-widget-container.expanded .widget-icon:nth-last-child(2) {
        transform: translateX(calc(1 * var(--icon-spacing)));
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(3) {
        transform: translateX(calc(2 * var(--icon-spacing)));
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(4) {
        transform: translateX(calc(3 * var(--icon-spacing)));
      }

      #floating-widget-container.expanded .widget-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(2):hover {
        transform: translateX(calc(1 * var(--icon-spacing))) scale(1.1);
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(3):hover {
        transform: translateX(calc(2 * var(--icon-spacing))) scale(1.1);
      }
      #floating-widget-container.expanded .widget-icon:nth-last-child(4):hover {
        transform: translateX(calc(3 * var(--icon-spacing))) scale(1.1);
      }
    `;
    shadow.appendChild(style);

    // ===== HTML =====
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="floating-widget-container">
        <a href="https://menutech.biz/c4f3/cafe" class="widget-icon" data-icon="cafe">
            <img src="https://menutechdeveloper.github.io/bddImg/assets/icafe.png" alt="Cafe">
        </a>
        <a href="https://tragalero.com/" class="widget-icon" data-icon="tragalero">
            <img src="https://menutechdeveloper.github.io/bddImg/assets/itragalero.png" alt="Tragalero">
        </a>
        <a href="https://wisbe.xyz/" class="widget-icon" data-icon="wisbe">
            <img src="https://menutechdeveloper.github.io/bddImg/assets/iwisbe.png" alt="Wisbe">
        </a>
        <a href="https://menutech.xyz/" class="widget-icon" data-icon="menutech">
            <img src="https://menutechdeveloper.github.io/libreria/icons/mago.svg" alt="Menutech">
        </a>
      </div>
    `;
    shadow.appendChild(wrapper);
  }

  connectedCallback() {
    this.initializeBehavior();
  }

  initializeBehavior() {
    const widgetContainer = this.shadowRoot.querySelector('#floating-widget-container');
    const icons = Array.from(widgetContainer.querySelectorAll('.widget-icon'));
    const mainIcon = widgetContainer.querySelector('[data-icon="menutech"]');

    let collapseTimeout;
    let lastHoveredIcon = mainIcon;

    const swapIcons = (iconToBecomeLast) => {
        if (iconToBecomeLast && iconToBecomeLast !== icons[icons.length - 1]) {
            widgetContainer.appendChild(iconToBecomeLast);
            const a = icons.splice(icons.indexOf(iconToBecomeLast), 1);
            icons.push(a[0]);
        }
    };

    const expandWidget = () => {
        clearTimeout(collapseTimeout);
        widgetContainer.classList.add('expanded');
    };

    const collapseWidget = () => {
        widgetContainer.classList.remove('expanded');
        swapIcons(lastHoveredIcon);
    };

    widgetContainer.addEventListener('mouseenter', expandWidget);

    widgetContainer.addEventListener('mouseleave', () => {
        collapseTimeout = setTimeout(collapseWidget, 300);
    });

    icons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            clearTimeout(collapseTimeout);
            lastHoveredIcon = icon;
        });

        icon.addEventListener('click', () => {
            lastHoveredIcon = icon;
        });
    });
  }
}

customElements.define('menutech-navweb', MenutechNavweb);

// ==========================================================================================================================
// Menutech CUSTOM BUTTONS
// ==========================================================================================================================
// Ensure styles are injected only once
let stylesInjected = false;

function injectMenuTechStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    menutech-orders, menutech-reservations {
      display: inline-block;
      font-family: 'Poppins', sans-serif;
    }
    .menutech-btn {
      display: inline-flex;
      flex-direction: row !important;
      flex-wrap: nowrap;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      overflow: hidden;
      border-radius: 10px;
      transition: all .36s cubic-bezier(.2,.9,.2,1);
      box-shadow: 0 6px 18px rgba(0,0,0,0.45);
      padding: 12px 16px;
      min-height: 44px;
    }
    .menutech-btn.menutech-outline {
      box-shadow: none;
      padding: 10px 14px;
      background: transparent;
      border-width: 2px;
      border-style: solid;
    }
    .menutech-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .32s ease;
    }
    .menutech-icon svg {
      width: 100%;
      height: 100%;
    }
    .menutech-icon, .btn-text {
      display: inline-block !important;
      vertical-align: middle !important;
    }
  `;
  document.head.appendChild(style);
}


class MenuTechButton extends HTMLElement {
  constructor() {
    super();
    injectMenuTechStyles();
  }

  connectedCallback() {
    this.cuid = this.getAttribute('cuid');
    this.ruid = this.getAttribute('ruid');
    this.color = this.getAttribute('color');
    this.background = this.getAttribute('background');
    this.textColor = this.getAttribute('textColor');
    this.borderColor = this.getAttribute('border-color');
    this.isReservation = this.hasAttribute('reservation') || this.isReservation === true;

    this.render();
    this.loadIcon();
  }

  render() {
    const text = this.isReservation ? 'Table Reservation' : 'See MENU & Order Now!';
    const reservationAttr = this.isReservation ? 'data-glf-reservation="true"' : '';
    const isOutline = this.borderColor;

    this.innerHTML = `
      <span class="glf-button menutech-btn ${isOutline ? 'menutech-outline' : ''}"
            data-glf-cuid="${this.cuid}"
            data-glf-ruid="${this.ruid}"
            ${reservationAttr}
            style="
              background: ${isOutline ? 'transparent' : (this.background || 'linear-gradient(135deg, #e63946, #ff6b6b)')};
              color: ${this.textColor || '#fff'};
              border-color: ${isOutline ? this.borderColor : 'none'};
            ">
        <span class="menutech-icon" style="color: ${this.color || '#fff'}"></span>
        <span class="btn-text">${text}</span>
      </span>
    `;
    if (this.textColor) {
      const btnText = this.querySelector('.btn-text');
      if (btnText) {
        btnText.style.color = this.textColor;
      }
    }
  }

  loadIcon() {
    const iconContainer = this.querySelector('.menutech-icon');
    if (!iconContainer) return;

    fetch("https://menutechdeveloper.github.io/libreria/icons/mago.svg")
      .then(r => r.text())
      .then(svg => {
        svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        svg = svg.replace(/<svg([^>]*)>/i, '<svg$1 width="22" height="22">');
        iconContainer.innerHTML = svg;
      });
  }
}

class MenuTechOrders extends MenuTechButton {
  constructor() {
    super();
  }
}

class MenuTechReservations extends MenuTechButton {
  constructor() {
    super();
    this.isReservation = true;
  }
}

customElements.define('menutech-orders', MenuTechOrders);
customElements.define('menutech-reservations', MenuTechReservations);