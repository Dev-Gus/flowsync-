import { initSettings } from './settings.js';
import './sidebar.js';
import './users.js';
import './chart.js';
import './search.js';

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
  initSettings();
});
