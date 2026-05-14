import { MT_CONFIG } from "./config.js";
import { supabase } from "./supabase.js";

// Dynamic Data from Supabase
let SERVICES = [];
let PRESETS = { starter: [], premium: [], deluxe: [] };
let SELECTED_SPECIALISTS = [];
let DISCOUNT_LIMITS = { min: 1, max: 18 };

let selectedServices = new Set();
let freeServices = new Set();
let isFreeMonthly = false;
let currentBaseTier = 'Starter';
let isReloadMode = false;
let reloadClickCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await initPricing();
});

async function initPricing() {
    try {
        // 1. Fetch Dynamic Configuration
        const { data: servicesData } = await supabase.from('pricing_services').select('*').order('created_at', { ascending: true });
        const { data: presetsData } = await supabase.from('pricing_presets').select('*');
        const { data: settingsData } = await supabase.from('pricing_settings').select('*');

        if (servicesData) SERVICES = servicesData;
        if (presetsData) {
            presetsData.forEach(p => { PRESETS[p.tier] = p.service_ids; });
        }
        if (settingsData) {
            settingsData.forEach(s => {
                if (s.key === 'specialists') SELECTED_SPECIALISTS = s.value;
                if (s.key === 'discount_range') DISCOUNT_LIMITS = s.value;
            });
        }

        // 2. Initial State
        selectedServices = new Set(PRESETS.starter);

        // 3. UI Setup
        renderSpecialistDropdown();
        renderServices();
        updateTotals();
        initEventListeners();

        // 4. Check Edit Mode
        await checkEditMode();
    } catch (err) {
        console.error("Error initializing pricing:", err);
    }
}

function renderSpecialistDropdown() {
    const select = document.getElementById('closer-select');
    if (!select) return;

    select.innerHTML = SELECTED_SPECIALISTS.map(s => `<option value="${s}">${s}</option>`).join('');
}

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

            // Populate new fields
            if (data.closer) document.getElementById('closer-select').value = data.closer;
            if (data.discount_setup) document.getElementById('discount-setup').value = data.discount_setup;
            if (data.discount_monthly) document.getElementById('discount-monthly').value = data.discount_monthly;

            // Populate services
            selectedServices = new Set(data.services.map(s => s.id));
            freeServices = new Set(data.services.filter(s => s.is_free).map(s => s.id));
            isFreeMonthly = data.services.some(s => s.is_free_monthly);

            const wheelchairToggle = document.getElementById('wheelchair-free-monthly');
            if (wheelchairToggle) wheelchairToggle.checked = isFreeMonthly;

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

