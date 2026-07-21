// ============================================================
//  FlowSync — Dark Mode Toggle
//  Handles: theme persistence, class toggling, chart re-theme
// ============================================================

import { revenueChart } from './chart.js';

  // ── 1. CHART THEME PALETTES ────────────────────────────────
  // Chart.js reads color values at draw time; CSS vars don't
  // propagate into canvas. We push explicit values on switch.

  var CHART_THEMES = {
    dark: {
      gridColor:            'rgba(51, 47, 39, 0.8)',    // --color-border, softened
      tickColor:            '#9C988C',                  // --color-muted
      legendColor:          '#EDEAE2',                  // --color-foreground
      datasetBorder:        '#5B7CFF',                  // --color-primary (dark)
      datasetPoint:         '#5B7CFF',
      datasetPointHover:    '#ffffff',
      tooltipBg:            '#1D1B16',                  // --color-surface
      tooltipText:          '#EDEAE2'
    },
    light: {
      gridColor:            'rgba(222, 218, 208, 0.8)', // --color-border, softened
      tickColor:            '#6B675E',                  // darker muted — readable on paper
      legendColor:          '#1A1A1A',
      datasetBorder:        '#2D5BFF',
      datasetPoint:         '#2D5BFF',
      datasetPointHover:    '#000000',
      tooltipBg:            '#FFFFFF',
      tooltipText:          '#1A1A1A'
    }
  };

  // ── 2. APPLY CHART THEME ───────────────────────────────────
  // Patches only color properties on the live Chart.js instance;
  // data and structure are untouched. Calls .update() to repaint.

  function applyChartTheme(mode) {
    if (!revenueChart) return;

    var t   = CHART_THEMES[mode];
    var opt = revenueChart.options;

    // Y-axis: grid lines + tick labels
    var yScale = opt.scales && opt.scales.y;
    if (yScale) {
      if (yScale.grid)  yScale.grid.color  = t.gridColor;
      if (yScale.ticks) yScale.ticks.color = t.tickColor;
    }

    // X-axis: tick labels (grid intentionally hidden per existing config)
    var xScale = opt.scales && opt.scales.x;
    if (xScale) {
      if (xScale.ticks) xScale.ticks.color = t.tickColor;
    }

    // Legend label color
    if (opt.plugins && opt.plugins.legend && opt.plugins.legend.labels) {
      opt.plugins.legend.labels.color = t.legendColor;
    }

    // Custom tooltip colors
    if (opt.plugins && opt.plugins.tooltip) {
      opt.plugins.tooltip.backgroundColor = t.tooltipBg;
      opt.plugins.tooltip.titleColor       = t.tooltipText;
      opt.plugins.tooltip.bodyColor        = t.tooltipText;
    }

    // Dataset: line colour + point colours
    var ds = revenueChart.data.datasets;
    if (ds && ds.length) {
      ds[0].borderColor           = t.datasetBorder;
      ds[0].pointBackgroundColor  = t.datasetPoint;
      ds[0].pointHoverBorderColor = t.datasetPointHover;
    }

    revenueChart.update();
  }

  // ── 3. APPLY FULL THEME ────────────────────────────────────
  // Flips the `dark` class on <html> (Tailwind v4 dark: selector)
  // then re-themes the chart and syncs the button icon.

  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyChartTheme(mode);
    syncToggleIcon(mode);
  }

  // ── 4. SYNC TOGGLE ICON ───────────────────────────────────
  // Moon shown in light mode (click → go dark).
  // Sun shown in dark mode  (click → go light).
  // HeroIcons outline style, w-5 h-5 to match the project.

  function syncToggleIcon(mode) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var moonSVG = [
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"',
      ' viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">',
      '<path stroke-linecap="round" stroke-linejoin="round"',
      ' d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>',
      '</svg>'
    ].join('');

    var sunSVG = [
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"',
      ' viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">',
      '<path stroke-linecap="round" stroke-linejoin="round"',
      ' d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707',
      'M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>',
      '</svg>'
    ].join('');

    btn.innerHTML = mode === 'dark' ? sunSVG : moonSVG;
    btn.setAttribute(
      'aria-label',
      mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // ── 5. TOGGLE HANDLER ─────────────────────────────────────
  // Reads current stored preference, flips it, persists, applies.

  function toggleTheme() {
    var current = localStorage.getItem('flowsync-theme') || 'light';
    var next    = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('flowsync-theme', next);
    applyTheme(next);
  }

  // ── 7. INIT ────────────────────────────────────────────────
  // Wire up click handler; sync icon to the theme already applied
  // by the anti-FOUC <head> script; kick off chart guard.

  function init() {
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    var saved = localStorage.getItem('flowsync-theme') || 'light';
    syncToggleIcon(saved);
    applyChartTheme(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
