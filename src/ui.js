let currentView = 'dashboard';
const viewContainer = document.getElementById('view-container');
const modalContainer = document.getElementById('modal-container');

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatCurrency(n) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(n) || 0);
}

function openModal(html) {
    modalContainer.innerHTML =
        `<div class="modal-overlay" id="modal-overlay">` +
            `<div class="modal-content">${html}</div>` +
        `</div>`;
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function closeModal() {
    modalContainer.innerHTML = '';
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const name = btn.dataset.name;

    switch (action) {
        case 'new-product': showProductForm(); break;
        case 'edit-product': showProductForm(id); break;
        case 'delete-product': deleteProduct(id); break;
        case 'new-category': showCategoryForm(); break;
        case 'edit-category': showCategoryForm(id); break;
        case 'delete-category': deleteCategory(id); break;
        case 'new-supplier': showSupplierForm(); break;
        case 'edit-supplier': showSupplierForm(id); break;
        case 'delete-supplier': deleteSupplier(id); break;
        case 'transaction': showTransactionForm(id, name); break;
    }
});

function showLoading() {
    viewContainer.innerHTML =
        '<div class="flex justify-center items-center h-64">' +
            '<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>' +
        '</div>';
}

function showError(msg) {
    return '<div class="bg-red-500/20 text-red-400 p-4 rounded-lg">' + esc(msg) + '</div>';
}

function buildTable(headers, rows, emptyMsg, colSpan) {
    const thead = '<thead class="bg-slate-700"><tr>' + headers.map(h => '<th class="table-header">' + h + '</th>').join('') + '</tr></thead>';
    const tbody = '<tbody class="divide-y divide-slate-700">' +
        (rows.length === 0
            ? '<tr><td colspan="' + colSpan + '" class="table-cell text-center text-slate-500 py-8">' + emptyMsg + '</td></tr>'
            : rows.join('')) +
        '</tbody>';
    return '<div class="bg-slate-800 rounded-xl overflow-hidden"><table class="w-full">' + thead + tbody + '</table></div>';
}

// ─── DASHBOARD ───────────────────────────────────────────────

function renderDashboard() {
    currentView = 'dashboard';
    showLoading();
    apiGetDashboardStats().then(({ data, error }) => {
        if (error || !data) { viewContainer.innerHTML = showError(error?.message || 'Error al cargar dashboard'); return; }
        viewContainer.innerHTML =
            '<h2 class="text-2xl font-bold mb-6">Dashboard</h2>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">' +
                card('Productos Registrados', data.totalProducts, 'text-white') +
                card('Stock Total (Unidades)', data.totalStock, 'text-white') +
                card('Valor del Inventario', formatCurrency(data.totalValue), 'text-indigo-400') +
                card('Stock Bajo', data.lowStock, 'text-red-400') +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">' +
                card('Entradas Totales', data.totalIn, 'text-green-400') +
                card('Salidas Totales', data.totalOut, 'text-yellow-400') +
            '</div>';
    }).catch(err => {
        viewContainer.innerHTML = showError(err.message);
    });
}

function card(label, value, color) {
    return '<div class="bg-slate-800 p-5 rounded-xl">' +
        '<p class="text-slate-400 text-sm">' + label + '</p>' +
        '<p class="text-3xl font-bold mt-1 ' + color + '">' + value + '</p>' +
    '</div>';
}

// ─── PRODUCTS ────────────────────────────────────────────────

