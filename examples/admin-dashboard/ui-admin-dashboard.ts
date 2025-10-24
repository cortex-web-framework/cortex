/**
 * Admin Dashboard Component
 * Complete admin interface with metrics, tabs, tables, and settings
 * NO external dependencies - pure TypeScript
 */

import * as utils from '../../src/utils/index.js';

interface Metric {
  title: string;
  value: string | number;
  icon: string;
  change: number; // percentage
  changeType: 'up' | 'down';
}

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

interface ActivityLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

// Sample data
const METRICS: Metric[] = [
  { title: 'Total Users', value: '1,247', icon: '👥', change: 12, changeType: 'up' },
  { title: 'Revenue', value: '$45,231', icon: '💰', change: 23, changeType: 'up' },
  { title: 'Orders', value: '523', icon: '📦', change: -5, changeType: 'down' },
  { title: 'Conversion', value: '3.8%', icon: '📈', change: 8, changeType: 'up' },
];

const USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joinDate: '2023-01-15', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', joinDate: '2023-02-20', status: 'active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', joinDate: '2023-03-10', status: 'pending' },
  { id: 4, name: 'David Brown', email: 'david@example.com', joinDate: '2023-04-05', status: 'active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', joinDate: '2023-05-12', status: 'inactive' },
];

const ACTIVITIES: ActivityLog[] = [
  {
    id: 1,
    action: 'User Registration',
    user: 'Frank Miller',
    timestamp: '2 minutes ago',
    details: 'New user registration completed',
  },
  {
    id: 2,
    action: 'Order Placed',
    user: 'Grace Wilson',
    timestamp: '15 minutes ago',
    details: 'Order #5234 with value $1,299.99',
  },
  {
    id: 3,
    action: 'Payment Processed',
    user: 'Henry Moore',
    timestamp: '1 hour ago',
    details: 'Payment received for subscription renewal',
  },
  {
    id: 4,
    action: 'Support Ticket Created',
    user: 'Iris Taylor',
    timestamp: '3 hours ago',
    details: 'Customer support ticket #4521 opened',
  },
  {
    id: 5,
    action: 'User Updated',
    user: 'Admin',
    timestamp: '5 hours ago',
    details: 'User profile information updated',
  },
];

