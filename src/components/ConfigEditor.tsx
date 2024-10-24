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

  const onServiceAccountKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...secureJsonData,
        serviceAccountKey: event.target.value,
      },
    });
  };

  return (
    <div className="gf-form-group">
      <InlineField label="Service URL" labelWidth={20}>
        <Input
          onChange={onServiceUrlChange}
          value={options.jsonData.serviceUrl || ''}
          placeholder="https://your-cloud-run-service-url.com"
          width={40}
        />
      </InlineField>
      <InlineField label="Health Check URL" labelWidth={20}>
        <Input
          onChange={onHealthCheckUrlChange}
          value={options.jsonData.healthCheckUrl || ''}
          placeholder="https://your-cloud-run-service-url.com/health"
          width={40}
        />
      </InlineField>
      <InlineField label="Service Account Key" labelWidth={20}>
        <SecretInput
          isConfigured={(options.secureJsonFields && options.secureJsonFields.serviceAccountKey) || false}
          value={secureJsonData.serviceAccountKey || ''}
          placeholder="Paste your service account key JSON here"
          width={40}
          onReset={() => {
            onOptionsChange({
              ...options,
              secureJsonFields: {
                ...options.secureJsonFields,
                serviceAccountKey: false,
              },
              secureJsonData: {
                ...options.secureJsonData,
                serviceAccountKey: '',
              },
            });
          }}
          onChange={onServiceAccountKeyChange}
        />
      </InlineField>
    </div>
  );
}
