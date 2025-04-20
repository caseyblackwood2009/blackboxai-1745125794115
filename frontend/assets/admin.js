import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const adminPasswordInput = document.getElementById('admin-password');
  const loginButton = document.getElementById('login-button');
  const loginError = document.getElementById('login-error');
  const linksList = document.getElementById('links-list');

  function getInputValue(el) {
    return el.textContent.trim();
  }

  function clearInput(el) {
    el.textContent = '';
  }

  function createLinkElement(link) {
    const container = document.createElement('div');
    container.className = 'link-item';
    container.style.border = '1px solid #d1d5db';
    container.style.borderRadius = '6px';
    container.style.padding = '0.5rem';
    container.style.marginBottom = '0.5rem';

    const shortCode = document.createElement('div');
    shortCode.textContent = `Short Code: ${link.short_code}`;
    shortCode.style.fontWeight = '600';

    const originalUrl = document.createElement('div');
    originalUrl.textContent = `Original URL: ${link.original_url}`;

    const useradmin = document.createElement('div');
    useradmin.textContent = `User Admin Enabled: ${link.useradmin_enabled ? 'Yes' : 'No'}`;

    const warning = document.createElement('div');
    warning.textContent = `Warning Enabled: ${link.warning_enabled ? 'Yes' : 'No'}`;

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginTop = '0.5rem';

    // Remove button
    const removeBtn = document.createElement('div');
    removeBtn.className = 'button-like';
    removeBtn.textContent = 'Remove';
    removeBtn.style.display = 'inline-block';
    removeBtn.style.marginRight = '0.5rem';
    removeBtn.style.backgroundColor = '#ef4444'; // red
    removeBtn.style.cursor = 'pointer';
    removeBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to remove this link?')) {
        updateLink(link.short_code, 'remove', null);
      }
    });

    // Extend lifespan button
    const extendBtn = document.createElement('div');
    extendBtn.className = 'button-like';
    extendBtn.textContent = 'Extend Lifespan (hours)';
    extendBtn.style.display = 'inline-block';
    extendBtn.style.marginRight = '0.5rem';
    extendBtn.addEventListener('click', () => {
      const hours = prompt('Enter number of hours to extend lifespan:');
      if (hours && !isNaN(hours)) {
        updateLink(link.short_code, 'extend_lifespan', parseInt(hours, 10) * 3600);
      }
    });

    // Edit URL button
    const editBtn = document.createElement('div');
    editBtn.className = 'button-like';
    editBtn.textContent = 'Edit URL';
    editBtn.style.display = 'inline-block';
    editBtn.style.marginRight = '0.5rem';
    editBtn.addEventListener('click', () => {
      const newUrl = prompt('Enter new URL:', link.original_url);
      if (newUrl) {
        updateLink(link.short_code, 'edit_url', newUrl);
      }
    });

    // Toggle warning button
    const toggleWarningBtn = document.createElement('div');
    toggleWarningBtn.className = 'button-like';
    toggleWarningBtn.textContent = link.warning_enabled ? 'Disable Warning' : 'Enable Warning';
    toggleWarningBtn.style.display = 'inline-block';
    toggleWarningBtn.addEventListener('click', () => {
      updateLink(link.short_code, 'toggle_warning', !link.warning_enabled);
    });

    buttonsContainer.appendChild(removeBtn);
    buttonsContainer.appendChild(extendBtn);
    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(toggleWarningBtn);

    container.appendChild(shortCode);
    container.appendChild(originalUrl);
    container.appendChild(useradmin);
    container.appendChild(warning);
    container.appendChild(buttonsContainer);

    return container;
  }

  async function updateLink(short_code, action, value) {
    const password = getInputValue(adminPasswordInput);
    if (!password) {
      alert('Please enter admin password');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password, short_code, action, value})
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert('Action successful');
        loadLinks();
      }
    } catch (err) {
      alert('Error performing action');
    }
  }

  async function loadLinks() {
    const password = getInputValue(adminPasswordInput);
    if (!password) {
      loginError.textContent = 'Please enter admin password';
      loginError.style.display = 'block';
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password})
      });
      const data = await response.json();
      if (data.error) {
        loginError.textContent = data.error;
        loginError.style.display = 'block';
        return;
      }
      loginError.style.display = 'none';
      linksList.innerHTML = '';
      data.links.forEach(link => {
        const el = createLinkElement(link);
        linksList.appendChild(el);
      });
      loginSection.classList.add('input-section-hidden');
      dashboardSection.classList.remove('input-section-hidden');
    } catch (err) {
      loginError.textContent = 'Error loading links';
      loginError.style.display = 'block';
    }
  }

  loginButton.addEventListener('click', loadLinks);
});
</create_file>
