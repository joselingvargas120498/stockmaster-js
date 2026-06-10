const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authError = document.getElementById('auth-error');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authRegisterBtn = document.getElementById('auth-register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');

function showAuth() {
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
}

function showApp() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'flex';
}

function setAuthError(msg) {
    if (msg) {
        authError.textContent = msg;
        authError.classList.remove('hidden');
    } else {
        authError.classList.add('hidden');
    }
}

function updateUserInfo(user) {
    userInfo.textContent = user?.email || '';
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setAuthError(null);
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Ingresando...';
    const email = authEmail.value;
    const password = authPassword.value;
    const { data, error } = await apiSignIn(email, password);
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = 'Iniciar Sesión';
    if (error) {
        setAuthError(error.message);
    }
});

authRegisterBtn.addEventListener('click', async () => {
    setAuthError(null);
    const email = authEmail.value;
    const password = authPassword.value;
    if (!email || !password) {
        setAuthError('Ingresa email y contraseña para registrarte');
        return;
    }
    authRegisterBtn.disabled = true;
    authRegisterBtn.textContent = 'Registrando...';
    const { data, error } = await apiSignUp(email, password);
    authRegisterBtn.disabled = false;
    authRegisterBtn.textContent = 'Registrarse';
    if (error) {
        setAuthError(error.message);
    } else {
        setAuthError('Registro exitoso. Revisa tu email para confirmar (si está habilitado) o inicia sesión.');
    }
});

logoutBtn.addEventListener('click', async () => {
    await apiSignOut();
});

async function checkAuth() {
    const { session } = await apiGetSession();
    if (session) {
        updateUserInfo(session.user);
        showApp();
        renderDashboard();
    } else {
        showAuth();
    }
}

apiOnAuth((event, session) => {
    if (session) {
        updateUserInfo(session.user);
        showApp();
        if (currentView === 'dashboard') renderDashboard();
        else renderProducts();
    } else {
        showAuth();
    }
});