export class AdminDashboard extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private currentTab: string = 'overview';
  private metrics: Metric[] = METRICS;
  private users: User[] = USERS;
  private activities: ActivityLog[] = ACTIVITIES;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .dashboard {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 0;
          min-height: 100vh;
        }

        .sidebar {
          background: white;
          border-right: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #667eea;
          margin: 0;
        }

        .nav-menu {
          padding: 1rem 0;
        }

        .nav-item {
          padding: 0.75rem 1.5rem;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font-size: 0.95rem;
        }

        .nav-item:hover {
          background: #f5f5f5;
          color: #333;
        }

        .nav-item.active {
          background: #e8f5e9;
          color: #4CAF50;
          border-left-color: #4CAF50;
          font-weight: 600;
        }

        .main-content {
          padding: 2rem;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .header-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 200px;
          font-size: 0.9rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .last-updated {
          color: #999;
          font-size: 0.85rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1rem;
        }

        .metric-icon {
          font-size: 2.5rem;
          display: flex;
          align-items: center;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .metric-title {
          color: #666;
          font-size: 0.85rem;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .metric-change {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .metric-change.up {
          color: #4CAF50;
        }

        .metric-change.down {
          color: #f44336;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        thead {
          background: #f5f5f5;
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        tbody tr:hover {
          background: #fafafa;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .status-badge.inactive {
          background: #ffccbc;
          color: #d84315;
        }

        .status-badge.pending {
          background: #fff9c4;
          color: #f57f17;
        }

        .activity-log {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .activity-entry {
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          align-items: center;
        }

        .activity-entry:last-child {
          border-bottom: none;
        }

        .activity-icon {
          font-size: 2rem;
        }

        .activity-info h4 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 0.95rem;
        }

        .activity-info p {
          margin: 0;
          color: #666;
          font-size: 0.85rem;
        }

        .activity-time {
          color: #999;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .settings-form {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          max-width: 500px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        button[type="submit"] {
          background: #4CAF50;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
        }

        button[type="submit"]:hover {
          background: #45a049;
        }

        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            height: auto;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .main-content {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-right {
            width: 100%;
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }
        }
      </style>

      <div class="dashboard" data-dashboard>
        <!-- Sidebar -->
        <div class="sidebar" data-sidebar>
          <div class="sidebar-header">
            <h1 class="sidebar-title">Admin</h1>
          </div>
          <nav class="nav-menu" data-nav-menu>
            <button type="button" class="nav-item active" data-nav-item="overview">📊 Overview</button>
            <button type="button" class="nav-item" data-nav-item="users">👥 Users</button>
            <button type="button" class="nav-item" data-nav-item="activity">📝 Activity</button>
            <button type="button" class="nav-item" data-nav-item="settings">⚙️ Settings</button>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Header -->
          <div class="header" data-dashboard-header>
            <h2 class="title">Dashboard</h2>
            <div class="header-right">
              <input type="text" class="search-input" data-search-input placeholder="Search..." />
              <div class="last-updated" data-last-updated>Updated just now</div>
            </div>
          </div>

          <!-- Overview Tab -->
          <div class="tab-content active" data-tab-content-overview>
            <div class="metrics-grid" data-metrics-grid></div>
          </div>

          <!-- Users Tab -->
          <div class="tab-content" data-tab-content-users>
            <table data-users-table>
              <thead>
                <tr>
                  <th data-user-header="name">Name</th>
                  <th data-user-header="email">Email</th>
                  <th data-user-header="joined">Joined</th>
                  <th data-user-header="status">Status</th>
                  <th data-user-header="actions">Actions</th>
                </tr>
              </thead>
              <tbody data-users-body></tbody>
            </table>
          </div>

          <!-- Activity Tab -->
          <div class="tab-content" data-tab-content-activity>
            <div class="activity-log" data-activity-log></div>
          </div>

          <!-- Settings Tab -->
          <div class="tab-content" data-tab-content-settings>
            <form class="settings-form" data-settings-form>
              <div class="form-group">
                <label>Theme:</label>
                <select data-setting-input name="theme">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notifications:</label>
                <select data-setting-input name="notifications">
                  <option value="all">All notifications</option>
                  <option value="important">Important only</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div class="form-group">
                <label>Timezone:</label>
                <select data-setting-input name="timezone">
                  <option value="utc">UTC</option>
                  <option value="est">Eastern</option>
                  <option value="cst">Central</option>
                  <option value="mst">Mountain</option>
                  <option value="pst">Pacific</option>
                </select>
              </div>
              <button type="submit">Save Settings</button>
            </form>
          </div>
        </div>
      </div>
    `;

    this.renderMetrics();
    this.renderUsers();
    this.renderActivity();
  }

  private renderMetrics() {
    const grid = this.shadowRoot.querySelector('[data-metrics-grid]') as HTMLElement;

    grid.innerHTML = this.metrics
      .map(
        (metric) => `
      <div class="metric-card" data-metric-card>
        <div class="metric-icon" data-metric-icon>${metric.icon}</div>
        <div class="metric-info">
          <div class="metric-title" data-metric-title>${metric.title}</div>
          <div class="metric-value" data-metric-value>${metric.value}</div>
          <div class="metric-change ${metric.changeType}" data-metric-change>
            ${metric.changeType === 'up' ? '▲' : '▼'} ${Math.abs(metric.change)}%
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  private renderUsers() {
    const tbody = this.shadowRoot.querySelector('[data-users-body]') as HTMLTableSectionElement;

    tbody.innerHTML = this.users
      .map(
        (user) => `
      <tr data-user-row>
        <td data-user-name>${user.name}</td>
        <td data-user-email>${user.email}</td>
        <td>${new Date(user.joinDate).toLocaleDateString()}</td>
        <td>
          <span class="status-badge ${user.status}" data-user-status>
            ${utils.capitalize(user.status)}
          </span>
        </td>
        <td>
          <button type="button" data-action="edit" style="background: #2196F3; color: white; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
            Edit
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  private renderActivity() {
    const log = this.shadowRoot.querySelector('[data-activity-log]') as HTMLElement;

    const icons: Record<string, string> = {
      'User Registration': '📝',
      'Order Placed': '📦',
      'Payment Processed': '💳',
      'Support Ticket Created': '🎫',
      'User Updated': '✏️',
    };

    log.innerHTML = this.activities
      .map(
        (activity) => `
      <div class="activity-entry" data-activity-entry>
        <div class="activity-icon">${icons[activity.action] || '📌'}</div>
        <div class="activity-info">
          <h4 data-activity-action>${activity.action}</h4>
          <p>${activity.details}</p>
          <p style="color: #999; font-size: 0.8rem;">By ${activity.user}</p>
        </div>
        <div class="activity-time" data-activity-time>${activity.timestamp}</div>
      </div>
    `
      )
      .join('');
  }

  private setupEventListeners() {
    const navItems = this.shadowRoot.querySelectorAll('[data-nav-item]');

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const tab = (item as HTMLElement).getAttribute('data-nav-item');
        this.switchTab(tab!);
      });
    });

    const form = this.shadowRoot.querySelector('[data-settings-form]') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Settings saved');
      });
    }
  }

  private switchTab(tab: string) {
    this.currentTab = tab;

    // Update active nav item
    const navItems = this.shadowRoot.querySelectorAll('[data-nav-item]');
    navItems.forEach((item) => {
      if ((item as HTMLElement).getAttribute('data-nav-item') === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update active tab content
    const tabContents = this.shadowRoot.querySelectorAll('[data-tab-content]');
    tabContents.forEach((content) => {
      if ((content as HTMLElement).getAttribute(`data-tab-content-${tab}`) !== null) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  // Public methods
  getMetrics() {
    return this.metrics;
  }

  getUsers() {
    return this.users;
  }

  getActivities() {
    return this.activities;
  }

  setMetrics(metrics: Metric[]) {
    this.metrics = metrics;
    this.renderMetrics();
  }

  setUsers(users: User[]) {
    this.users = users;
    this.renderUsers();
  }

  setActivities(activities: ActivityLog[]) {
    this.activities = activities;
    this.renderActivity();
  }
}

// Register the custom element
if (!customElements.get('ui-admin-dashboard')) {
  customElements.define('ui-admin-dashboard', AdminDashboard);
}
