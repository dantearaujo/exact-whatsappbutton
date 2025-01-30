// Create a global namespace for the WhatsApp button
window.WhatsAppButton = window.WhatsAppButton || {
  config: {
    greeting: 'Olá! Tudo bem? Tem alguma dúvida sobre os nossos produtinhos?',
    phoneNumber: '',
    position: { bottom: '40px', right: '40px' },
    webhookUrl: 'https://n8nwebhooks.agenciametodo.com/webhook/c055838b-8203-40ce-9ea5-b012a3d4884c'
  },
  isMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  init: function (customConfig = {}) {
    // Merge custom config with default config
    this.config = { ...this.config, ...customConfig };

    // Initialize the WhatsApp button
    this.initializeButton();
  },
  initializeButton: function () {
    // Global variable to store location
    let userLocation = { available: false };

    // Get location from IP address
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        userLocation = {
          available: true,
          type: 'ip-based',
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          ip: data.ip
        };
      })
      .catch(error => {
        console.log('Could not fetch location data:', error);
      });

    // Load IMask library
    const imaskScript = document.createElement('script');
    imaskScript.src = 'https://unpkg.com/imask';
    document.head.appendChild(imaskScript);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .wa-modal-title {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 20px;
      }
      .wa-float-btn {
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: ${this.config.position.bottom};
        right: ${this.config.position.right};
        background-color: #25d366;
        color: #FFF;
        border-radius: 50px;
        text-align: center;
        font-size: 30px;
        box-shadow: 2px 2px 3px #999;
        z-index: 100;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wa-float-btn:hover {
        background-color: #128C7E;
      }
      .wa-float-btn svg {
        width: 30px;
        height: 30px;
      }
      .wa-modal {
        display: none;
        position: fixed;
        bottom: 110px;
        right: 40px;
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 101;
        width: 300px;
        background:url(https://d3eq1zq78ux3cv.cloudfront.net/static/wp-bg.png) repeat center center transparent;
      }
      .wa-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 16px;
      }
      .wa-modal-header img {
        height: 40px;
        width: auto;
      }
      .wa-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
      }
      .wa-modal h2 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      .wa-modal form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .wa-form-group {
        position: relative;
      }
      .wa-form-group input,
      .wa-form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .wa-form-group textarea {
        height: 80px;
        resize: none;
      }
      .wa-form-group .error {
        color: red;
        font-size: 12px;
        margin-top: 4px;
        display: none;
      }
      .wa-form-group.has-error input,
      .wa-form-group.has-error textarea {
        border-color: red;
      }
      .wa-form-group.has-error .error {
        display: block;
      }
      .wa-submit-btn {
        background-color: #25d366;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .wa-submit-btn:hover {
        background-color: #128C7E;
      }
    `;
    document.head.appendChild(style);

    // Create WhatsApp button
    const floatBtn = document.createElement('div');
    floatBtn.className = 'wa-float-btn';
    floatBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';

    // Create modal
    const modal = document.createElement('div');
    modal.className = "wa-modal";
    modal.innerHTML = `
      <div class="wa-modal-header">
        <div class="wa-modal-title">${this.config.greeting}</div>
        <button class="wa-modal-close">&times;</button>
      </div>
      <form id="wa-form">
        <div class="wa-form-group">
          <input type="text" id="wa-name" placeholder="Nome" required>
          <div class="error"></div>
        </div>
        <div class="wa-form-group">
          <input type="email" id="wa-email" placeholder="Email" required>
          <div class="error"></div>
        </div>
        <div class="wa-form-group">
          <input type="tel" id="wa-phone" placeholder="Telefone" required>
          <div class="error"></div>
        </div>
        <button type="submit" class="wa-submit-btn">Enviar mensagem</button>
      </form>
    `;

    // Append elements to body
    document.body.appendChild(floatBtn);
    document.body.appendChild(modal);

    // Initialize phone mask when IMask is loaded
    const onload = () => {
      if (typeof IMask !== 'undefined') {
        IMask(document.getElementById('wa-phone'), {
          mask: '(00) 00000-0000'
        });
      } else {
        setTimeout(onload, 100);
      }
    };
    onload();

    // Form validation functions
    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
      return phone.replace(/\D/g, '').length === 11;
    };

    const showError = (input, message) => {
      const formGroup = input.parentElement;
      formGroup.classList.add('has-error');
      const error = formGroup.querySelector('.error');
      error.textContent = message;
    };

    const hideError = (input) => {
      const formGroup = input.parentElement;
      formGroup.classList.remove('has-error');
      const error = formGroup.querySelector('.error');
      error.textContent = '';
    };

    // Event Listeners
    floatBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });

    document.querySelector('.wa-modal-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Input validation handlers
    document.getElementById('wa-name').addEventListener('input', (e) => {
      if (e.target.value) {
        hideError(e.target);
      }
    });

    document.getElementById('wa-email').addEventListener('input', (e) => {
      if (validateEmail(e.target.value)) {
        hideError(e.target);
      }
    });

    document.getElementById('wa-phone').addEventListener('input', (e) => {
      if (validatePhone(e.target.value)) {
        hideError(e.target);
      }
    });

    // Form submission
    const form = document.getElementById('wa-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('wa-name').value;
      const email = document.getElementById('wa-email').value;
      const phone = document.getElementById('wa-phone').value;

      // Validate all fields
      let isValid = true;

      if (!name) {
        showError(document.getElementById('wa-name'), 'Por favor, preencha seu nome');
        isValid = false;
      }

      if (!validateEmail(email)) {
        showError(document.getElementById('wa-email'), 'Por favor, insira um email válido');
        isValid = false;
      }

      if (!validatePhone(phone)) {
        showError(document.getElementById('wa-phone'), 'Por favor, insira um telefone válido');
        isValid = false;
      }

      if (isValid) {
        try {
          // Send data to webhook
          if (this.config.webhookUrl) {
            const webhookData = {
              name,
              email,
              phone,
              location: userLocation,
              timestamp: new Date().toISOString(),
              pageInfo: {
                title: document.title,
                url: window.location.href,
                referrer: document.referrer || "Direct"
              },
              isMobile: this.isMobile(),
            };

            await fetch(this.config.webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookData)
            });
          }

          // Open WhatsApp without user data
          const destinationPhone = this.config.phoneNumber.replace(/\D/g, '');
          const whatsappUrl = `https://wa.me/${destinationPhone}`;
          window.open(whatsappUrl, '_blank');

          // Reset and close form
          modal.style.display = 'none';
          form.reset();
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      }
    });
  }
};
