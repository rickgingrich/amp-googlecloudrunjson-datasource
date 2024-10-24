import { test, expect } from '@grafana/plugin-e2e';
import { MyDataSourceOptions, MySecureJsonData } from '../src/types';

test('Configuration editor should handle valid input', async ({
  createDataSourceConfigPage,
  page,
}) => {
  const configPage = await createDataSourceConfigPage({
    type: 'grafana-cloudrunjson-datasource',
  });

  // Fill in the configuration fields
  await page.getByLabel('Service URL').fill('https://example-service.run.app');
  await page.getByLabel('Health Check URL').fill('https://example-service.run.app/health');
  await page.getByLabel('Service Account Key').fill('{"type": "service_account", "project_id": "test-project"}');

  // Save and test the configuration
  await expect(configPage.saveAndTest()).toBeOK();
});

test('Configuration editor should handle invalid input', async ({
  createDataSourceConfigPage,
  page,
}) => {
  const configPage = await createDataSourceConfigPage({
    type: 'grafana-cloudrunjson-datasource',
  });

  // Fill in invalid configuration (missing required field)
  await page.getByLabel('Service URL').fill('https://example-service.run.app');
  // Intentionally leave Health Check URL empty
  await page.getByLabel('Service Account Key').fill('{"type": "service_account", "project_id": "test-project"}');

  // Attempt to save and test the configuration
  await expect(configPage.saveAndTest()).not.toBeOK();

  // Check for error message
  await expect(page.getByText('Health Check URL is required')).toBeVisible();
});
