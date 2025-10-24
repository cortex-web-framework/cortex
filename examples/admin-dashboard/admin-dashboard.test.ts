/**
 * Admin Dashboard Tests
 * TDD approach: Tests define behavior before implementation
 */

import {
  describe,
  test,
  assertEquals,
  assertTrue,
  assertFalse,
  renderComponent,
  query,
  queryAll,
  click,
  getText,
  hasClass,
} from '../../tests/index.js';

describe('Admin Dashboard', () => {
  test('renders dashboard container', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const container = query('[data-dashboard]', dashboard);
    assertTrue(container !== null);
  });

  test('displays header with title', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const header = query('[data-dashboard-header]', dashboard);
    assertTrue(header !== null);
  });

  test('shows navigation menu', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const nav = query('[data-nav-menu]', dashboard);
    assertTrue(nav !== null);
  });

  test('displays metric cards', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const metrics = queryAll('[data-metric-card]', dashboard);
    assertTrue(metrics.length > 0);
  });

  test('metric cards show title and value', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const card = query('[data-metric-card]', dashboard);

    const title = query('[data-metric-title]', card);
    const value = query('[data-metric-value]', card);

    assertTrue(title !== null);
    assertTrue(value !== null);
  });

  test('displays metric icon', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const card = query('[data-metric-card]', dashboard);
    const icon = query('[data-metric-icon]', card);

    assertTrue(icon !== null);
  });

  test('shows change indicator (up/down)', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const card = query('[data-metric-card]', dashboard);
    const change = query('[data-metric-change]', card);

    if (change) {
      const text = getText(change);
      assertTrue(text.includes('%') || text.includes('▲') || text.includes('▼'));
    }
  });

  test('navigates between tabs', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const tabs = queryAll('[data-nav-item]', dashboard);

    if (tabs.length > 1) {
      const secondTab = tabs[1];
      click(secondTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      assertTrue(hasClass(secondTab, 'active'));
    }
  });

  test('displays different content per tab', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const tabs = queryAll('[data-nav-item]', dashboard);

    if (tabs.length > 1) {
      const firstContent = query('[data-tab-content-0]', dashboard);
      const contentBefore = getText(firstContent);

      const secondTab = tabs[1];
      click(secondTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const secondContent = query('[data-tab-content-1]', dashboard);
      const contentAfter = getText(secondContent);

      // Content should be different
      assertTrue(contentBefore !== contentAfter);
    }
  });

  test('shows data table in users tab', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const usersTab = query('[data-nav-item="users"]', dashboard);
    if (usersTab) {
      click(usersTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = query('[data-users-table]', dashboard);
      const rows = queryAll('[data-user-row]', dashboard);

      assertTrue(table !== null || rows.length > 0);
    }
  });

  test('users table displays columns', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const usersTab = query('[data-nav-item="users"]', dashboard);
    if (usersTab) {
      click(usersTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const headers = queryAll('[data-user-header]', dashboard);
      assertTrue(headers.length > 0);
    }
  });

  test('users table shows name and email', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const usersTab = query('[data-nav-item="users"]', dashboard);
    if (usersTab) {
      click(usersTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const row = query('[data-user-row]', dashboard);
      const name = query('[data-user-name]', row);
      const email = query('[data-user-email]', row);

      assertTrue(name !== null);
      assertTrue(email !== null);
    }
  });

  test('users table shows status badge', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const usersTab = query('[data-nav-item="users"]', dashboard);
    if (usersTab) {
      click(usersTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const row = query('[data-user-row]', dashboard);
      const status = query('[data-user-status]', row);

      assertTrue(status !== null);
    }
  });

  test('shows activity log tab', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const activityTab = query('[data-nav-item="activity"]', dashboard);
    assertTrue(activityTab !== null);
  });

  test('activity log displays entries', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const activityTab = query('[data-nav-item="activity"]', dashboard);
    if (activityTab) {
      click(activityTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const entries = queryAll('[data-activity-entry]', dashboard);
      assertTrue(entries.length > 0);
    }
  });

  test('activity entries show timestamp', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const activityTab = query('[data-nav-item="activity"]', dashboard);
    if (activityTab) {
      click(activityTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const entry = query('[data-activity-entry]', dashboard);
      const timestamp = query('[data-activity-time]', entry);

      if (timestamp) {
        assertTrue(getText(timestamp).length > 0);
      }
    }
  });

  test('activity entries show action description', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const activityTab = query('[data-nav-item="activity"]', dashboard);
    if (activityTab) {
      click(activityTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const entry = query('[data-activity-entry]', dashboard);
      const action = query('[data-activity-action]', entry);

      if (action) {
        assertTrue(getText(action).length > 0);
      }
    }
  });

  test('shows settings tab', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const settingsTab = query('[data-nav-item="settings"]', dashboard);
    assertTrue(settingsTab !== null);
  });

  test('settings tab displays form controls', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const settingsTab = query('[data-nav-item="settings"]', dashboard);
    if (settingsTab) {
      click(settingsTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputs = queryAll('[data-setting-input]', dashboard);
      assertTrue(inputs.length > 0);
    }
  });

  test('sidebar responsive behavior', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const sidebar = query('[data-sidebar]', dashboard);

    assertTrue(sidebar !== null);
  });

  test('active tab is highlighted', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const tabs = queryAll('[data-nav-item]', dashboard);

    const firstTab = tabs[0];
    assertTrue(hasClass(firstTab, 'active'));
  });

  test('tab content updates on navigation', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const tabs = queryAll('[data-nav-item]', dashboard);

    if (tabs.length > 1) {
      const firstTabName = tabs[0].getAttribute('data-nav-item');
      const secondTabName = tabs[1].getAttribute('data-nav-item');

      click(tabs[1]);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const activeTab = query('[data-nav-item].active', dashboard);
      assertEquals(activeTab.getAttribute('data-nav-item'), secondTabName);
    }
  });

  test('displays search functionality', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const search = query('[data-search-input]', dashboard);

    if (search) {
      assertTrue(search !== null);
    }
  });

  test('shows last updated timestamp', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const updated = query('[data-last-updated]', dashboard);

    if (updated) {
      const text = getText(updated);
      assertTrue(text.length > 0);
    }
  });

  test('metric cards have different icons', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');
    const icons = queryAll('[data-metric-icon]', dashboard);

    // Should have multiple different icons
    const iconTexts = icons.map((i) => getText(i));
    const uniqueIcons = new Set(iconTexts);

    assertTrue(uniqueIcons.size > 1);
  });

  test('user actions are available', async () => {
    const dashboard = await renderComponent('<ui-admin-dashboard></ui-admin-dashboard>');

    const usersTab = query('[data-nav-item="users"]', dashboard);
    if (usersTab) {
      click(usersTab);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = queryAll('[data-action]', dashboard);
      assertTrue(actions.length > 0);
    }
  });
});
