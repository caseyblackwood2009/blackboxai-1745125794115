document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('mode-toggle');
  const htmlEl = document.documentElement;

  // Dark/light mode toggle
  function updateMode(checked) {
    if (checked) {
      htmlEl.classList.add('dark');
      modeToggle.setAttribute('aria-checked', 'true');
    } else {
      htmlEl.classList.remove('dark');
      modeToggle.setAttribute('aria-checked', 'false');
    }
  }

  modeToggle.addEventListener('click', () => {
    const isDark = htmlEl.classList.contains('dark');
    updateMode(!isDark);
  });

  modeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      modeToggle.click();
    }
  });

  // Checkbox-like toggles
  function setupCheckbox(id, onChange) {
    const el = document.getElementById(id);
    el.addEventListener('click', () => {
      const checked = el.getAttribute('aria-checked') === 'true';
      el.setAttribute('aria-checked', (!checked).toString());
      onChange(!checked);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  }

  // Show/hide elements helper
  function toggleVisibility(id, show) {
    const el = document.getElementById(id);
    if (show) {
      el.classList.remove('input-section-hidden');
    } else {
      el.classList.add('input-section-hidden');
    }
  }

  // Useradmin checkbox
  setupCheckbox('useradmin-checkbox', (checked) => {
    toggleVisibility('useradmin-password-container', checked);
  });

  // Enable lifespan checkbox
  setupCheckbox('enable-lifespan-checkbox', (checked) => {
    toggleVisibility('lifespan-container', checked);
  });

  // Multiple links checkbox
  setupCheckbox('multiple-links-checkbox', (checked) => {
    toggleVisibility('multiple-links-count-container', checked);
  });

  // Dropdowns
  function setupDropdown(id) {
    const dropdown = document.getElementById(id);
    const content = dropdown.querySelector('.dropdown-content');
    dropdown.addEventListener('click', () => {
      dropdown.classList.toggle('open');
    });
    content.querySelectorAll('div').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.querySelector('span').textContent = item.textContent;
        dropdown.dataset.value = item.dataset.value;
        dropdown.classList.remove('open');
      });
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  setupDropdown('hours-dropdown');
  setupDropdown('days-dropdown');
  setupDropdown('weeks-dropdown');

  // Generate button logic
  const generateBtn = document.getElementById('generate-button');
  const generateAgainBtn = document.getElementById('generate-again-button');
  const outputTextarea = document.getElementById('output-textarea');
  const copyBtn = document.getElementById('copy-button');

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el.textContent.trim();
  }

  function getCheckboxValue(id) {
    const el = document.getElementById(id);
    return el.getAttribute('aria-checked') === 'true';
  }

  function disableGenerate(disabled) {
    if (disabled) {
      generateBtn.classList.add('disabled');
      generateBtn.style.pointerEvents = 'none';
    } else {
      generateBtn.classList.remove('disabled');
      generateBtn.style.pointerEvents = 'auto';
    }
  }

  generateBtn.addEventListener('click', async () => {
    const url = getInputValue('url-input');
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    disableGenerate(true);
    outputTextarea.value = '';
    generateAgainBtn.classList.add('input-section-hidden');

    const useradmin = getCheckboxValue('useradmin-checkbox');
    const useradmin_password = useradmin ? getInputValue('useradmin-password') : '';
    const enable_lifespan = getCheckboxValue('enable-lifespan-checkbox');
    const lifespan_hours = parseInt(document.getElementById('hours-dropdown').dataset.value || '0', 10);
    const lifespan_days = parseInt(document.getElementById('days-dropdown').dataset.value || '0', 10);
    const lifespan_weeks = parseInt(document.getElementById('weeks-dropdown').dataset.value || '0', 10);
    const multiple_links_enabled = getCheckboxValue('multiple-links-checkbox');
    let multiple_links_count = 1;
    if (multiple_links_enabled) {
      const countStr = getInputValue('multiple-links-count');
      multiple_links_count = parseInt(countStr, 10);
      if (isNaN(multiple_links_count) || multiple_links_count < 1) {
        alert('Please enter a valid number of links');
        disableGenerate(false);
        return;
      }
    }

    const payload = {
      url,
      useradmin,
      useradmin_password,
      enable_lifespan,
      lifespan_hours,
      lifespan_days,
      lifespan_weeks,
      multiple_links_enabled,
      multiple_links_count
    };

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        disableGenerate(false);
        return;
      }
      outputTextarea.value = data.short_links.join('\n');
      generateAgainBtn.classList.remove('input-section-hidden');
    } catch (err) {
      alert('Error generating short links');
    }
  });

  generateAgainBtn.addEventListener('click', () => {
    outputTextarea.value = '';
    disableGenerate(false);
    generateAgainBtn.classList.add('input-section-hidden');
  });

  copyBtn.addEventListener('click', () => {
    outputTextarea.select();
    document.execCommand('copy');
  });
});
