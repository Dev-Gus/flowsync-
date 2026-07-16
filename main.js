// Component loader
async function loadComponent(selector, file) {
  const element = document.querySelector(selector);
  if (!element) return;
  const response = await fetch(file);
  if (!response.ok) return;
  element.innerHTML = await response.text();
}

document.addEventListener('DOMContentLoaded', async function () {
  await loadComponent('[data-component="toast"]', 'components/toast.html');
  if (window.initSettings) {
    window.initSettings();
  }
});

(function () {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');

  function open() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  toggle.addEventListener('click', open);
  close.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  // Tabs
  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) {
        b.classList.remove('text-primary', 'border-primary');
        b.classList.add('text-muted', 'border-transparent');
        b.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(function (c) {
        c.classList.add('hidden');
      });
      btn.classList.remove('text-muted', 'border-transparent');
      btn.classList.add('text-primary', 'border-primary');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + tab).classList.remove('hidden');
    });
  });

  // Modal
  const addBtn = document.getElementById('add-user-btn');
  const modal = document.getElementById('add-user-modal');
  const modalCancel = document.getElementById('modal-cancel');
  const addUserForm = document.getElementById('add-user-form');
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');

  var modalTriggerEl = null; // element focus returns to on close

  function getFocusableElements(container) {
    if (!container) return [];
    var selector = 'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function (el) {
      return el.offsetParent !== null; // skip hidden elements
    });
  }

  function handleModalKeydown(e) {
    if (!modal || !modal.classList.contains('modal-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      var panel = modal.querySelector('.modal-panel');
      var focusable = getFocusableElements(panel);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openModal() {
    if (!modal) return;
    modalTriggerEl = document.activeElement;
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-open');
    clearFormErrors();
    document.addEventListener('keydown', handleModalKeydown);
    var panel = modal.querySelector('.modal-panel');
    var focusable = getFocusableElements(panel);
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('modal-open');
    document.removeEventListener('keydown', handleModalKeydown);
    // Wait for transition to finish before fully hiding
    setTimeout(function () {
      if (modal) modal.classList.add('modal-hidden');
    }, 300);

    if (modalTriggerEl && typeof modalTriggerEl.focus === 'function') {
      modalTriggerEl.focus();
    }
    modalTriggerEl = null;
  }
  // Exposed so other modules (e.g. the user-management form handler) reuse
  // the same close path instead of re-hiding the modal by hand.
  window.closeAddUserModal = closeModal;

  if (addBtn && modal) {
    addBtn.addEventListener('click', openModal);
  }

  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      var content = modal.querySelector('.modal-panel');
      if (content && content.contains(e.target)) return;
      closeModal();
    });
  }

  // Form validation
  function clearFormErrors() {
    if (!nameInput || !emailInput) return;
    nameInput.classList.remove('is-invalid');
    emailInput.classList.remove('is-invalid');
    var nameError = nameInput.parentElement.querySelector('.form-error');
    var emailError = emailInput.parentElement.querySelector('.form-error');
    if (nameError) nameError.classList.add('hidden');
    if (emailError) emailError.classList.add('hidden');
  }

  function showFieldError(input, show) {
    if (!input) return;
    var errorSpan = input.parentElement.querySelector('.form-error');
    if (show) {
      input.classList.add('is-invalid');
      if (errorSpan) errorSpan.classList.remove('hidden');
    } else {
      input.classList.remove('is-invalid');
      if (errorSpan) errorSpan.classList.add('hidden');
    }
  }

  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateForm() {
    var nameValue = nameInput ? nameInput.value.trim() : '';
    var emailValue = emailInput ? emailInput.value.trim() : '';
    var nameValid = nameValue.length > 0;
    var emailValid = validateEmail(emailValue);

    showFieldError(nameInput, !nameValid);
    showFieldError(emailInput, !emailValid);

    return nameValid && emailValid;
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastMessage = toast ? toast.querySelector('.toast-message') : null;
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.remove('toast--success', 'toast--error');
    toast.classList.add(type === 'success' ? 'toast--success' : 'toast--error');
    toast.classList.add('toast-visible');
    setTimeout(function () {
      toast.classList.remove('toast-visible');
    }, 3000);
  }
  window.showToast = showToast;

  if (addUserForm) {
    addUserForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Form submission is now handled by user management IIFE below
    });
  }

  // Clear errors on input
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      showFieldError(nameInput, false);
    });
  }
  if (emailInput) {
    emailInput.addEventListener('input', function () {
      showFieldError(emailInput, false);
    });
  }

  // Dropdowns
  var notificationBtn = document.getElementById('notification-btn');
  var notificationDropdown = document.getElementById('notification-dropdown');
  var profileBtn = document.getElementById('profile-btn');
  var profileDropdown = document.getElementById('profile-dropdown');

  function toggleDropdown(btn, dropdown) {
    if (!btn || !dropdown) return;
    var isHidden = dropdown.classList.contains('hidden');
    closeDropdowns();
    if (isHidden) {
      dropdown.classList.remove('hidden');
    }
  }

  function closeDropdowns() {
    if (notificationDropdown) notificationDropdown.classList.add('hidden');
    if (profileDropdown) profileDropdown.classList.add('hidden');
  }

  function clearSignedInState() {
    var demoStateKeys = ['flowsync-users', 'flowsync-profile-settings', 'flowsync-notifications-settings'];

    demoStateKeys.forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Could not clear localStorage key:', key, e);
      }
    });
  }

  function handleSignOut() {
    clearSignedInState();
    window.showToast('Signed out successfully', 'success');
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 1000);
  }

  if (notificationBtn) {
    notificationBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(notificationBtn, notificationDropdown);
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(profileBtn, profileDropdown);
    });
  }

  if (profileDropdown) {
    var signOutAction = profileDropdown.querySelector('[data-action="sign-out"]');
    if (signOutAction) {
      signOutAction.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleSignOut();
      });
    }
  }

  document.addEventListener('click', function () {
    closeDropdowns();
  });

  if (notificationDropdown) {
    notificationDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (profileDropdown) {
    profileDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
})();

