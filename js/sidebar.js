import { showToast } from './toast.js';

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
  showToast('Signed out successfully', 'success');
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
