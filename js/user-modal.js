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

export function openModal() {
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

export function closeModal() {
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