function renderProducts() {
    currentView = 'products';
    showLoading();
    apiGetProducts().then(({ data, error }) => {
        if (error) { viewContainer.innerHTML = showError(error.message); return; }

        const rows = data.map(p =>
            '<tr class="hover:bg-slate-700/50">' +
                '<td class="table-cell font-mono text-xs">' + esc(p.sku) + '</td>' +
                '<td class="table-cell font-medium">' + esc(p.name) + '</td>' +
                '<td class="table-cell">' + (p.categories ? esc(p.categories.name) : '—') + '</td>' +
                '<td class="table-cell">' + (p.suppliers ? esc(p.suppliers.name) : '—') + '</td>' +
                '<td class="table-cell">' + formatCurrency(p.price) + '</td>' +
                '<td class="table-cell ' + (p.stock_quantity <= p.min_stock ? 'stock-low' : 'stock-ok') + '">' + p.stock_quantity + '</td>' +
                '<td class="table-cell">' + p.min_stock + '</td>' +
                '<td class="table-cell">' +
                    '<div class="flex gap-2">' +
                        '<button data-action="transaction" data-id="' + p.id + '" data-name="' + esc(p.name) + '" class="text-indigo-400 hover:text-indigo-300 text-sm" title="Registrar movimiento">🔄</button>' +
                        '<button data-action="edit-product" data-id="' + p.id + '" class="text-yellow-400 hover:text-yellow-300 text-sm" title="Editar">✏️</button>' +
                        '<button data-action="delete-product" data-id="' + p.id + '" class="text-red-400 hover:text-red-300 text-sm" title="Eliminar">🗑️</button>' +
                    '</div>' +
                '</td>' +
            '</tr>'
        );

        viewContainer.innerHTML =
            '<div class="flex justify-between items-center mb-6">' +
                '<h2 class="text-2xl font-bold">Productos</h2>' +
                '<button data-action="new-product" class="btn-primary">+ Nuevo Producto</button>' +
            '</div>' +
            buildTable(
                ['SKU', 'Nombre', 'Categoría', 'Proveedor', 'Precio', 'Stock', 'Min', 'Acciones'],
                rows, 'Sin productos registrados', 8
            );
    }).catch(err => { viewContainer.innerHTML = showError(err.message); });
}

function showProductForm(id) {
    if (id) {
        apiGetProduct(id).then(({ data: product, error }) => {
            if (error) { alert('Error: ' + error.message); return; }
            renderProductForm(product);
        }).catch(err => alert(err.message));
    } else {
        renderProductForm(null);
    }
}

