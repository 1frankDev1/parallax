import { supabase } from "./supabase.js";

let allServices = [];
let presets = { starter: [], premium: [], deluxe: [] };
let specialists = [];
let discountRange = { min: 1, max: 18 };
let currentActiveTier = 'starter';

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initEventListeners();
});

async function loadData() {
    try {
        // Load Services
        const { data: servicesData, error: servicesError } = await supabase
            .from('pricing_services')
            .select('*')
            .order('created_at', { ascending: true });

        if (servicesError) throw servicesError;
        allServices = servicesData;

        // Load Presets
        const { data: presetsData, error: presetsError } = await supabase
            .from('pricing_presets')
            .select('*');

        if (presetsError) throw presetsError;
        presetsData.forEach(p => {
            presets[p.tier] = p.service_ids;
        });

        // Load Settings
        const { data: settingsData, error: settingsError } = await supabase
            .from('pricing_settings')
            .select('*');

        if (settingsError) throw settingsError;
        settingsData.forEach(s => {
            if (s.key === 'specialists') specialists = s.value;
            if (s.key === 'discount_range') discountRange = s.value;
        });

        renderAll();
    } catch (err) {
        console.error("Error loading admin data:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error loading data',
            text: err.message,
            customClass: { popup: 'swal2-glass' }
        });
    }
}

function renderAll() {
    renderServicesTable();
    renderSpecialists();
    renderDiscountSettings();
    renderVisualServicesGrid();
}

function renderServicesTable() {
    const tbody = document.getElementById('services-table-body');
    tbody.innerHTML = allServices.map(s => `
        <tr>
            <td>
                <div style="font-weight: 700; color: #fff;">${s.name}</div>
                <div style="font-size: 0.7rem; color: #aaa;">ID: ${s.id}</div>
            </td>
            <td>$${s.setup.toLocaleString()}</td>
            <td>$${s.monthly.toLocaleString()}</td>
            <td>
                ${s.image ? `<img src="${s.image}" class="service-img-preview" onerror="this.src='https://via.placeholder.com/60'">` : 'No Image'}
            </td>
            <td>
                <button class="btn-custom btn-sm p-2 mr-1" onclick="window.editService('${s.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-custom btn-danger-custom btn-sm p-2" onclick="window.deleteService('${s.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderSpecialists() {
    const container = document.getElementById('specialists-container');
    container.innerHTML = specialists.map((s, index) => `
        <div class="tag-pill">
            ${s} <i class="fas fa-times" onclick="window.removeSpecialist(${index})"></i>
        </div>
    `).join('');
}

function renderDiscountSettings() {
    document.getElementById('min-discount').value = discountRange.min;
    document.getElementById('max-discount').value = discountRange.max;
}

function renderVisualServicesGrid() {
    const container = document.getElementById('visual-services-grid');
    const selectedForTier = presets[currentActiveTier] || [];

    container.innerHTML = allServices.map(s => `
        <div class="visual-service-item ${selectedForTier.includes(s.id) ? 'selected' : ''}"
             onclick="window.toggleServiceInTier('${s.id}')">
            ${s.image ? `<img src="${s.image}" onerror="this.style.display='none'">` : '<i class="fas fa-box" style="font-size: 1.5rem; color: #888;"></i>'}
            <span>${s.name}</span>
        </div>
    `).join('');
}

function initEventListeners() {
    // Specialist Logic
    document.getElementById('btn-add-specialist').onclick = () => {
        const input = document.getElementById('new-specialist');
        const val = input.value.trim();
        if (val && !specialists.includes(val)) {
            specialists.push(val);
            input.value = '';
            renderSpecialists();
        }
    };

    document.getElementById('btn-save-settings').onclick = async () => {
        const min = parseInt(document.getElementById('min-discount').value);
        const max = parseInt(document.getElementById('max-discount').value);

        try {
            await supabase.from('pricing_settings').upsert([
                { key: 'specialists', value: specialists },
                { key: 'discount_range', value: { min, max } }
            ]);
            Swal.fire({ icon: 'success', title: 'Settings Saved', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    // Preset Tabs Logic
    document.querySelectorAll('.preset-tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.preset-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentActiveTier = btn.dataset.tier;
            renderVisualServicesGrid();
        };
    });

    document.getElementById('btn-save-presets').onclick = async () => {
        try {
            const payload = {
                tier: currentActiveTier,
                service_ids: presets[currentActiveTier]
            };
            const { error } = await supabase.from('pricing_presets').upsert([payload]);
            if (error) throw error;
            Swal.fire({ icon: 'success', title: `Preset ${currentActiveTier.toUpperCase()} Updated`, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    // Services Catalog Logic
    document.getElementById('btn-new-service').onclick = () => {
        window.openServiceModal();
    };

    document.getElementById('btn-save-service-modal').onclick = saveService;
}

window.removeSpecialist = (index) => {
    specialists.splice(index, 1);
    renderSpecialists();
};

window.toggleServiceInTier = (serviceId) => {
    const index = presets[currentActiveTier].indexOf(serviceId);
    if (index > -1) {
        presets[currentActiveTier].splice(index, 1);
    } else {
        presets[currentActiveTier].push(serviceId);
    }
    renderVisualServicesGrid();
};

window.openServiceModal = (id = null) => {
    const modal = $('#serviceModal');
    const form = document.getElementById('service-form');
    form.reset();
    document.getElementById('service-id-internal').value = id || '';

    if (id) {
        const s = allServices.find(x => x.id === id);
        document.getElementById('modal-title').innerHTML = 'Edit Service';
        document.getElementById('service-id-input').value = s.id;
        document.getElementById('service-id-input').readOnly = true;
        document.getElementById('service-name-input').value = s.name;
        document.getElementById('service-setup-input').value = s.setup;
        document.getElementById('service-monthly-input').value = s.monthly;
        document.getElementById('service-image-input').value = s.image || '';
        document.getElementById('service-description-input').value = s.description || '';
        document.getElementById('service-link-input').value = s.link_url || '';
    } else {
        document.getElementById('modal-title').innerHTML = 'New Service';
        document.getElementById('service-id-input').readOnly = false;
    }

    modal.modal('show');
};

async function saveService() {
    const id = document.getElementById('service-id-input').value.trim();
    const name = document.getElementById('service-name-input').value.trim();
    const setup = parseFloat(document.getElementById('service-setup-input').value);
    const monthly = parseFloat(document.getElementById('service-monthly-input').value);
    const image = document.getElementById('service-image-input').value.trim();
    const description = document.getElementById('service-description-input').value.trim();
    const link_url = document.getElementById('service-link-input').value.trim();

    if (!id || !name) return Swal.fire('Error', 'ID and Name are required', 'error');

    const payload = { id, name, setup, monthly, image, description, link_url };

    try {
        const { error } = await supabase.from('pricing_services').upsert([payload]);
        if (error) throw error;

        $('#serviceModal').modal('hide');
        Swal.fire({ icon: 'success', title: 'Service Saved', showConfirmButton: false, timer: 1500 });
        loadData();
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}

window.editService = (id) => {
    window.openServiceModal(id);
};

window.deleteService = async (id) => {
    const result = await Swal.fire({
        title: 'Delete Service?',
        text: "This will remove it from all presets too.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        customClass: { popup: 'swal2-glass' }
    });

    if (result.isConfirmed) {
        try {
            const { error } = await supabase.from('pricing_services').delete().eq('id', id);
            if (error) throw error;
            loadData();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    }
};
