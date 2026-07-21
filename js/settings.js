import { showToast } from './toast.js';

/**
 * saveSettings(formId, storageKey)
 * Query all inputs, selects, textareas inside formId by name attribute
 * For checkboxes read .checked (boolean), for everything else read .value
 * Build a plain object { name: value } and JSON.stringify into localStorage
 * Return the saved object
 */
export function saveSettings(formId, storageKey) {
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
export function loadSettings(formId, storageKey) {
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
 *
 * Guarded against double-invocation: this gets called both by this IIFE's
 * own init below AND by the top-level DOMContentLoaded handler (after the
 * toast component loads). Without the guard, every form on this page ends
 * up with duplicate submit listeners, which caused a real bug: submitting
 * the password form would fire two handlers, the second one reading
 * already-reset (empty) field values and re-showing validation errors
 * right after a successful submit.
 */
var settingsInitialized = false;
export function initSettings() {
  if (settingsInitialized) return;
  settingsInitialized = true;

  // Load existing settings on page load
  loadSettings('profile-form', 'flowsync-profile-settings');
  loadSettings('notifications-form', 'flowsync-notifications-settings');

  // Profile form submit
  var profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      saveSettings('profile-form', 'flowsync-profile-settings');
      showToast('Profile settings saved successfully', 'success');
    });
  }

  // Notifications form submit
  var notificationsForm = document.getElementById('notifications-form');
  if (notificationsForm) {
    notificationsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      saveSettings('notifications-form', 'flowsync-notifications-settings');
      showToast('Notification settings saved successfully', 'success');
    });
  }

  // Password form: never save to localStorage
  // Real client-side validation; still no backend, so no actual password change happens
  var passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    var currentPasswordInput = passwordForm.querySelector('[name="currentPassword"]');
    var newPasswordInput = passwordForm.querySelector('[name="newPassword"]');
    var confirmPasswordInput = passwordForm.querySelector('[name="confirmPassword"]');
    var MIN_PASSWORD_LENGTH = 8;

    function showPasswordFieldError(input, show) {
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

    function clearPasswordFormErrors() {
      showPasswordFieldError(currentPasswordInput, false);
      showPasswordFieldError(newPasswordInput, false);
      showPasswordFieldError(confirmPasswordInput, false);
    }

    // Clear a field's error as soon as the person edits it
    [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        showPasswordFieldError(input, false);
      });
    });

    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearPasswordFormErrors();

      var currentValue = currentPasswordInput ? currentPasswordInput.value : '';
      var newValue = newPasswordInput ? newPasswordInput.value : '';
      var confirmValue = confirmPasswordInput ? confirmPasswordInput.value : '';

      var currentValid = currentValue.length > 0;
      var newValid = newValue.length >= MIN_PASSWORD_LENGTH;
      var confirmValid = confirmValue.length > 0 && confirmValue === newValue;

      showPasswordFieldError(currentPasswordInput, !currentValid);
      showPasswordFieldError(newPasswordInput, !newValid);

      if (confirmPasswordInput) {
        var confirmErrorSpan = confirmPasswordInput.parentElement.querySelector('.form-error');
        if (confirmErrorSpan) {
          confirmErrorSpan.textContent = confirmValue.length === 0
            ? 'Please confirm your new password'
            : 'Passwords do not match';
        }
      }
      showPasswordFieldError(confirmPasswordInput, !confirmValid);

      if (!currentValid || !newValid || !confirmValid) {
        return;
      }

      // Password changes would be sent to server in a real app
      showToast('Password changed successfully', 'success');
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
