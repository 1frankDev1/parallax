import { MT_CONFIG } from "./config.js";
import { supabase } from "./supabase.js";

// Services Data
const SERVICES = [
    { id: 'online_orders', name: 'Online Orders', setup: 322.92, monthly: 96.12, image: 'https://menutech.xyz/assets/img/onlineOrders.jpg', description: 'Platform admin, website template, ordering button, mobile ordering, menu build, cash orders, etc.' },
    { id: 'local_listing', name: 'Local Listing', setup: 279.72, monthly: 85.32, image: 'https://menutech.xyz/assets/img/localListing.jpg', description: 'Google My Business, Apple iMap, Food Booking, Tripadvisor, Facebook, Instagram, more listings.' },
    { id: 'social_media', name: 'Facebook / Instagram / Threads', setup: 214.92, monthly: 52.92, image: 'https://menutech.xyz/assets/img/socialMedia.jpg', description: 'Social Media package 4 post per Month.' },
    { id: 'smm', name: 'Social Media Marketing', setup: 106.92, monthly: 33.48, image: 'https://menutech.xyz/assets/img/smm.jpg', description: 'Inviting Blast Through Email, SMS or both.' },
    { id: 'online_payment', name: 'Online Payment', setup: 106.92, monthly: 48.6, image: 'https://menutech.xyz/assets/img/onlinePayment.jpg', description: 'Online Payment Orders (unlimited).' },
    { id: 'promotions', name: 'Promotions and Offers', setup: 139.32, monthly: 63.72, image: 'https://menutech.xyz/assets/img/promotionsoffers.jpg', description: '8 Integrated promotions and offers (unlimited).' },
    { id: 'fb_ads', name: 'Facebook Ads', setup: 0, monthly: 20, image: 'https://menutech.xyz/assets/img/adfb.jpg', description: 'Ad management on Facebook and Instagram.' },
    { id: 'branded_app', name: 'Branded Mobile App', setup: 189.92, monthly: 49.62, image: 'https://menutech.xyz/assets/img/brandedapp.jpg', description: 'Personalized ordering app for Android and IOS.' },
    { id: 'website_seo', name: 'Website / SEO / Google Ads', setup: 366.12, monthly: 85.32, image: 'https://menutech.xyz/assets/img/wsg.jpg', description: 'Personalized website, hosting, SEO, Domain registry.' },
    { id: 'physical_marketing', name: 'Fisical Marketing Kit', setup: 399, monthly: 0, image: 'https://menutech.xyz/assets/img/fmk.jpg', description: 'Table QR Codes, Sheet size Posters, Stickers, Flyers.' },
    { id: 'delivery_service', name: 'Delivery Service', setup: 214.92, monthly: 85.32, image: 'https://menutech.xyz/assets/img/deliveryservices.jpg', description: 'Delivery Service setup and management.' },
    { id: 'pos_integration', name: 'POS Platforms Integration', setup: 430.92, monthly: 74.52, image: 'https://menutech.xyz/assets/img/POSpi.jpg', description: 'Integration with many POS platforms.' },
    { id: 'delivery_shipday', name: 'Delivery Services (Shipday)', setup: 290.52, monthly: 132, image: 'https://menutech.xyz/assets/img/deliveryservices.jpg', description: 'Shipday Delivery With Doordash & Uber Drivers.' },
    { id: 'restaurant_pos', name: 'Individual Restaurant POS', setup: 2498, monthly: 106.92, image: 'https://menutech.xyz/assets/img/posu.jpg', description: 'Menutech POS Cloud base, Tablet, Printer, Credit card device.' }
];

const PRESETS = {
    starter: ['online_orders', 'local_listing'],
    premium: ['online_orders', 'local_listing', 'social_media', 'smm', 'online_payment', 'promotions', 'fb_ads', 'branded_app'],
    deluxe: SERVICES.map(s => s.id)
};

let selectedServices = new Set(PRESETS.starter);
let currentBaseTier = 'Starter';

document.addEventListener('DOMContentLoaded', async () => {
    renderServices();
    updateTotals();
    initEventListeners();
    await checkEditMode();
});