// =============================================
// USER MANAGEMENT (localStorage)
// Handles loading, rendering, and adding users
// =============================================
(function () {
  // Initial hardcoded users (seed data)
  var INITIAL_USERS = [
    {
      id: 1642268400000,
      name: 'Sarah Miller',
      email: 'sarah@example.com',
      role: 'Admin',
      status: 'Active',
      joined: 'Jan 15, 2024'
    },
    {
      id: 1642095600000,
      name: 'Alex Chen',
      email: 'alex@example.com',
      role: 'Developer',
      status: 'Active',
      joined: 'Jan 12, 2024'
    },
    {
      id: 1641577200000,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'Designer',
      status: 'Inactive',
      joined: 'Dec 28, 2023'
    },
    {
      id: 1640977200000,
      name: 'James Brown',
      email: 'james@example.com',
      role: 'Developer',
      status: 'Active',
      joined: 'Dec 15, 2023'
    },
    {
      id: 1640632800000,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      role: 'Manager',
      status: 'Suspended',
      joined: 'Nov 30, 2023'
    }
  ];

  // --- STORAGE HELPERS ---
  function saveUsers(users) {
    try {
      localStorage.setItem('flowsync-users', JSON.stringify(users));
      return true;
    } catch (e) {
      console.warn('localStorage unavailable (private mode?):', e);
      return false;
    }
  }

  function loadUsers() {
    try {
      var stored = localStorage.getItem('flowsync-users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('localStorage read failed:', e);
    }
    // First visit or error: seed with initial data
    saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  }

  // --- RENDER TABLE ---
  function renderUsersTable(users) {
    var tbody = document.querySelector('.table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    users.forEach(function (user) {
      var row = createUserRow(user);
      tbody.appendChild(row);
    });
  }

  // --- CREATE ROW ---
  function createUserRow(user) {
    var tr = document.createElement('tr');

    // Determine avatar colors
    var initials = user.name.split(' ').map(function (n) { return n[0]; }).join('');
    var colorClass = 'bg-primary/20 text-primary';
    if (user.status === 'Inactive') colorClass = 'bg-muted/20 text-muted';
    if (user.status === 'Suspended') colorClass = 'bg-danger/20 text-danger';

    // Status badge
    var badgeClass = 'badge-active';
    if (user.status === 'Inactive') badgeClass = 'badge-inactive';
    if (user.status === 'Suspended') badgeClass = 'badge-danger';

    tr.innerHTML = [
      '<td>',
      '  <div class="flex items-center gap-3">',
      '    <div class="w-8 h-8 rounded-full ' + colorClass + ' flex items-center justify-center text-xs font-semibold shrink-0">',
      '      ' + initials,
      '    </div>',
      '    <span>' + escapeHtml(user.name) + '</span>',
      '  </div>',
      '</td>',
      '<td>' + escapeHtml(user.email) + '</td>',
      '<td>' + escapeHtml(user.role) + '</td>',
      '<td><span class="' + badgeClass + '">' + user.status + '</span></td>',
      '<td>' + user.joined + '</td>',
      '<td>',
      '  <button class="text-muted hover:text-foreground transition-colors p-1" aria-label="User options">',
      '    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">',
      '      <circle cx="12" cy="5" r="1.5" />',
      '      <circle cx="12" cy="12" r="1.5" />',
      '      <circle cx="12" cy="19" r="1.5" />',
      '    </svg>',
      '  </button>',
      '</td>'
    ].join('');

    return tr;
  }

  // --- APPEND ROW (for new additions) ---
  function appendUserRow(user) {
    var tbody = document.querySelector('.table-body');
    if (!tbody) return;

    var row = createUserRow(user);
    tbody.insertBefore(row, tbody.firstChild);
  }

  // --- ESCAPE HTML ---
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- FORMAT DATE ---
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // --- ADD USER ---
  function addUser(formData) {
    var users = loadUsers();

    // Check duplicate email
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());

    if (emailExists) {
      var emailInput = document.getElementById('user-email');
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        var errorSpan = emailInput.parentElement.querySelector('.form-error');
        if (errorSpan) {
          errorSpan.textContent = 'This email is already in use';
          errorSpan.classList.remove('hidden');
        }
      }
      return false;
    }

    // Create new user
    var newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role || 'Developer',
      status: 'Active',
      joined: formatDate(new Date())
    };

    // Save and append
    users.unshift(newUser);
    if (saveUsers(users)) {
      appendUserRow(newUser);
      return true;
    }
    return false;
  }

  // --- INIT ---
  function initUsers() {
    var tableBody = document.querySelector('.table-body');
    if (!tableBody) return; // Not on users page

    var users = loadUsers();
    renderUsersTable(users);

    // Update pagination display
    var paginationSpan = document.querySelector('.flex.items-center.justify-between.px-4.py-3.border-t span');
    if (paginationSpan) {
      paginationSpan.textContent = 'Showing ' + Math.min(5, users.length) + ' of ' + users.length + ' users';
    }

    // Wire form submit to addUser
    var form = document.getElementById('add-user-form');
    if (form) {
      form.removeEventListener('submit', null); // Remove old listener if any
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameInput = document.getElementById('user-name');
        var emailInput = document.getElementById('user-email');
        var roleSelect = document.getElementById('user-role');

        var nameValue = nameInput ? nameInput.value.trim() : '';
        var emailValue = emailInput ? emailInput.value.trim() : '';
        var roleValue = roleSelect ? roleSelect.value : 'Developer';

        // Validate
        var nameValid = nameValue.length > 0;
        var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

        // Clear errors
        if (nameInput) nameInput.classList.remove('is-invalid');
        if (emailInput) emailInput.classList.remove('is-invalid');
        var nameError = nameInput ? nameInput.parentElement.querySelector('.form-error') : null;
        var emailError = emailInput ? emailInput.parentElement.querySelector('.form-error') : null;
        if (nameError) nameError.classList.add('hidden');
        if (emailError) {
          emailError.textContent = 'Please enter a valid email address';
          emailError.classList.add('hidden');
        }

        if (!nameValid) {
          if (nameInput) nameInput.classList.add('is-invalid');
          if (nameError) nameError.classList.remove('hidden');
        }
        if (!emailValid) {
          if (emailInput) emailInput.classList.add('is-invalid');
          if (emailError) emailError.classList.remove('hidden');
        }

        if (nameValid && emailValid) {
          var success = addUser({
            name: nameValue,
            email: emailValue,
            role: roleValue
          });

          if (success) {
            form.reset();
            if (window.closeAddUserModal) {
              window.closeAddUserModal();
            }

            if (window.showToast) {
              window.showToast('User added successfully', 'success');
            } else {
              var toast = document.getElementById('toast');
              var toastMessage = toast ? toast.querySelector('.toast-message') : null;
              if (toast && toastMessage) {
                toastMessage.textContent = 'User added successfully';
                toast.classList.remove('toast--success', 'toast--error');
                toast.classList.add('toast--success', 'toast-visible');
                setTimeout(function () {
                  toast.classList.remove('toast-visible');
                }, 3000);
              }
            }
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUsers);
  } else {
    initUsers();
  }
})();


