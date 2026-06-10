function initSupabase() {
    db.init();
}

async function apiSignIn(email, password) {
    return db.signIn(email, password);
}

async function apiSignUp(email, password) {
    return db.signUp(email, password);
}

async function apiSignOut() {
    return db.signOut();
}

async function apiGetSession() {
    return db.getSession();
}

async function apiOnAuth(callback) {
    const handler = (e) => {
        if (e.key === 'sm_session') {
            const session = e.newValue ? JSON.parse(e.newValue) : null;
            callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session ? { user: session.user } : null);
        }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('sm-auth-change', (e) => {
        const session = e.detail;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session ? { user: session.user } : null);
    });
    return { unsubscribe: () => { window.removeEventListener('storage', handler); } };
}

async function apiGetProducts() {
    const data = db.getProductsWithJoins();
    return { data, error: null };
}

async function apiGetProduct(id) {
    const product = db.findById('products', id);
    if (!product) return { data: null, error: { message: 'Producto no encontrado' } };
    const categories = db.getCategories();
    const suppliers = db.getSuppliers();
    return {
        data: {
            ...product,
            categories: categories.find(c => c.id === product.category_id) || null,
            suppliers: suppliers.find(s => s.id === product.supplier_id) || null
        },
        error: null
    };
}

async function apiCreateProduct(product) {
    return db.createProduct(product);
}

async function apiUpdateProduct(id, updates) {
    return db.updateProduct(id, updates);
}

async function apiDeleteProduct(id) {
    return db.deleteProduct(id);
}

async function apiGetCategories() {
    const data = db.getCategories().sort((a, b) => a.name.localeCompare(b.name));
    return { data, error: null };
}

async function apiCreateCategory(category) {
    return db.createCategory(category);
}

async function apiUpdateCategory(id, updates) {
    return db.updateCategory(id, updates);
}

async function apiDeleteCategory(id) {
    return db.deleteCategory(id);
}

async function apiGetSuppliers() {
    const data = db.getSuppliers().sort((a, b) => a.name.localeCompare(b.name));
    return { data, error: null };
}

async function apiCreateSupplier(supplier) {
    return db.createSupplier(supplier);
}

async function apiUpdateSupplier(id, updates) {
    return db.updateSupplier(id, updates);
}

async function apiDeleteSupplier(id) {
    return db.deleteSupplier(id);
}

async function apiGetTransactions() {
    const data = db.getTransactionsWithJoins();
    return { data, error: null };
}

async function apiCreateTransaction(transaction) {
    return db.createTransaction(transaction);
}

async function apiGetDashboardStats() {
    return db.getDashboardStats();
}