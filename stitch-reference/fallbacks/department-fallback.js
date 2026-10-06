(function () {
  var departments = [
    ['▱', 'Audit & Assurance', 'Sarah Jenkins, Partner', 'Standard Access', ['Client Data', 'Working Papers'], 'Sarah'],
    ['▤', 'Tax Services', 'Michael Chang, Director', 'Full Access', ['Client Data', 'Tax Filings', 'Billing'], 'Michael'],
    ['▥', 'Administrative', 'Elena Rostova, Ops Manager', 'Restricted', ['Client Data'], 'Elena']
  ];
  function card(department) {
    var capabilities = ['Client Data', 'Working Papers', 'Tax Filings', 'Billing'];
    return '<article class="permission-card"><h2><span class="permission-icon">' + department[0] + '</span>' + department[1] + '</h2><p class="department-head"><span class="head-avatar">' + department[5][0] + '</span>Head: ' + department[2] + '</p><label class="permission-label">Base Access Level</label><select><option>' + department[3] + '</option><option>Full Access</option><option>Standard Access</option><option>Restricted</option></select><div class="capability-divider"></div><label class="permission-label">Active Capabilities</label><div class="capabilities">' + capabilities.map(function (capability) { var active = department[4].indexOf(capability) !== -1; return '<button class="capability ' + (active ? 'active' : '') + '" data-active="' + active + '"><span>' + (active ? '✓' : '○') + '</span>' + capability + '</button>'; }).join('') + '</div></article>';
  }
  function render() {
    if (location.hash.slice(1) !== 'admin-department-permissions') return;
    document.body.innerHTML = '<div class="permissions-page"><aside class="permissions-sidebar"><div class="permissions-logo"><span>▧</span><strong>Heritage CPA</strong><small>Premier Accounting</small></div><nav><a href="#admin-dashboard">▦ &nbsp; Dashboard</a><a href="#admin-orders">▤ &nbsp; Orders</a><a href="#admin-clients">♙ &nbsp; Clients</a><a href="#admin-staff">♙ &nbsp; Staff</a><a class="active" href="#admin-settings">⚙ &nbsp; System Settings</a></nav><button class="permissions-report">▤ &nbsp; Generate Report</button></aside><main class="permissions-main"><header class="permissions-topbar"><strong>Heritage Modernism Portal</strong><div><input placeholder="⌕  Search..."><span>♧</span><span>?</span><span class="profile">A</span></div></header><section class="permissions-content"><h1>Department Permissions</h1><p class="permissions-subtitle">Configure and manage system access levels, visibility, and capabilities across<br> operational divisions.</p><div class="permissions-tabs"><a href="#admin-staff">Directory</a><a href="#admin-access-roles">Access Roles</a><a class="active" href="#admin-department-permissions">Department Permissions</a></div><div class="permission-grid">' + departments.map(card).join('') + '</div></section><div class="permissions-actions"><button>Discard Changes</button><button class="save">Save Permissions</button></div></main></div>';
    document.querySelectorAll('.capability').forEach(function (button) { button.addEventListener('click', function () { var active = button.dataset.active !== 'true'; button.dataset.active = active; button.classList.toggle('active', active); button.querySelector('span').textContent = active ? '✓' : '○'; }); });
  }
  window.setTimeout(render, 260); window.addEventListener('hashchange', function () { window.setTimeout(render, 100); });
}());
