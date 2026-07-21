import { showToast } from './toast.js';
import { closeModal } from './user-modal.js';

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
// Guarded against double-invocation, same bug family as initSettings()
// in the settings IIFE below: if this ever runs twice on the same page
// (e.g. a future "refresh users" call), `usersInitialized` stops a
// second submit listener from stacking on #add-user-form. The old
// `form.removeEventListener('submit', null)` here looked like it
// guarded against that, but removeEventListener is a no-op unless you
// pass the exact same function reference that was added — passing
// null removes nothing. It was silently doing nothing.
var usersInitialized = false;
function initUsers() {
  var tableBody = document.querySelector('.table-body');
  if (!tableBody) return; // Not on users page
  if (usersInitialized) return;
  usersInitialized = true;

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
          closeModal();
          showToast('User added successfully', 'success');
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
