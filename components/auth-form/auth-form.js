class RushGameAuthForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.currentTab = 'login';

    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/auth-form/auth-form.html').then((res) => res.text()),
        fetch('./components/auth-form/auth-form.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="auth-form-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error loading RushAuthForm component:', error);
    }
  }

  setupElements() {
    // Success message
    this.successMessage = this.shadowRoot.querySelector('#successMessage');

    // Tabs
    this.registerTab = this.shadowRoot.querySelector('#registerTab');
    this.loginTab = this.shadowRoot.querySelector('#loginTab');

    // Forms
    this.loginFormWrapper = this.shadowRoot.querySelector('#loginForm');
    this.registerFormWrapper = this.shadowRoot.querySelector('#registerForm');
    this.loginFormElement = this.shadowRoot.querySelector('#loginFormElement');
    this.registerFormElement = this.shadowRoot.querySelector('#registerFormElement');

    // Login inputs
    this.loginEmail = this.shadowRoot.querySelector('#loginEmail');
    this.loginPassword = this.shadowRoot.querySelector('#loginPassword');

    // Register inputs
    this.registerEmail = this.shadowRoot.querySelector('#registerEmail');
    this.registerName = this.shadowRoot.querySelector('#registerName');
    this.registerLastName = this.shadowRoot.querySelector('#registerLastName');
    this.registerUsername = this.shadowRoot.querySelector('#registerUsername');
    this.registerAge = this.shadowRoot.querySelector('#registerAge');
    this.registerPassword = this.shadowRoot.querySelector('#registerPassword');
    this.registerPasswordConfirm = this.shadowRoot.querySelector('#registerPasswordConfirm');
    this.captcha = this.shadowRoot.querySelector('#captcha');
  }

  setupEventListeners() {
    // Tab switching
    this.registerTab.addEventListener('click', () => this.switchTab('register'));
    this.loginTab.addEventListener('click', () => this.switchTab('login'));

    // Form submissions
    this.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
    this.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));

    // Validation for register form
    this.registerEmail.addEventListener('blur', () =>
      this.validateEmail(this.registerEmail, 'registerEmailError')
    );
    this.registerName.addEventListener('blur', () =>
      this.validateRequired(this.registerName, 'registerNameError', 'El nombre es requerido')
    );
    this.registerLastName.addEventListener('blur', () =>
      this.validateRequired(
        this.registerLastName,
        'registerLastNameError',
        'El apellido es requerido'
      )
    );
    this.registerUsername.addEventListener('blur', () => this.validateUsername());
    this.registerAge.addEventListener('blur', () => this.validateAge());
    this.registerPassword.addEventListener('blur', () => this.validatePassword());
    this.registerPasswordConfirm.addEventListener('blur', () => this.validatePasswordConfirm());

    // Social buttons
    this.shadowRoot.querySelectorAll('.social-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleSocialAuth(e));
    });
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Update tab buttons
    this.registerTab.classList.toggle('active', tab === 'register');
    this.loginTab.classList.toggle('active', tab === 'login');

    // Update form visibility
    this.registerFormWrapper.classList.toggle('hidden', tab !== 'register');
    this.loginFormWrapper.classList.toggle('hidden', tab !== 'login');

    // Emit event
    this.dispatchEvent(
      new CustomEvent('tabChanged', {
        detail: { tab },
        bubbles: true,
      })
    );
  }

  // Validation methods
  validateEmail(input, errorId) {
    const email = input.value.trim();
    const errorElement = this.shadowRoot.querySelector(`#${errorId}`);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showError(input, errorElement, 'El email es requerido');
      return false;
    }

    if (!emailRegex.test(email)) {
      this.showError(input, errorElement, 'El email no es válido');
      return false;
    }

    this.clearError(input, errorElement);
    return true;
  }

  validateRequired(input, errorId, message) {
    const value = input.value.trim();
    const errorElement = this.shadowRoot.querySelector(`#${errorId}`);

    if (!value) {
      this.showError(input, errorElement, message);
      return false;
    }

    this.clearError(input, errorElement);
    return true;
  }

  validateUsername() {
    const username = this.registerUsername.value.trim();
    const errorElement = this.shadowRoot.querySelector('#registerUsernameError');
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (username && !usernameRegex.test(username)) {
      this.showError(this.registerUsername, errorElement, 'Solo letras y números permitidos');
      return false;
    }

    if (username.length > 15) {
      this.showError(this.registerUsername, errorElement, 'Máximo 15 caracteres');
      return false;
    }

    this.clearError(this.registerUsername, errorElement);
    return true;
  }

  validateAge() {
    const age = parseInt(this.registerAge.value);
    const errorElement = this.shadowRoot.querySelector('#registerAgeError');

    if (!age) {
      this.showError(this.registerAge, errorElement, 'La edad es requerida');
      return false;
    }

    if (age < 13) {
      this.showError(this.registerAge, errorElement, 'Debes tener al menos 13 años');
      return false;
    }

    if (age > 120) {
      this.showError(this.registerAge, errorElement, 'Edad inválida');
      return false;
    }

    this.clearError(this.registerAge, errorElement);
    return true;
  }

  validatePassword() {
    const password = this.registerPassword.value;
    const errorElement = this.shadowRoot.querySelector('#registerPasswordError');

    if (!password) {
      this.showError(this.registerPassword, errorElement, 'La contraseña es requerida');
      return false;
    }

    if (password.length < 6) {
      this.showError(this.registerPassword, errorElement, 'Mínimo 6 caracteres');
      return false;
    }

    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumber || !hasSpecial) {
      this.showError(
        this.registerPassword,
        errorElement,
        'Debe contener 1 número y 1 carácter especial'
      );
      return false;
    }

    this.clearError(this.registerPassword, errorElement);
    return true;
  }

  validatePasswordConfirm() {
    const password = this.registerPassword.value;
    const passwordConfirm = this.registerPasswordConfirm.value;
    const errorElement = this.shadowRoot.querySelector('#registerPasswordConfirmError');

    if (!passwordConfirm) {
      this.showError(this.registerPasswordConfirm, errorElement, 'Debes confirmar la contraseña');
      return false;
    }

    if (password !== passwordConfirm) {
      this.showError(this.registerPasswordConfirm, errorElement, 'Las contraseñas no coinciden');
      return false;
    }

    this.clearError(this.registerPasswordConfirm, errorElement);
    return true;
  }

  showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  clearError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }

  // Form handlers
  handleLogin(e) {
    e.preventDefault();

    const emailValid = this.validateEmail(this.loginEmail, 'loginEmailError');
    const passwordValid = this.validateRequired(
      this.loginPassword,
      'loginPasswordError',
      'La contraseña es requerida'
    );

    if (!emailValid || !passwordValid) {
      return;
    }

    const formData = {
      email: this.loginEmail.value.trim(),
      password: this.loginPassword.value,
    };

    // simulate login
    this.simulateLogin(formData);
  }

  simulateLogin(formData) {
    // Save status session in localStorage
    localStorage.setItem(
      'rushgames_user',
      JSON.stringify({
        email: formData.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      })
    );

    // Redirect to home after a short delay
    setTimeout(() => {
      window.location.href = './index.html';
    }, 500);
  }

  showSuccessAnimation() {
    // Ensure the success message element exists
    if (!this.successMessage) {
      console.error('Success message element not found');
      // Fallback: redirect immediately if element is missing
      setTimeout(() => {
        window.location.href = './index.html';
      }, 500);
      return;
    }

    // Show success message with animation
    this.successMessage.classList.add('show');

    // Hide after animation and redirect
    setTimeout(() => {
      window.location.href = './index.html';
    }, 2000); // 2 seconds to show the success message
  }

  handleRegister(e) {
    e.preventDefault();

    // Validate all fields
    const validations = [
      this.validateEmail(this.registerEmail, 'registerEmailError'),
      this.validateRequired(this.registerName, 'registerNameError', 'El nombre es requerido'),
      this.validateRequired(
        this.registerLastName,
        'registerLastNameError',
        'El apellido es requerido'
      ),
      this.validateUsername(),
      this.validateAge(),
      this.validatePassword(),
      this.validatePasswordConfirm(),
    ];

    if (!this.captcha.checked) {
      alert('Por favor completa el captcha');
      return;
    }

    if (!validations.every((v) => v)) {
      return;
    }

    const formData = {
      email: this.registerEmail.value.trim(),
      name: this.registerName.value.trim(),
      lastName: this.registerLastName.value.trim(),
      username: this.registerUsername.value.trim(),
      age: parseInt(this.registerAge.value),
      password: this.registerPassword.value,
    };

    // Save user data to localStorage
    localStorage.setItem(
      'rushgames_user',
      JSON.stringify({
        email: formData.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      })
    );

    // Show success animation and then redirect
    this.showSuccessAnimation();
  }

  handleSocialAuth(e) {
    const isFacebook = e.currentTarget.classList.contains('facebook');
    const provider = isFacebook ? 'facebook' : 'google';

    this.dispatchEvent(
      new CustomEvent('socialAuth', {
        detail: { provider },
        bubbles: true,
      })
    );

    console.log('Social auth:', provider);
  }

  // Public API
  reset() {
    this.loginFormElement.reset();
    this.registerFormElement.reset();

    // Hide success message (if it exists)
    if (this.successMessage) {
      this.successMessage.classList.remove('show');
    }

    // Clear all errors
    this.shadowRoot.querySelectorAll('.error-message').forEach((el) => {
      el.classList.remove('show');
      el.textContent = '';
    });

    this.shadowRoot.querySelectorAll('input').forEach((input) => {
      input.classList.remove('error');
    });
  }

  switchToLogin() {
    this.switchTab('login');
  }

  switchToRegister() {
    this.switchTab('register');
  }

  // Lifecycle
  connectedCallback() {
    console.log('RushAuthForm connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushAuthForm disconnected from DOM');
  }

  static get observedAttributes() {
    return ['default-tab'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'default-tab' && newValue) {
      this.currentTab = newValue;
      if (this.shadowRoot) {
        this.switchTab(newValue);
      }
    }
  }
}

customElements.define('rushgame-auth-form', RushGameAuthForm);