window.toggleFree = function(event, id) {
    event.stopPropagation();
    if (freeServices.has(id)) {
        freeServices.delete(id);
    } else {
        freeServices.add(id);
        selectedServices.add(id); // Auto-select if marked free
    }
    renderServices();
    updateTotals();
};

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    grid.innerHTML = SERVICES.map(service => {
        const titleAction = service.image ? `onclick="event.stopPropagation(); viewServiceImage('${service.name}', '${service.image}')"` : '';
        const titleStyle = service.image ? 'style="color: #ff9533; text-decoration: underline; cursor: pointer;"' : '';
        const isSelected = selectedServices.has(service.id);
        const isFree = freeServices.has(service.id);

        const canBeFree = service.id === 'online_orders' || service.id === 'physical_marketing';
        const freeToggleHtml = canBeFree ? `
            <div class="free-indicator ${isFree ? 'is-free' : ''}"
                 onclick="window.toggleFree(event, '${service.id}')"
                 title="Mark as FREE">
            </div>
        ` : '';

        return `
            <div class="service-card ${isSelected ? 'active' : ''} ${isFree ? 'is-free-active' : ''}" data-id="${service.id}">
                <div class="stamp-free ${isFree ? 'animate' : ''}">FREE</div>
                <div class="service-header">
                    <div style="display: flex; align-items: center;">
                        <h3 class="service-name" ${titleStyle} ${titleAction}>${service.name}</h3>
                        ${freeToggleHtml}
                    </div>
                    <div class="service-toggle"></div>
                </div>
                <div class="service-pricing">
                    <div class="price-item"><span>Setup:</span> <span class="price-value">$${service.setup.toFixed(2)}</span></div>
                    <div class="price-item"><span>Monthly:</span> <span class="price-value">$${service.monthly.toFixed(2)}</span></div>
                </div>
                <p style="font-size: 0.75rem; color: #888; margin-top: 10px;">${service.description || ''}</p>
            </div>
        `;
    }).join('');

    // Re-attach listeners
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (selectedServices.has(id)) {
                selectedServices.delete(id);
                freeServices.delete(id); // Deselecting also removes FREE status
            } else {
                selectedServices.add(id);
            }
            renderServices(); // Re-render to update FREE indicators/stamps
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
            const isFree = freeServices.has(service.id);
            let sPrice = isFree ? 0 : service.setup;
            let mPrice = isFree ? 0 : service.monthly;

            totalSetup += sPrice;
            totalMonthly += mPrice;

            summaryList.innerHTML += `
                <div class="selected-item-mini">
                    <span>${service.name} ${isFree ? '<b style="color:#28a745">(FREE)</b>' : ''}</span>
                    <span>$${mPrice.toFixed(2)}/mo</span>
                </div>
            `;
        }
    });

    // Special Case: Online Orders Waiver logic
    // We check IDs based on the original logic if they still exist in the dynamic list
    const hasSocialMedia = Array.from(selectedServices).some(id => id === 'social_media' || id === 'smm');
    const hasOnlineOrders = selectedServices.has('online_orders');
    const isOnlineOrdersManuallyFree = freeServices.has('online_orders');

    if (hasSocialMedia && hasOnlineOrders && !isOnlineOrdersManuallyFree) {
        // Find online orders service and subtract its monthly price from totals
        const oo = SERVICES.find(s => s.id === 'online_orders');
        if (oo) {
            totalMonthly -= oo.monthly;
            // Also update the summary display if needed, but for now we follow the memory's rule
        }
    }

    // Apply discounts
    const discSetupPerc = parseFloat(document.getElementById('discount-setup')?.value || 0) / 100;
    const discMonthlyPerc = parseFloat(document.getElementById('discount-monthly')?.value || 0) / 100;

    const discountedSetup = totalSetup * (1 - discSetupPerc);
    let discountedMonthly = totalMonthly * (1 - discMonthlyPerc);

    document.getElementById('total-setup').innerText = `$${discountedSetup.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('total-monthly').innerText = `$${discountedMonthly.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    // Animations for stamps
    handleDiscountStamp('setup', discSetupPerc);
    handleDiscountStamp('monthly', discMonthlyPerc, isFreeMonthly);

    // Highlight presets if matching
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const presetId = btn.dataset.preset;
        const presetServices = PRESETS[presetId] || [];
        const isMatch = presetServices.length === selectedServices.size && presetServices.every(id => selectedServices.has(id));
        btn.classList.toggle('active', isMatch);
    });
}

function handleDiscountStamp(type, percentage, isFreeMonth = false) {
    const stamp = document.getElementById(`stamp-${type}`);
    if (!stamp) return;

    const hasDiscount = percentage > 0;
    const show = hasDiscount || isFreeMonth;

    if (show) {
        let text = "";
        if (type === 'monthly' && isFreeMonth) {
            text = "1 Free Month";
            if (hasDiscount) {
                text += ` / -${(percentage * 100).toFixed(0)}%`;
            }
        } else if (hasDiscount) {
            text = `-${(percentage * 100).toFixed(0)}%`;
        }

        if (text) {
            stamp.innerText = text;
            stamp.classList.remove('hidden');
            // Reset animation
            stamp.classList.remove('animate');
            void stamp.offsetWidth; // trigger reflow
            stamp.classList.add('animate');
        } else {
            stamp.classList.add('hidden');
            stamp.classList.remove('animate');
        }
    } else {
        stamp.classList.add('hidden');
        stamp.classList.remove('animate');
    }
}

