document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const passwordInput = document.getElementById('useradmin-password');
  const loginButton = document.getElementById('login-button');
  const loginError = document.getElementById('login-error');
  const statsContainer = document.getElementById('stats-container');

  function getInputValue(el) {
    return el.textContent.trim();
  }

  function clearInput(el) {
    el.textContent = '';
  }

  async function loadStats(shortCode, password) {
    try {
      const response = await fetch(`/api/useradmin/${shortCode}`, {
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
      statsContainer.innerHTML = `
        <p>Human Visits: ${data.stats.human_visits}</p>
        <p>Bot Visits (Blocked): ${data.stats.bot_visits}</p>
        <p>Total Visits: ${data.stats.total_visits}</p>
      `;
      loginSection.classList.add('input-section-hidden');
      dashboardSection.classList.remove('input-section-hidden');
    } catch (err) {
      loginError.textContent = 'Error loading stats';
      loginError.style.display = 'block';
    }
  }

  loginButton.addEventListener('click', () => {
    const password = getInputValue(passwordInput);
    if (!password) {
      alert('Please enter user admin password');
      return;
    }
    // Extract short code from URL query param "code"
    const params = new URLSearchParams(window.location.search);
    const shortCode = params.get('code');
    if (!shortCode) {
      alert('Short code not found in URL');
      return;
    }
    loadStats(shortCode, password);
  });
});
