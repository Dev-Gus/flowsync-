var searchInput = document.querySelector('input[placeholder="Search users..."]');
var tbody = document.querySelector('.table-body');

if (searchInput && tbody) {
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
}
