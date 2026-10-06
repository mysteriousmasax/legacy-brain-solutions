(function () {
  var roles = [
    ['Administrator', 'Full system access, user management, and global settings configuration.', '3 Users'],
    ['Partner', 'Unrestricted read access to all client data, financial reports, and strategic dashboards.', '12 Users'],
    ['Senior Auditor', 'Manage audit engagements, approve workpapers, and finalize reports.', '24 Users'],
    ['Associate', 'Standard access to assigned engagements, document upload, and task tracking.', '45 Users']
  ];
  function render() {
    if (location.hash.slice(1) !== 'admin-staff') return;
    var rows = roles.map(function (role) { return '<tr><td>' + role[0] + '</td><td>' + role[1] + '</td><td><span class="user-count">' + role[2] + '</span></td><td><button class="table-action" title="Edit">⌕</button>' + (role[0] === 'Administrator' ? '' : '<button class="table-action delete" title="Delete">♧</button>') + '</td></tr>'; }).join('');
    document.body.innerHTML = '<div class="role-page"><header class="role-header"><div class="role-brand">Legacy Admin</div><nav><a href="#admin-dashboard">Dashboard</a><a class="active" href="#admin-staff">Staff &amp; Permissions</a><a href="#admin-clients">Clients</a><a href="#admin-orders">Reports</a><a href="#admin-settings">Settings</a></nav><div class="role-portal">Admin Portal <span>♙</span></div></header><main class="role-content"><div class="role-title"><h1>Staff &amp; Permissions</h1><p>Manage firm personnel, professional credentials, and system access levels.</p></div><div class="role-tabs"><button>Directory</button><button class="active">Access Roles</button><button>Department Permissions</button></div><div class="role-toolbar"><input id="role-search" placeholder="⌕  Search roles..."><button class="filter-button">☷ &nbsp; Filter</button><button class="btn btn-primary">＋ Create New Role</button></div><div class="role-table-wrap"><table class="role-table"><thead><tr><th>Role Name</th><th>Description</th><th>Users<br>Assigned</th><th>Actions</th></tr></thead><tbody id="role-rows">' + rows + '</tbody></table><div class="role-pagination"><span id="role-count">Showing 1 to 4 of 12 roles</span><div><button>‹</button><button>›</button></div></div></div></main><footer class="role-footer"><div><h3>Legacy Admin</h3><small>© 2024 Legacy CPAs Tanzania. All rights reserved.</small></div><div><strong>Offices</strong><a href="#office">Dar es Salaam Office</a><a href="#office">Arusha Office</a></div><div><strong>Legal &amp; Resources</strong><a href="#news">Tax Resources</a><a href="#audit-assurance">Audit Guidelines</a><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a></div></footer></div>';
    document.getElementById('role-search').addEventListener('input', function () {
      var query = this.value.toLowerCase();
      var visible = roles.filter(function (role) { return role.join(' ').toLowerCase().indexOf(query) !== -1; });
      document.getElementById('role-rows').innerHTML = visible.map(function (role) { return '<tr><td>' + role[0] + '</td><td>' + role[1] + '</td><td><span class="user-count">' + role[2] + '</span></td><td><button class="table-action">⌕</button></td></tr>'; }).join('');
      document.getElementById('role-count').textContent = 'Showing 1 to ' + visible.length + ' of 12 roles';
    });
  }
  window.setTimeout(render, 180);
  window.addEventListener('hashchange', function () { window.setTimeout(render, 80); });
}());