function renderProductForm(product) {
    const isEdit = !!product;
    Promise.all([apiGetCategories(), apiGetSuppliers()]).then(([catsRes, supsRes]) => {
        const cats = catsRes.data || [];
        const sups = supsRes.data || [];

        openModal(
            '<h3 class="text-xl font-bold mb-4">' + (isEdit ? 'Editar' : 'Nuevo') + ' Producto</h3>' +
            '<form id="product-form" class="space-y-4">' +
                '<div class="grid grid-cols-2 gap-4">' +
                    inGroup('SKU', '<input type="text" name="sku" class="form-input" required value="' + (isEdit ? esc(product.sku) : '') + '">') +
                    inGroup('Nombre', '<input type="text" name="name" class="form-input" required value="' + (isEdit ? esc(product.name) : '') + '">') +
                '</div>' +
                inGroup('Descripción', '<textarea name="description" class="form-input" rows="2">' + (isEdit ? esc(product.description || '') : '') + '</textarea>') +
                '<div class="grid grid-cols-2 gap-4">' +
                    inGroup('Precio Venta', '<input type="number" step="0.01" name="price" class="form-input" required value="' + (isEdit ? product.price : '') + '">') +
                    inGroup('Costo', '<input type="number" step="0.01" name="cost" class="form-input" required value="' + (isEdit ? product.cost : '') + '">') +
                '</div>' +
                '<div class="grid grid-cols-2 gap-4">' +
                    inGroup('Stock Inicial', '<input type="number" name="stock_quantity" class="form-input" required value="' + (isEdit ? product.stock_quantity : '0') + '" ' + (isEdit ? 'readonly' : '') + '>' + (isEdit ? '<p class="text-xs text-slate-500 mt-1">Usa movimientos para ajustar stock</p>' : '')) +
                    inGroup('Stock Mínimo', '<input type="number" name="min_stock" class="form-input" required value="' + (isEdit ? product.min_stock : '5') + '">') +
                '</div>' +
                '<div class="grid grid-cols-2 gap-4">' +
                    inGroup('Categoría',
                        '<select name="category_id" class="form-input">' +
                            '<option value="">Sin categoría</option>' +
                            cats.map(c => '<option value="' + c.id + '"' + (isEdit && product.category_id === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') +
                        '</select>'
                    ) +
                    inGroup('Proveedor',
                        '<select name="supplier_id" class="form-input">' +
                            '<option value="">Sin proveedor</option>' +
                            sups.map(s => '<option value="' + s.id + '"' + (isEdit && product.supplier_id === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') +
                        '</select>'
                    ) +
                '</div>' +
                '<div class="flex justify-end gap-3 pt-4">' +
                    '<button type="button" onclick="closeModal()" class="btn-secondary">Cancelar</button>' +
                    '<button type="submit" class="btn-primary">' + (isEdit ? 'Actualizar' : 'Crear') + '</button>' +
                '</div>' +
            '</form>'
        );

        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.price = parseFloat(data.price) || 0;
            data.cost = parseFloat(data.cost) || 0;
            data.stock_quantity = parseInt(data.stock_quantity) || 0;
            data.min_stock = parseInt(data.min_stock) || 0;
            data.category_id = data.category_id || null;
            data.supplier_id = data.supplier_id || null;

            let res;
            if (isEdit) {
                const updates = { ...data };
                delete updates.stock_quantity;
                res = await apiUpdateProduct(product.id, updates);
            } else {
                res = await apiCreateProduct(data);
            }
            if (res.error) { alert('Error: ' + res.error.message); return; }
            closeModal();
            renderProducts();
        });
    }).catch(err => { alert('Error: ' + err.message); });
}

function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    apiDeleteProduct(id).then(({ error }) => {
        if (error) { alert('Error: ' + error.message); return; }
        renderProducts();
    });
}

// ─── CATEGORIES ──────────────────────────────────────────────

function renderCategories() {
    currentView = 'categories';
    showLoading();
    apiGetCategories().then(({ data, error }) => {
        if (error) { viewContainer.innerHTML = showError(error.message); return; }

        const cards = (data || []).map(c =>
            '<div class="bg-slate-800 p-5 rounded-xl flex justify-between items-start">' +
                '<div>' +
                    '<h3 class="font-semibold text-lg">' + esc(c.name) + '</h3>' +
                    (c.description ? '<p class="text-sm text-slate-400 mt-1">' + esc(c.description) + '</p>' : '') +
                '</div>' +
                '<div class="flex gap-2 shrink-0">' +
                    '<button data-action="edit-category" data-id="' + c.id + '" class="text-yellow-400 hover:text-yellow-300 text-sm">✏️</button>' +
                    '<button data-action="delete-category" data-id="' + c.id + '" class="text-red-400 hover:text-red-300 text-sm">🗑️</button>' +
                '</div>' +
            '</div>'
        );

        viewContainer.innerHTML =
            '<div class="flex justify-between items-center mb-6">' +
                '<h2 class="text-2xl font-bold">Categorías</h2>' +
                '<button data-action="new-category" class="btn-primary">+ Nueva Categoría</button>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' +
                (cards.length === 0 ? '<p class="text-slate-500 col-span-full">Sin categorías registradas</p>' : cards.join('')) +
            '</div>';
    }).catch(err => { viewContainer.innerHTML = showError(err.message); });
}

function showCategoryForm(id) {
    if (id) {
        apiGetCategories().then(({ data }) => {
            const cat = (data || []).find(c => c.id === id);
            if (!cat) return;
            renderCategoryForm(cat);
        });
    } else {
        renderCategoryForm(null);
    }
}

function renderCategoryForm(cat) {
    const isEdit = !!cat;
    openModal(
        '<h3 class="text-xl font-bold mb-4">' + (isEdit ? 'Editar' : 'Nueva') + ' Categoría</h3>' +
        '<form id="category-form" class="space-y-4">' +
            inGroup('Nombre', '<input type="text" name="name" class="form-input" required value="' + (isEdit ? esc(cat.name) : '') + '">') +
            inGroup('Descripción', '<textarea name="description" class="form-input" rows="3">' + (isEdit ? esc(cat.description || '') : '') + '</textarea>') +
            '<div class="flex justify-end gap-3 pt-4">' +
                '<button type="button" onclick="closeModal()" class="btn-secondary">Cancelar</button>' +
                '<button type="submit" class="btn-primary">' + (isEdit ? 'Actualizar' : 'Crear') + '</button>' +
            '</div>' +
        '</form>'
    );
    document.getElementById('category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        const res = isEdit ? await apiUpdateCategory(cat.id, data) : await apiCreateCategory(data);
        if (res.error) { alert('Error: ' + res.error.message); return; }
        closeModal();
        renderCategories();
    });
}