async function checkEditMode() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (!editId) return;

    try {
        const { data, error } = await supabase
            .from('pricing_packages')
            .select('*')
            .eq('id', editId)
            .single();

        if (error) throw error;

        if (data) {
            // Populate name
            document.getElementById('client-name').value = data.client_name;

            // Populate services
            selectedServices = new Set(data.services.map(s => s.id));
            // Try to get tier from top-level or from embedded services data
            currentBaseTier = data.package_type || (data.services && data.services.length > 0 ? data.services[0].tier : 'Starter');

            renderServices();
            updateTotals();

            // Update save button text
            const saveBtn = document.getElementById('btn-save-package');
            if (saveBtn) saveBtn.innerText = 'UPDATE PACKAGE';

            // Store current ID for saving logic
            window.currentEditId = editId;
        }
    } catch (err) {
        console.error('Error loading package for edit:', err);
    }
}

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    grid.innerHTML = SERVICES.map(service => {
        const titleStyle = service.image ? 'style="color: #ff9533; text-decoration: underline; cursor: pointer;"' : '';
        const titleOnClick = service.image ? `onclick="event.stopPropagation(); viewServiceImage('${service.name}', '${service.image}')"` : '';

        return `
            <div class="service-card ${selectedServices.has(service.id) ? 'active' : ''}" data-id="${service.id}">
                <div class="service-header">
                    <h3 class="service-name" ${titleStyle} ${titleOnClick}>${service.name}</h3>
                    <div class="service-toggle"></div>
                </div>
                <div class="service-pricing">
                    <div class="price-item"><span>Setup:</span> <span class="price-value">$${service.setup.toFixed(2)}</span></div>
                    <div class="price-item"><span>Monthly:</span> <span class="price-value">$${service.monthly.toFixed(2)}</span></div>
                </div>
                <p style="font-size: 0.75rem; color: #888; margin-top: 10px;">${service.description}</p>
            </div>
        `;
    }).join('');

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

window.viewServiceImage = function(name, url) {
    Swal.fire({
        imageUrl: url,
        imageAlt: name,
        showConfirmButton: false,
        showCloseButton: true,
        width: '80%',
        padding: '0',
        background: 'transparent',
        backdrop: 'rgba(0,0,0,0.8)',
        customClass: {
            popup: 'image-popup-custom',
            image: 'large-image-swal'
        }
    });
};

