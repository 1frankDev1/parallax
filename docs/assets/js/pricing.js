import { MT_CONFIG } from "./config.js";
import { supabase } from "./supabase.js";

// Services Data
const SERVICES = [
    { id: 'online_orders', name: 'Online Orders', setup: 322.92, monthly: 96.12, description: 'Platform admin, website template, ordering button, mobile ordering, menu build, cash orders, etc.' },
    { id: 'local_listing', name: 'Local Listing', setup: 279.72, monthly: 85.32, description: 'Google My Business, Apple iMap, Food Booking, Tripadvisor, Facebook, Instagram, more listings.' },
    { id: 'social_media', name: 'Facebook / Instagram / Threads', setup: 214.92, monthly: 52.92, description: 'Social Media package 4 post per Month.' },
    { id: 'smm', name: 'Social Media Marketing', setup: 106.92, monthly: 33.48, description: 'Inviting Blast Through Email, SMS or both.' },
    { id: 'online_payment', name: 'Online Payment', setup: 106.92, monthly: 48.6, description: 'Online Payment Orders (unlimited).' },
    { id: 'promotions', name: 'Promotions and Offers', setup: 139.32, monthly: 63.72, description: '8 Integrated promotions and offers (unlimited).' },
    { id: 'fb_ads', name: 'Facebook Ads', setup: 0, monthly: 20, description: 'Ad management on Facebook and Instagram.' },
    { id: 'branded_app', name: 'Branded Mobile App', setup: 189.92, monthly: 49.62, description: 'Personalized ordering app for Android and IOS.' },
    { id: 'website_seo', name: 'Website / SEO / Google Ads', setup: 366.12, monthly: 85.32, description: 'Personalized website, hosting, SEO, Domain registry.' },
    { id: 'physical_marketing', name: 'Fisical Marketing Kit', setup: 399, monthly: 0, description: 'Table QR Codes, Sheet size Posters, Stickers, Flyers.' },
    { id: 'delivery_service', name: 'Delivery Service', setup: 214.92, monthly: 85.32, description: 'Delivery Service setup and management.' },
    { id: 'pos_integration', name: 'POS Platforms Integration', setup: 430.92, monthly: 74.52, description: 'Integration with many POS platforms.' },
    { id: 'delivery_shipday', name: 'Delivery Services (Shipday)', setup: 290.52, monthly: 132, description: 'Shipday Delivery With Doordash & Uber Drivers.' },
    { id: 'restaurant_pos', name: 'Individual Restaurant POS', setup: 2498, monthly: 106.92, description: 'Menutech POS Cloud base, Tablet, Printer, Credit card device.' }
];

const PRESETS = {
    starter: ['online_orders', 'local_listing'],
    premium: ['online_orders', 'local_listing', 'social_media', 'smm', 'online_payment', 'promotions', 'fb_ads', 'branded_app'],
    deluxe: SERVICES.map(s => s.id)
};

let selectedServices = new Set(PRESETS.starter);

document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    updateTotals();
    initEventListeners();
});

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    grid.innerHTML = SERVICES.map(service => `
        <div class="service-card ${selectedServices.has(service.id) ? 'active' : ''}" data-id="${service.id}">
            <div class="service-header">
                <h3 class="service-name">${service.name}</h3>
                <div class="service-toggle"></div>
            </div>
            <p class="service-pricing">
                <div class="price-item"><span>Setup:</span> <span class="price-value">$${service.setup.toFixed(2)}</span></div>
                <div class="price-item"><span>Monthly:</span> <span class="price-value">$${service.monthly.toFixed(2)}</span></div>
            </p>
            <p style="font-size: 0.75rem; color: #888; margin-top: 10px;">${service.description}</p>
        </div>
    `).join('');

    // Re-attach listeners
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (selectedServices.has(id)) {
                selectedServices.delete(id);
            } else {
                selectedServices.add(id);
            }
            card.classList.toggle('active');
            updateTotals();
        });
    });
}

function updateTotals() {
    let totalSetup = 0;
    let totalMonthly = 0;
    const summaryList = document.getElementById('selected-items-list');
    const hasSocial = selectedServices.has('social_media') || selectedServices.has('smm');

    summaryList.innerHTML = '';

    SERVICES.forEach(service => {
        if (selectedServices.has(service.id)) {
            let sPrice = service.setup;
            let mPrice = service.monthly;

            // Business Rule: Online Orders free if social packages selected
            if (service.id === 'online_orders' && hasSocial) {
                sPrice = 0;
                mPrice = 0;
            }

            totalSetup += sPrice;
            totalMonthly += mPrice;

            summaryList.innerHTML += `
                <div class="selected-item-mini">
                    <span>${service.name} ${ (service.id === 'online_orders' && hasSocial) ? '<b style="color:green">(WAIVED)</b>' : (sPrice === 0 && mPrice === 0 ? '<b style="color:green">(FREE)</b>' : '')}</span>
                    <span>$${mPrice.toFixed(2)}/mo</span>
                </div>
            `;
        }
    });

    document.getElementById('total-setup').innerText = `$${totalSetup.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('total-monthly').innerText = `$${totalMonthly.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    // Highlight presets if matching
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const presetId = btn.dataset.preset;
        const presetServices = PRESETS[presetId];
        const isMatch = presetServices.length === selectedServices.size && presetServices.every(id => selectedServices.has(id));
        btn.classList.toggle('active', isMatch);
    });
}