function initEventListeners() {
    // Secret Reload Trigger
    const quoteTitle = document.querySelector('.quote-title');
    if (quoteTitle) {
        quoteTitle.addEventListener('click', () => {
            reloadClickCount++;
            if (reloadClickCount >= 5 && !isReloadMode) {
                activateReloadMode();
            }
            // Reset count if not reached in 2 seconds
            clearTimeout(window.reloadTimer);
            window.reloadTimer = setTimeout(() => { reloadClickCount = 0; }, 2000);
        });
    }

    // Wheelchair toggle
    const wheelchairToggle = document.getElementById('wheelchair-free-monthly');
    if (wheelchairToggle) {
        wheelchairToggle.addEventListener('change', (e) => {
            isFreeMonthly = e.target.checked;
            updateTotals();
        });
    }

    // Listen for discount changes
    ['discount-setup', 'discount-monthly'].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val === '') {
                updateTotals();
                return;
            }

            const num = parseInt(val);
            // Bypass limit if Reload Mode
            const min = isReloadMode ? 0 : DISCOUNT_LIMITS.min;
            const max = isReloadMode ? 100 : DISCOUNT_LIMITS.max;

            if (isNaN(num) || num < min || num > max) {
                // Trigger shake
                input.classList.add('shake');
                setTimeout(() => {
                    input.classList.remove('shake');
                    e.target.value = '';
                    updateTotals();
                }, 400);
            } else {
                updateTotals();
            }
        });
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = btn.dataset.preset;
            currentBaseTier = presetId.charAt(0).toUpperCase() + presetId.slice(1);
            selectedServices = new Set(PRESETS[presetId] || []);
            renderServices();
            updateTotals();
        });
    });

    const saveBtn = document.getElementById('btn-save-package');
    if (saveBtn) {
        saveBtn.addEventListener('click', savePackage);
    }
}

