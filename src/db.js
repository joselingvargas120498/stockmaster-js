function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

class LocalDB {
    constructor() {
        this.keys = {
            products: 'sm_products',
            categories: 'sm_categories',
            suppliers: 'sm_suppliers',
            transactions: 'sm_transactions',
            users: 'sm_users'
        };
        this._ready = false;
    }

    init() {
        try {
            ['products', 'categories', 'suppliers', 'transactions', 'users'].forEach(t => {
                if (!localStorage.getItem(this.keys[t])) {
                    localStorage.setItem(this.keys[t], JSON.stringify([]));
                }
            });
            if (this.getCategories().length === 0) {
                this.seed();
            }
            this._ready = true;
        } catch (e) {
            console.warn('StockMaster: Error inicializando DB local, usando datos por defecto', e);
            this.seed();
            this._ready = true;
        }
    }

    seed() {
        const cats = [
            { id: uuid(), name: 'Electrónica', description: 'Dispositivos y componentes electrónicos', created_at: new Date().toISOString() },
            { id: uuid(), name: 'Oficina', description: 'Suministros de oficina y papelería', created_at: new Date().toISOString() },
            { id: uuid(), name: 'Limpieza', description: 'Productos de limpieza e higiene', created_at: new Date().toISOString() }
        ];
        this.setCategories(cats);

        const sups = [
            { id: uuid(), name: 'Distribuidora ABC', contact_name: 'Carlos López', email: 'carlos@abc.com', phone: '3001234567' },
            { id: uuid(), name: 'Importadora Global', contact_name: 'María García', email: 'maria@global.com', phone: '3107654321' }
        ];
        this.setSuppliers(sups);

        const prods = [
            { id: uuid(), sku: 'TEC-001', name: 'Teclado Mecánico RGB', description: 'Teclado mecánico con retroiluminación', price: 180000, cost: 120000, stock_quantity: 25, min_stock: 10, category_id: cats[0].id, supplier_id: sups[0].id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: uuid(), sku: 'MON-002', name: 'Monitor 24" IPS', description: 'Monitor Full HD 75Hz', price: 650000, cost: 480000, stock_quantity: 8, min_stock: 5, category_id: cats[0].id, supplier_id: sups[1].id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: uuid(), sku: 'OFI-001', name: 'Resma Papel Carta', description: 'Resma de 500 hojas', price: 12000, cost: 8500, stock_quantity: 2, min_stock: 15, category_id: cats[1].id, supplier_id: sups[0].id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        this.setProducts(prods);
    }

    get(table) {
        try {
            return JSON.parse(localStorage.getItem(this.keys[table]) || '[]');
        } catch {
            return [];
        }
    }

    set(table, data) {
        try {
            localStorage.setItem(this.keys[table], JSON.stringify(data));
        } catch (e) {
            console.warn('StockMaster: Error guardando ' + table, e);
        }
    }

    getCategories() { return this.get('categories'); }
    setCategories(d) { this.set('categories', d); }
    getSuppliers() { return this.get('suppliers'); }
    setSuppliers(d) { this.set('suppliers', d); }
    getProducts() { return this.get('products'); }
    setProducts(d) { this.set('products', d); }
    getTransactions() { return this.get('transactions'); }
    setTransactions(d) { this.set('transactions', d); }
    getUsers() { return this.get('users'); }
    setUsers(d) { this.set('users', d); }

    findById(table, id) { return this.get(table).find(i => i.id === id); }

    signIn(email, password) {
        const user = this.getUsers().find(u => u.email === email && u.password === password);
        if (!user) return { error: { message: 'Credenciales inválidas' } };
        const session = { user: { id: user.id, email: user.email }, expires_at: Date.now() + 86400000 };
        localStorage.setItem('sm_session', JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('sm-auth-change', { detail: session }));
        return { data: { user: session.user } };
    }

    signUp(email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) return { error: { message: 'El email ya está registrado' } };
        const user = { id: uuid(), email, password };
        users.push(user);
        this.setUsers(users);
        const session = { user: { id: user.id, email: user.email }, expires_at: Date.now() + 86400000 };
        localStorage.setItem('sm_session', JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('sm-auth-change', { detail: session }));
        return { data: { user: session.user } };
    }

    signOut() {
        localStorage.removeItem('sm_session');
        window.dispatchEvent(new CustomEvent('sm-auth-change', { detail: null }));
        return {};
    }

    getSession() {
        try {
            const raw = localStorage.getItem('sm_session');
            if (!raw) return { session: null };
            const session = JSON.parse(raw);
            if (session.expires_at < Date.now()) {
                localStorage.removeItem('sm_session');
                return { session: null };
            }
            return { session };
        } catch {
            return { session: null };
        }
    }

    getProductsWithJoins() {
        const products = this.getProducts();
        const categories = this.getCategories();
        const suppliers = this.getSuppliers();
        return products.map(p => ({
            ...p,
            categories: categories.find(c => c.id === p.category_id) || null,
            suppliers: suppliers.find(s => s.id === p.supplier_id) || null
        })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    createProduct(product) {
        const products = this.getProducts();
        if (products.find(p => p.sku === product.sku)) return { error: { message: 'El SKU ya existe' } };
        const p = { ...product, id: uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        products.push(p);
        this.setProducts(products);
        return { data: [p] };
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return { error: { message: 'Producto no encontrado' } };
        products[idx] = { ...products[idx], ...updates, updated_at: new Date().toISOString() };
        this.setProducts(products);
        return { data: [products[idx]] };
    }

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.setProducts(products);
        return {};
    }

    createCategory(cat) {
        const categories = this.getCategories();
        const c = { ...cat, id: uuid(), created_at: new Date().toISOString() };
        categories.push(c);
        this.setCategories(categories);
        return { data: [c] };
    }

    updateCategory(id, updates) {
        const categories = this.getCategories();
        const idx = categories.findIndex(c => c.id === id);
        if (idx === -1) return { error: { message: 'Categoría no encontrada' } };
        categories[idx] = { ...categories[idx], ...updates };
        this.setCategories(categories);
        return { data: [categories[idx]] };
    }

    deleteCategory(id) {
        const products = this.getProducts();
        if (products.find(p => p.category_id === id)) return { error: { message: 'No se puede eliminar: hay productos asociados a esta categoría' } };
        this.setCategories(this.getCategories().filter(c => c.id !== id));
        return {};
    }

    createSupplier(sup) {
        const suppliers = this.getSuppliers();
        const s = { ...sup, id: uuid() };
        suppliers.push(s);
        this.setSuppliers(suppliers);
        return { data: [s] };
    }

    updateSupplier(id, updates) {
        const suppliers = this.getSuppliers();
        const idx = suppliers.findIndex(s => s.id === id);
        if (idx === -1) return { error: { message: 'Proveedor no encontrado' } };
        suppliers[idx] = { ...suppliers[idx], ...updates };
        this.setSuppliers(suppliers);
        return { data: [suppliers[idx]] };
    }

    deleteSupplier(id) {
        const products = this.getProducts();
        if (products.find(p => p.supplier_id === id)) return { error: { message: 'No se puede eliminar: hay productos asociados a este proveedor' } };
        this.setSuppliers(this.getSuppliers().filter(s => s.id !== id));
        return {};
    }

    getTransactionsWithJoins() {
        const transactions = this.getTransactions();
        const products = this.getProducts();
        return transactions.map(t => ({
            ...t,
            products: products.find(p => p.id === t.product_id) || null
        })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    createTransaction(transaction) {
        const products = this.getProducts();
        const pIdx = products.findIndex(p => p.id === transaction.product_id);
        if (pIdx === -1) return { error: { message: 'Producto no encontrado' } };

        const qty = transaction.quantity;
        if (transaction.type === 'OUT' && products[pIdx].stock_quantity < qty) {
            return { error: { message: 'Stock insuficiente' } };
        }

        if (transaction.type === 'IN') products[pIdx].stock_quantity += qty;
        else products[pIdx].stock_quantity -= qty;
        products[pIdx].updated_at = new Date().toISOString();
        this.setProducts(products);

        const t = { ...transaction, id: uuid(), created_at: new Date().toISOString() };
        const transactions = this.getTransactions();
        transactions.push(t);
        this.setTransactions(transactions);

        return { data: [{ ...t, products: products[pIdx] }] };
    }

    getDashboardStats() {
        const products = this.getProducts();
        const transactions = this.getTransactions();
        const totalProducts = products.length;
        const totalStock = products.reduce((s, p) => s + (p.stock_quantity || 0), 0);
        const totalValue = products.reduce((s, p) => s + (parseFloat(p.cost) || 0) * (p.stock_quantity || 0), 0);
        const lowStock = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock || 0)).length;
        const totalIn = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + (t.quantity || 0), 0);
        const totalOut = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + (t.quantity || 0), 0);
        return { data: { totalProducts, totalStock, totalValue, lowStock, totalIn, totalOut }, error: null };
    }
}

const db = new LocalDB();