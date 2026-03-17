/**
 * Menutech Gallery Web Component
 * Usage: <menutech-gallery domain="yoursite.com"></menutech-gallery>
 */
class MenutechGallery extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.supabaseUrl = "https://eemqyrysdgasfjlitads.supabase.co";
        this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbXF5cnlzZGdhc2ZqbGl0YWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjA0NDUsImV4cCI6MjA3OTcxODAzNn0.UiyZLqhXSQ1Z_FoL006PDrDYKXbr_pxCOugYTulhdPY";
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
            this.shadowRoot.innerHTML = `<p style="color:#ef4444; font-weight:bold;">Error: 'domain' attribute not specified.</p>`;
            return;
        }

        const styles = `
            <style>
                :host { display: block; width: 100%; font-family: 'Inter', system-ui, sans-serif; }
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    grid-auto-rows: 240px;
                    gap: 16px;
                    padding: 0;
                }
                .gallery-item {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    background: #14161d;
                    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .gallery-item:hover { transform: translateY(-8px); }
                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s ease;
                }
                .gallery-item:hover img { transform: scale(1.1); }
                .gallery-item.large { grid-column: span 2; grid-row: span 2; }
                .gallery-item.wide { grid-column: span 2; }
                .gallery-item.tall { grid-row: span 2; }

                .loader { text-align: center; padding: 60px; color: #ff9533; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }

                @media (max-width: 640px) {
                    .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 300px; }
                    .gallery-item.wide, .gallery-item.large { grid-column: span 1; }
                    .gallery-item.tall, .gallery-item.large { grid-row: span 1; }
                }
            </style>
        `;

        this.shadowRoot.innerHTML = `${styles}<div class="loader">Loading Gallery...</div>`;

        const images = await this.fetchImages(domain);

        if (images.length === 0) {
            this.shadowRoot.innerHTML = `${styles}<div style="text-align:center; padding: 80px 20px; color: #64748b; font-weight: 500;">No images found in the gallery for this domain.</div>`;
            return;
        }

        const itemsHtml = images.map((img, i) => `
            <div class="gallery-item ${this.getPattern(i)}">
                <img src="${img.image_url}" loading="lazy">
            </div>
        `).join('');

        this.shadowRoot.innerHTML = `${styles}<div class="gallery-grid">${itemsHtml}</div>`;
    }
}

customElements.define('menutech-gallery', MenutechGallery);
