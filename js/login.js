// Credenciales
const ADMIN_USER = 'imperiodrinks';
const ADMIN_PASSWORD = 'Bassi2026';
const SESSION_KEY = 'imperio_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Verificar si ya está autenticado
function checkAuth() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      const data = JSON.parse(session);
      const now = Date.now();
      if (data.expires > now) {
        return true;
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }
  return false;
}

// Si está en admin.html, verificar autenticación
if (window.location.pathname.includes('admin.html')) {
  if (!checkAuth()) {
    window.location.href = './login.html';
  }
}

// Manejar login
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('errorMsg');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      errorMsg.classList.remove('show');
      submitBtn.disabled = true;

      // Validar credenciales
      if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
        // Crear sesión
        const sessionData = {
          user: username,
          authenticated: true,
          loginTime: Date.now(),
          expires: Date.now() + SESSION_DURATION
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

        // Redirigir a admin
        window.location.href = './admin.html';
      } else {
        // Mostrar error
        errorMsg.textContent = 'Usuario o contraseña incorrectos.';
        errorMsg.classList.add('show');
        submitBtn.disabled = false;
        passwordInput.value = '';
        passwordInput.focus();
      }
    });

    // Enfocar en usuario al cargar
    usernameInput.focus();
  }
});

// Función para cerrar sesión (usar en admin.html)
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = './login.html';
}

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkAuth, logout };
}