// Own IIFE keeps variables scoped.
// window.revenueChart is exposed intentionally
// so the dark mode toggle can call .update() later.
// =============================================
(function () {

  // Bail if canvas doesn't exist — safe for other pages sharing main.js
  var canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  // --- GRADIENT FILL ---
  // Built fresh on every render so it survives resize correctly.
  // chartArea gives exact pixel bounds of the plot (excludes axes).
  function createGradient(ctx, chartArea) {
    var gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // emerald 25% at top
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');    // transparent at bottom
    return gradient;
  }

  // --- MOCK DATA ---
  // Realistic curve: slight dip in Feb, recovery, acceleration into May.
  // May value matches the $48,294 shown in the Revenue KPI card.
  var labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  var revenue = [38200, 41500, 39800, 43100, 46700, 48294];

  // --- CHART INSTANCE ---
  window.revenueChart = new Chart(ctx, {
    type: 'line',

    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue',
        data: revenue,

        // Line
        borderColor: '#10b981',
        borderWidth: 2,

        // Gradient fill under the line
        fill: 'origin',
        backgroundColor: function (context) {
          var chart = context.chart;
          var chartArea = chart.chartArea;
          if (!chartArea) return 'transparent'; // guard: null on first tick
          return createGradient(chart.ctx, chartArea);
        },

        // Curve smoothness: 0 = sharp, 1 = very curved, 0.4 = sweet spot
        tension: 0.4,

        // Data point dots
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#09090b',       // matches body bg — creates a ring effect
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false, // wrapper div controls height, not Chart.js

      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      },

      interaction: {
        mode: 'nearest',     // tooltip fires near a point, not only on it
        intersect: false,    // works without pixel-perfect tap — essential on mobile
        axis: 'x'
      },

      plugins: {
        legend: {
          display: false     // one dataset + card title = legend is redundant
        },

        tooltip: {
          backgroundColor: '#18181b',
          borderColor: '#27272a',
          borderWidth: 1,
          titleColor: '#a1a1aa',
          bodyColor: '#f4f4f5',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return '$' + context.parsed.y.toLocaleString();
            }
          }
        }
      },

      scales: {
        x: {
          border: { display: false },
          grid: { display: false },   // no vertical grid lines — cleaner
          ticks: {
            color: '#a1a1aa',
            font: { size: 12 }
          }
        },

        y: {
          border: { display: false },
          grid: {
            color: '#27272a',          // matches your --border token
            lineWidth: 1
          },
          ticks: {
            color: '#a1a1aa',
            font: { size: 12 },
            callback: function (value) {
              return '$' + (value / 1000).toFixed(0) + 'k'; // 38200 → $38k
            }
          }
        }
      }
    }
  });

})();

