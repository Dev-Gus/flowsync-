export function showToast(message, type) {
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