function initEventListeners() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = btn.dataset.preset;
            selectedServices = new Set(PRESETS[presetId]);
            renderServices();
            updateTotals();
        });
    });

    const saveBtn = document.getElementById('btn-save-package');
    if (saveBtn) {
        saveBtn.addEventListener('click', savePackage);
    }
}

async function savePackage() {
    const clientName = document.getElementById('client-name').value;
    if (!clientName) {
        alert('Por favor ingresa el nombre del cliente o restaurante');
        return;
    }

    const btn = document.getElementById('btn-save-package');
    const originalText = btn.innerText;
    btn.innerText = 'Guardando...';
    btn.disabled = true;

    try {
        const hasSocial = selectedServices.has('social_media') || selectedServices.has('smm');
        const packageData = {
            client_name: clientName,
            services: SERVICES.filter(s => selectedServices.has(s.id)).map(s => ({
                id: s.id,
                name: s.name,
                is_free: s.id === 'online_orders' && hasSocial
            })),
            total_setup: parseFloat(document.getElementById('total-setup').innerText.replace('$', '').replace(',', '')),
            total_monthly: parseFloat(document.getElementById('total-monthly').innerText.replace('$', '').replace(',', '')),
            created_at: new Date().toISOString()
        };

        // 1. Generate visual summary (text based for now, could be canvas)
        const summaryText = `Menutech Quote for ${clientName}\n\nServices:\n` +
            packageData.services.map(s => `- ${s.name} ${s.is_free ? '(FREE)' : ''}`).join('\n') +
            `\n\nTotal Setup: $${packageData.total_setup}\nTotal Monthly: $${packageData.total_monthly}`;

        // 2. Upload to Cloudinary (as a "text image" or just a blob)
        // For simplicity and "looking good", we will create a canvas and upload it
        const imageUrl = await uploadSummaryImage(clientName, packageData);

        // 3. Save to Supabase
        const { error } = await supabase
            .from('pricing_packages')
            .insert([{
                client_name: clientName,
                services: packageData.services,
                total_setup: packageData.total_setup,
                total_monthly: packageData.total_monthly,
                image_url: imageUrl
            }]);

        if (error) throw error;

        alert('Paquete guardado con éxito!');
        window.location.href = 'adminPackages.html';

    } catch (err) {
        console.error('Error saving package:', err);
        alert('Error al guardar el paquete: ' + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function uploadSummaryImage(clientName, data) {
    // Create a canvas to make it look "bonito"
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#ff9533';
    ctx.fillRect(0, 0, canvas.width, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Montserrat, Arial';
    ctx.fillText('MENUTECH QUOTE', 50, 60);

    ctx.fillStyle = '#444444';
    ctx.font = '20px Montserrat, Arial';
    ctx.fillText(`Client: ${clientName}`, 50, 140);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 50, 170);

    ctx.strokeStyle = '#eeeeee';
    ctx.beginPath();
    ctx.moveTo(50, 190);
    ctx.lineTo(550, 190);
    ctx.stroke();

    ctx.font = 'bold 22px Montserrat, Arial';
    ctx.fillText('Selected Services:', 50, 230);

    ctx.font = '16px Montserrat, Arial';
    let y = 260;
    data.services.forEach(s => {
        ctx.fillText(`• ${s.name}`, 60, y);
        if (s.is_free) {
            ctx.fillStyle = 'green';
            ctx.font = 'italic bold 14px Montserrat, Arial';
            ctx.fillText(' (FREE)', ctx.measureText(`• ${s.name}`).width + 70, y);
            ctx.fillStyle = '#444444';
            ctx.font = '16px Montserrat, Arial';
        }
        y += 25;
    });

    y += 20;
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(50, y, 500, 120);

    ctx.fillStyle = '#444444';
    ctx.font = 'bold 20px Montserrat, Arial';
    ctx.fillText('TOTALS', 70, y + 40);

    ctx.font = '18px Montserrat, Arial';
    ctx.fillText(`Setup Fee: $${data.total_setup.toFixed(2)}`, 70, y + 70);
    ctx.fillStyle = '#ff9533';
    ctx.font = 'bold 22px Montserrat, Arial';
    ctx.fillText(`Monthly Fee: $${data.total_monthly.toFixed(2)}`, 70, y + 100);

    // Convert to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'quote.png');
            formData.append('upload_preset', MT_CONFIG.CLOUDINARY.UPLOAD_PRESET);

            try {
                const resp = await fetch(`https://api.cloudinary.com/v1_1/${MT_CONFIG.CLOUDINARY.CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const result = await resp.json();
                resolve(result.secure_url);
            } catch (err) {
                reject(err);
            }
        }, 'image/png');
    });
}
