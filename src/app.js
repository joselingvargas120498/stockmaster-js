document.addEventListener('DOMContentLoaded', () => {
    try { initSupabase(); } catch (e) { console.warn('StockMaster: init error', e); }
    setupNavigation();
    checkAuth();
});

function setupNavigation() {
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-link[data-view]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const view = link.dataset.view;
            switch (view) {
                case 'dashboard': renderDashboard(); break;
                case 'products': renderProducts(); break;
                case 'categories': renderCategories(); break;
                case 'suppliers': renderSuppliers(); break;
                case 'transactions': renderTransactions(); break;
            }
        });
    });
}