function activateReloadMode() {
    isReloadMode = true;
    const overlay = document.getElementById('shatter-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.innerHTML = '';
        // Create shards
        for (let i = 0; i < 30; i++) {
            const shard = document.createElement('div');
            shard.className = 'shard';
            shard.style.left = Math.random() * 100 + 'vw';
            shard.style.top = Math.random() * 100 + 'vh';
            shard.style.width = Math.random() * 50 + 20 + 'px';
            shard.style.height = Math.random() * 50 + 20 + 'px';
            shard.style.animationDelay = Math.random() * 0.5 + 's';
            overlay.appendChild(shard);
        }
    }

    setTimeout(() => {
        document.body.classList.add('reload-mode');
        if (overlay) overlay.classList.add('hidden');

        currentBaseTier = 'Reload';
        const quoteTitle = document.querySelector('.quote-title');
        // Stealth requirement: Do not explicitly say "Reload"
        if (quoteTitle) quoteTitle.innerText = 'SPECIAL SUMMARY';

        // Auto-select Reload services
        selectedServices = new Set(['online_orders', 'local_listing', 'social_media', 'smm', 'physical_marketing']);

        renderServices();
        updateTotals();

        Swal.fire({
            title: 'MODE ACTIVATED',
            text: 'Unrestricted pricing enabled.',
            icon: 'warning',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d32f2f'
        });
    }, 1000);
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
        // Calculate totals from scratch to ensure accuracy
        let baseSetup = 0;
        let baseMonthly = 0;
        SERVICES.forEach(s => {
            if (selectedServices.has(s.id)) {
                const isFree = freeServices.has(s.id);
                baseSetup += isFree ? 0 : s.setup;
                baseMonthly += isFree ? 0 : s.monthly;
            }
        });

        // Online Orders Waiver logic in save
        const hasSocialMedia = Array.from(selectedServices).some(id => id === 'social_media' || id === 'smm');
        const hasOnlineOrders = selectedServices.has('online_orders');
        const isOnlineOrdersManuallyFree = freeServices.has('online_orders');

        if (hasSocialMedia && hasOnlineOrders && !isOnlineOrdersManuallyFree) {
            const oo = SERVICES.find(s => s.id === 'online_orders');
            if (oo) baseMonthly -= oo.monthly;
        }

        const discountSetup = parseFloat(document.getElementById('discount-setup').value || 0);
        const discountMonthly = parseFloat(document.getElementById('discount-monthly').value || 0);

        const finalSetup = baseSetup * (1 - (discountSetup / 100));
        const finalMonthly = baseMonthly * (1 - (discountMonthly / 100));

        const packageData = {
            client_name: clientName,
            closer: document.getElementById('closer-select').value,
            discount_setup: discountSetup,
            discount_monthly: discountMonthly,
            package_type: isReloadMode ? 'Reload' : currentBaseTier,
            services: SERVICES.filter(s => selectedServices.has(s.id)).map(s => ({
                id: s.id,
                name: s.name,
                is_free: freeServices.has(s.id),
                is_free_monthly: isFreeMonthly,
                tier: isReloadMode ? 'Reload' : currentBaseTier
            })),
            total_setup: parseFloat(finalSetup.toFixed(2)),
            total_monthly: parseFloat(finalMonthly.toFixed(2))
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

    // Draw Logo in header (Centered)
    if (logoLoaded) {
        const logoRatio = logo.width / logo.height;
        const logoH = 50;
        const logoW = logoH * logoRatio;
        const logoX = (canvas.width - logoW) / 2;
        ctx.drawImage(logo, logoX, 15, logoW, logoH);
    } else {
        // Fallback: Just orange line if logo fails
        ctx.strokeStyle = '#ff9533';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 50, 40);
        ctx.lineTo(canvas.width / 2 + 50, 40);
        ctx.stroke();
    }

    // Header Content
    ctx.fillStyle = '#111111';
    ctx.font = '500 18px Montserrat, Arial';
    const packageTier = data.services && data.services.length > 0 ? data.services[0].tier : 'Starter';
    ctx.fillText(`Client: ${clientName}`, 40, 100);
    ctx.fillText(`Package: ${packageTier}`, 40, 125);
    ctx.fillText(`Specialist: ${data.closer || 'N/A'}`, 40, 150);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 40, 175);

    if (data.services.some(s => s.is_free_monthly)) {
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 16px Montserrat, Arial';
        ctx.fillText('1 Free Month', 40, 200);
    }

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
        let displayName = s.name;
        if (s.is_free) displayName += ' (FREE)';
        ctx.fillText(`• ${displayName}`, 55, y);
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
    let setupText = `Setup: $${data.total_setup.toLocaleString()}`;
    if (data.discount_setup > 0) setupText += ` (-${data.discount_setup}%)`;
    ctx.fillText(setupText, 65, boxY + 65);

    ctx.fillStyle = '#ff9533';
    ctx.font = 'bold 20px Montserrat, Arial';
    let monthlyText = `Monthly: $${data.total_monthly.toLocaleString()}`;
    const isFreeMonth = data.services.some(s => s.is_free_monthly);
    if (isFreeMonth) {
        monthlyText += ` (1 Free Month`;
        if (data.discount_monthly > 0) {
            monthlyText += ` / -${data.discount_monthly}%)`;
        } else {
            monthlyText += `)`;
        }
    } else if (data.discount_monthly > 0) {
        monthlyText += ` (-${data.discount_monthly}%)`;
    }
    ctx.fillText(monthlyText, 65, boxY + 95);

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