function deleteCategory(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    apiDeleteCategory(id).then(({ error }) => {
        if (error) { alert('Error: ' + error.message); return; }
        renderCategories();
    });
}

// ─── SUPPLIERS ───────────────────────────────────────────────

function renderSuppliers() {
    currentView = 'suppliers';
    showLoading();
    apiGetSuppliers().then(({ data, error }) => {
        if (error) { viewContainer.innerHTML = showError(error.message); return; }

        const cards = (data || []).map(s =>
            '<div class="bg-slate-800 p-5 rounded-xl">' +
                '<div class="flex justify-between items-start mb-3">' +
                    '<h3 class="font-semibold text-lg">' + esc(s.name) + '</h3>' +
                    '<div class="flex gap-2 shrink-0">' +
                        '<button data-action="edit-supplier" data-id="' + s.id + '" class="text-yellow-400 hover:text-yellow-300 text-sm">✏️</button>' +
                        '<button data-action="delete-supplier" data-id="' + s.id + '" class="text-red-400 hover:text-red-300 text-sm">🗑️</button>' +
                    '</div>' +
                '</div>' +
                (s.contact_name ? '<p class="text-sm text-slate-300">👤 ' + esc(s.contact_name) + '</p>' : '') +
                (s.email ? '<p class="text-sm text-slate-300">📧 ' + esc(s.email) + '</p>' : '') +
                (s.phone ? '<p class="text-sm text-slate-300">📞 ' + esc(s.phone) + '</p>' : '') +
            '</div>'
        );

        viewContainer.innerHTML =
            '<div class="flex justify-between items-center mb-6">' +
                '<h2 class="text-2xl font-bold">Proveedores</h2>' +
                '<button data-action="new-supplier" class="btn-primary">+ Nuevo Proveedor</button>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' +
                (cards.length === 0 ? '<p class="text-slate-500 col-span-full">Sin proveedores registrados</p>' : cards.join('')) +
            '</div>';
    }).catch(err => { viewContainer.innerHTML = showError(err.message); });
}

function showSupplierForm(id) {
    if (id) {
        apiGetSuppliers().then(({ data }) => {
            const sup = (data || []).find(s => s.id === id);
            if (!sup) return;
            renderSupplierForm(sup);
        });
    } else {
        renderSupplierForm(null);
    }
}

function renderSupplierForm(sup) {
    const isEdit = !!sup;
    openModal(
        '<h3 class="text-xl font-bold mb-4">' + (isEdit ? 'Editar' : 'Nuevo') + ' Proveedor</h3>' +
        '<form id="supplier-form" class="space-y-4">' +
            inGroup('Empresa', '<input type="text" name="name" class="form-input" required value="' + (isEdit ? esc(sup.name) : '') + '">') +
            inGroup('Contacto', '<input type="text" name="contact_name" class="form-input" value="' + (isEdit ? esc(sup.contact_name || '') : '') + '">') +
            inGroup('Email', '<input type="email" name="email" class="form-input" value="' + (isEdit ? esc(sup.email || '') : '') + '">') +
            inGroup('Teléfono', '<input type="text" name="phone" class="form-input" value="' + (isEdit ? esc(sup.phone || '') : '') + '">') +
            '<div class="flex justify-end gap-3 pt-4">' +
                '<button type="button" onclick="closeModal()" class="btn-secondary">Cancelar</button>' +
                '<button type="submit" class="btn-primary">' + (isEdit ? 'Actualizar' : 'Crear') + '</button>' +
            '</div>' +
        '</form>'
    );
    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        const res = isEdit ? await apiUpdateSupplier(sup.id, data) : await apiCreateSupplier(data);
        if (res.error) { alert('Error: ' + res.error.message); return; }
        closeModal();
        renderSuppliers();
    });
}