function updateTotals() {
    let totalSetup = 0;
    let totalMonthly = 0;
    const summaryList = document.getElementById('selected-items-list');

    summaryList.innerHTML = '';

    SERVICES.forEach(service => {
        if (selectedServices.has(service.id)) {
            let sPrice = service.setup;
            let mPrice = service.monthly;

            totalSetup += sPrice;
            totalMonthly += mPrice;

            summaryList.innerHTML += `
                <div class="selected-item-mini">
                    <span>${service.name}</span>
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
            currentBaseTier = presetId.charAt(0).toUpperCase() + presetId.slice(1);
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
        Swal.fire({
            icon: 'info',
            title: 'Required Field',
            text: 'Please enter the client or restaurant name',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }

    const btn = document.getElementById('btn-save-package');
    const originalText = btn.innerText;
    btn.innerText = 'Guardando...';
    btn.disabled = true;

    try {
        const cleanSetup = document.getElementById('total-setup').innerText.replace(/[$,]/g, '');
        const cleanMonthly = document.getElementById('total-monthly').innerText.replace(/[$,]/g, '');

        const packageData = {
            client_name: clientName,
            // Omit top-level package_type to avoid schema cache error
            services: SERVICES.filter(s => selectedServices.has(s.id)).map(s => ({
                id: s.id,
                name: s.name,
                tier: currentBaseTier // Workaround: store tier inside services JSONB
            })),
            total_setup: parseFloat(cleanSetup),
            total_monthly: parseFloat(cleanMonthly)
        };

        // 1. Generate visual summary and upload to Cloudinary
        const imageUrl = await uploadSummaryImage(clientName, packageData);
        packageData.image_url = imageUrl;

        // 2. Save to Supabase (Upsert or Insert)
        let result;
        if (window.currentEditId) {
            result = await supabase
                .from('pricing_packages')
                .update(packageData)
                .eq('id', window.currentEditId);
        } else {
            result = await supabase
                .from('pricing_packages')
                .insert([packageData]);
        }

        if (result.error) throw result.error;

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: window.currentEditId ? 'Package updated successfully' : 'Package saved successfully',
            timer: 2000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = 'adminPackages.html';
        }, 2000);

    } catch (err) {
        console.error('Error saving package:', err);
        let errorMsg = err.message;

        if (errorMsg.includes("package_type") && errorMsg.includes("column")) {
            errorMsg = "Error de Base de Datos: La columna 'package_type' no existe. Por favor ejecuta el SQL proporcionado en el panel de Supabase y recarga el esquema.";
        }

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el paquete: ' + errorMsg
        });
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function uploadSummaryImage(clientName, data) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    // Load Logo with timeout to prevent hanging
    let logoLoaded = false;
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = 'https://menutech.services/assets/img/logomt.png';

    try {
        await Promise.race([
            new Promise((resolve, reject) => {
                logo.onload = () => { logoLoaded = true; resolve(); };
                logo.onerror = reject;
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Logo load timeout')), 5000))
        ]);
    } catch (e) {
        console.warn("Logo failed to load or timed out, continuing without it.", e);
    }

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Bar (Orange)
    ctx.fillStyle = '#ff9533';
    ctx.fillRect(0, 0, canvas.width, 80);

    // Draw Logo in header (Centered)
    if (logoLoaded) {
        const logoRatio = logo.width / logo.height;
        const logoH = 50;
        const logoW = logoH * logoRatio;
        const logoX = (canvas.width - logoW) / 2;
        ctx.drawImage(logo, logoX, 15, logoW, logoH);
    } else {
        // Fallback title if logo fails
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Montserrat, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MENUTECH', canvas.width / 2, 50);
        ctx.textAlign = 'left'; // Reset
    }

    // Header Content
    ctx.fillStyle = '#111111';
    ctx.font = '500 18px Montserrat, Arial';
    ctx.fillText(`Client: ${clientName}`, 40, 130);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 40, 160);

    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 190);
    ctx.lineTo(560, 190);
    ctx.stroke();

    // Services
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 22px Montserrat, Arial';
    ctx.fillText('Selected Services:', 40, 230);

    ctx.font = '500 16px Montserrat, Arial';
    ctx.fillStyle = '#666666';
    let y = 265;
    const maxServices = 14;
    data.services.slice(0, maxServices).forEach(s => {
        ctx.fillText(`• ${s.name}`, 55, y);
        y += 28;
    });

    // Totals Box (Light Gray)
    const boxY = 600;
    ctx.fillStyle = '#f7f7f7';
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(40, boxY, 520, 110, 10);
        ctx.fill();
    } else {
        ctx.fillRect(40, boxY, 520, 110);
    }

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Montserrat, Arial';
    ctx.fillText('TOTALS', 65, boxY + 35);

    ctx.font = '600 16px Montserrat, Arial';
    ctx.fillStyle = '#555555';
    ctx.fillText(`Setup Fee: $${data.total_setup.toLocaleString()}`, 65, boxY + 65);

    ctx.fillStyle = '#ff9533';
    ctx.font = 'bold 20px Montserrat, Arial';
    ctx.fillText(`Monthly Fee: $${data.total_monthly.toLocaleString()}`, 65, boxY + 95);

    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'quote.png');
            formData.append('upload_preset', MT_CONFIG.CLOUDINARY.UPLOAD_PRESET);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for upload

                const resp = await fetch(`https://api.cloudinary.com/v1_1/${MT_CONFIG.CLOUDINARY.CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!resp.ok) {
                    const errData = await resp.json();
                    throw new Error(errData.error?.message || 'Cloudinary upload failed');
                }

                const result = await resp.json();
                resolve(result.secure_url);
            } catch (err) {
                console.error("Cloudinary error:", err);
                reject(new Error("Error al subir imagen a la nube (Cloudinary). Verifica tu conexión o el preset. " + err.message));
            }
        }, 'image/png');
    });
}
