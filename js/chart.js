export let revenueChart;

// Own IIFE keeps variables scoped.
// window.revenueChart is exposed intentionally
// so the dark mode toggle can call .update() later.
// =============================================

  // Bail if canvas doesn't exist — safe for other pages sharing main.js
  var canvas = document.getElementById('revenueChart');
  if (canvas) {
    var ctx = canvas.getContext('2d');

    // --- GRADIENT FILL ---
    // Built fresh on every render so it survives resize correctly.
    // chartArea gives exact pixel bounds of the plot (excludes axes).
    function createGradient(ctx, chartArea) {
      var gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, 'rgba(45, 91, 255, 0.25)');  // signal blue 25% at top
      gradient.addColorStop(1, 'rgba(45, 91, 255, 0)');     // transparent at bottom
      return gradient;
    }

    // --- MOCK DATA ---
    // Realistic curve: slight dip in Feb, recovery, acceleration into May.
    // May value matches the $48,294 shown in the Revenue KPI card.
    var labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    var revenue = [38200, 41500, 39800, 43100, 46700, 48294];

    // --- CHART INSTANCE ---
    revenueChart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: revenue,

          // Line
          borderColor: '#2D5BFF',
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
          pointBackgroundColor: '#2D5BFF',
          pointBorderColor: '#1D1B16',       // matches dark-mode card surface — creates a ring effect
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#2D5BFF',
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
            backgroundColor: '#1D1B16',
            borderColor: '#332F27',
            borderWidth: 1,
            titleColor: '#9C988C',
            bodyColor: '#EDEAE2',
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
              color: '#9C988C',
              font: { size: 12 }
            }
          },

          y: {
            border: { display: false },
            grid: {
              color: '#332F27',          // matches your --border token
              lineWidth: 1
            },
            ticks: {
              color: '#9C988C',
              font: { size: 12 },
              callback: function (value) {
                return '$' + (value / 1000).toFixed(0) + 'k'; // 38200 → $38k
              }
            }
          }
        }
      }
    });

  }
