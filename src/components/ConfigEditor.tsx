import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onServiceUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      serviceUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onHealthCheckUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      healthCheckUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="Service URL" labelWidth={12}>
        <Input
          onChange={onServiceUrlChange}
          value={options.jsonData.serviceUrl || ''}
          placeholder="https://your-cloud-run-service-url.com"
          width={40}
        />
      </InlineField>
      <InlineField label="Health Check URL" labelWidth={12}>
        <Input
          onChange={onHealthCheckUrlChange}
          value={options.jsonData.healthCheckUrl || ''}
          placeholder="https://your-cloud-run-service-url.com/health"
          width={40}
        />
      </InlineField>
      {/* ... (rest of the JSX remains the same) */}
    </div>
  );
}