// =============================================
// SETTINGS MANAGER
// Handles loading and saving form settings to localStorage
// =============================================
(function () {
  /**
   * saveSettings(formId, storageKey)
   * Query all inputs, selects, textareas inside formId by name attribute
   * For checkboxes read .checked (boolean), for everything else read .value
   * Build a plain object { name: value } and JSON.stringify into localStorage
   * Return the saved object
   */
  function saveSettings(formId, storageKey) {
    var form = document.getElementById(formId);
    if (!form) return null;

    var elements = form.querySelectorAll('[name]');
    var settings = {};

    elements.forEach(function (el) {
      var name = el.getAttribute('name');
      if (!name) return;

      if (el.type === 'checkbox') {
        settings[name] = el.checked;
      } else {
        settings[name] = el.value;
      }
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (e) {
      console.warn('localStorage unavailable (private mode?):', e);
    }

    return settings;
  }

  /**
   * loadSettings(formId, storageKey)
   * localStorage.getItem(storageKey), wrap JSON.parse in try/catch
   * If null or parse fails, return early silently
   * For each key in parsed object: find input by name attribute
   * If input type is checkbox set .checked = value, else set .value = value
   */
  function loadSettings(formId, storageKey) {
    var form = document.getElementById(formId);
    if (!form) return;

    var stored = null;
    try {
      stored = localStorage.getItem(storageKey);
      if (!stored) return;
      stored = JSON.parse(stored);
    } catch (e) {
      console.warn('localStorage parse failed:', e);
      return;
    }

    for (var key in stored) {
      if (!stored.hasOwnProperty(key)) continue;

      var input = form.querySelector('[name="' + key + '"]');
      if (!input) continue;

      if (input.type === 'checkbox') {
        input.checked = stored[key];
      } else {
        input.value = stored[key];
      }
    }
  }

  /**
   * initSettings()
   * Call loadSettings for profile-form and notifications-form on DOMContentLoaded
   * Password form: never save to localStorage
   * Each form's submit event: preventDefault, call saveSettings, call showToast()
   */
  function initSettings() {
    // Load existing settings on page load
    loadSettings('profile-form', 'flowsync-profile-settings');
    loadSettings('notifications-form', 'flowsync-notifications-settings');

    // Profile form submit
    var profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveSettings('profile-form', 'flowsync-profile-settings');
        window.showToast('Profile settings saved successfully', 'success');
      });
    }

    // Notifications form submit
    var notificationsForm = document.getElementById('notifications-form');
    if (notificationsForm) {
      notificationsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveSettings('notifications-form', 'flowsync-notifications-settings');
        window.showToast('Notification settings saved successfully', 'success');
      });
    }

    // Password form: never save to localStorage
    // Just prevent default and show success message
    var passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var newPassword = passwordForm.querySelector('[name="newPassword"]');
        var confirmPassword = passwordForm.querySelector('[name="confirmPassword"]');
        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
          window.showToast('Passwords do not match', 'error');
          return;
        }
        // Password changes would be sent to server in a real app
        window.showToast('Password changed successfully', 'success');
        passwordForm.reset();
      });
    }
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
  } else {
    initSettings();
  }

  // Expose functions globally if needed
  window.saveSettings = saveSettings;
  window.loadSettings = loadSettings;
  window.initSettings = initSettings;
})();

(function () {
  var searchInput = document.querySelector('input[placeholder="Search users..."]');
  if (!searchInput) return;

  var tbody = document.querySelector('.table-body');
  if (!tbody) return;

  var paginationSpan = document.querySelector('.flex.items-center.justify-between.px-4.py-3.border-t span');
  var noResultsRow = null;

  function removeNoResultsRow() {
    if (noResultsRow && noResultsRow.parentNode) {
      noResultsRow.parentNode.removeChild(noResultsRow);
      noResultsRow = null;
    }
  }

  function showNoResultsRow() {
    removeNoResultsRow();
    noResultsRow = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No users found';
    noResultsRow.appendChild(td);
    tbody.appendChild(noResultsRow);
  }

  function filterUsers() {
    removeNoResultsRow();

    var term = searchInput.value.toLowerCase();
    var rows = tbody.querySelectorAll('tr');
    var visibleCount = 0;
    var totalCount = rows.length;

    rows.forEach(function (row) {
      var matches = row.textContent.toLowerCase().indexOf(term) !== -1;
      if (matches) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (paginationSpan) {
      paginationSpan.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' users';
    }

    if (visibleCount === 0) {
      showNoResultsRow();
    }
  }

  searchInput.addEventListener('input', filterUsers);
})();