function deleteSupplier(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    apiDeleteSupplier(id).then(({ error }) => {
        if (error) { alert('Error: ' + error.message); return; }
        renderSuppliers();
    });
}

// ─── TRANSACTIONS ────────────────────────────────────────────

function renderTransactions() {
    currentView = 'transactions';
    showLoading();
    apiGetTransactions().then(({ data, error }) => {
        if (error) { viewContainer.innerHTML = showError(error.message); return; }

        const rows = (data || []).map(t =>
            '<tr class="hover:bg-slate-700/50">' +
                '<td class="table-cell text-xs">' + new Date(t.created_at).toLocaleString('es-CO') + '</td>' +
                '<td class="table-cell">' + (t.products ? esc(t.products.name) : '—') + '</td>' +
                '<td class="table-cell font-mono text-xs">' + (t.products ? esc(t.products.sku) : '—') + '</td>' +
                '<td class="table-cell"><span class="' + (t.type === 'IN' ? 'badge-in' : 'badge-out') + '">' + (t.type === 'IN' ? 'ENTRADA' : 'SALIDA') + '</span></td>' +
                '<td class="table-cell font-semibold">' + (t.quantity || 0) + '</td>' +
                '<td class="table-cell text-slate-400">' + esc(t.reason || '—') + '</td>' +
            '</tr>'
        );

        viewContainer.innerHTML =
            '<h2 class="text-2xl font-bold mb-6">Historial de Movimientos</h2>' +
            buildTable(
                ['Fecha', 'Producto', 'SKU', 'Tipo', 'Cantidad', 'Razón'],
                rows, 'Sin movimientos registrados', 6
            );
    }).catch(err => { viewContainer.innerHTML = showError(err.message); });
}

function showTransactionForm(productId, productName) {
    openModal(
        '<h3 class="text-xl font-bold mb-4">Registrar Movimiento</h3>' +
        '<p class="text-slate-300 mb-4">Producto: <span class="font-semibold">' + esc(productName) + '</span></p>' +
        '<form id="transaction-form" class="space-y-4">' +
            inGroup('Tipo',
                '<select name="type" class="form-input" required>' +
                    '<option value="IN">Entrada (IN)</option>' +
                    '<option value="OUT">Salida (OUT)</option>' +
                '</select>'
            ) +
            inGroup('Cantidad', '<input type="number" name="quantity" class="form-input" required min="1">') +
            inGroup('Razón',
                '<select name="reason" class="form-input" required>' +
                    '<option value="Compra">Compra</option>' +
                    '<option value="Venta">Venta</option>' +
                    '<option value="Ajuste">Ajuste</option>' +
                    '<option value="Devolución">Devolución</option>' +
                '</select>'
            ) +
            '<div class="flex justify-end gap-3 pt-4">' +
                '<button type="button" onclick="closeModal()" class="btn-secondary">Cancelar</button>' +
                '<button type="submit" class="btn-primary">Registrar</button>' +
            '</div>' +
        '</form>'
    );
    document.getElementById('transaction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.product_id = productId;
        data.quantity = parseInt(data.quantity) || 0;
        if (data.quantity < 1) { alert('La cantidad debe ser mayor a 0'); return; }
        const { session } = await apiGetSession();
        data.user_id = session?.user?.id || null;
        const res = await apiCreateTransaction(data);
        if (res.error) { alert('Error: ' + res.error.message); return; }
        closeModal();
        renderProducts();
    });
}

// ─── HELPERS ─────────────────────────────────────────────────

function inGroup(label, input) {
    return '<div><label class="form-label">' + label + '</label>' + input + '</div>';
}