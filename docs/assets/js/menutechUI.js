/**
 * Menutech Gallery Web Component
 * Uso: <menutech-gallery domain="tusitio.com"></menutech-gallery>
 */
class MenutechGallery extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.supabaseUrl = "https://eemqyrysdgasfjlitads.supabase.co";
        this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbXF5cnlzZGdhc2ZqbGl0YWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjA0NDUsImV4cCI6MjA3OTcxODAzNn0.UiyZLqhXSQ1Z_FoL006PDrDYKXbr_pxCOugYTulhdPY"; // Fixed Key
    }

    static get observedAttributes() {
        return ['domain'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'domain' && oldVal !== newVal) {
            this.render();
        }
    }

    async connectedCallback() {
        this.render();
    }

    async fetchImages(domain) {
        try {
            const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
            const supabase = createClient(this.supabaseUrl, this.supabaseKey);
            const { data, error } = await supabase
                .from('galeria')
                .select('image_url')
                .eq('domain', domain)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("MenutechGallery Error:", err);
            return [];
        }
    }

    getPattern(i) {
        const p = ['', 'wide', 'tall', '', 'large', '', 'wide', ''];
        return p[i % p.length];
    }

    async render() {
        const domain = this.getAttribute('domain');
        if (!domain) {
            this.shadowRoot.innerHTML = `<p style="color:red">Error: Atributo 'domain' no especificado.</p>`;
            return;
        }

        const styles = `
            <style>
                :host { display: block; width: 100%; font-family: 'Inter', sans-serif; }
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    grid-auto-rows: 200px;
                    gap: 12px;
                    padding: 10px;
                }
                .gallery-item {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #f0f0f0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }
                .gallery-item:hover { transform: scale(1.02); }
                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .gallery-item.large { grid-column: span 2; grid-row: span 2; }
                .gallery-item.wide { grid-column: span 2; }
                .gallery-item.tall { grid-row: span 2; }

                .loader { text-align: center; padding: 40px; color: #666; }
                @media (max-width: 480px) {
                    .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 250px; }
                    .gallery-item.wide, .gallery-item.large { grid-column: span 1; }
                    .gallery-item.tall, .gallery-item.large { grid-row: span 1; }
                }
            </style>
        `;

        this.shadowRoot.innerHTML = `${styles}<div class="loader">Cargando galería...</div>`;

        const images = await this.fetchImages(domain);

        if (images.length === 0) {
            this.shadowRoot.innerHTML = `${styles}<p style="text-align:center; padding: 40px; color: #999;">No hay imágenes en la galería.</p>`;
            return;
        }

        const itemsHtml = images.map((img, i) => `
            <div class="gallery-item ${this.getPattern(i).replace('wd', 'wide').replace('tl', 'tall').replace('lg', 'large')}">
                <img src="${img.image_url}" loading="lazy">
            </div>
        `).join('');

        this.shadowRoot.innerHTML = `${styles}<div class="gallery-grid">${itemsHtml}</div>`;
    }
}

customElements.define('menutech-gallery', MenutechGallery);
