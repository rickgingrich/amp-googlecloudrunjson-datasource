import React, { ChangeEvent } from 'react';
import { InlineField, Input, FileUpload } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  const onServiceUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      serviceUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onServiceAccountUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const serviceAccountKey = e.target?.result as string;
      onOptionsChange({
        ...options,
        secureJsonData: {
          ...secureJsonData,
          serviceAccountKey,
        },
      });
    };
    if (event.target.files && event.target.files.length > 0) {
      reader.readAsText(event.target.files[0]);
    }
  };

  return (
    <>
      <InlineField label="Cloud Run Service URL" labelWidth={24} tooltip="The URL of your Cloud Run service">
        <Input
          onChange={onServiceUrlChange}
          value={jsonData.serviceUrl || ''}
          placeholder="https://your-service-name-hash-region.a.run.app"
          width={40}
        />
      </InlineField>
      <InlineField label="Service Account Key" labelWidth={24} tooltip="Upload your Google Cloud service account key JSON file">
        <FileUpload
          accept="application/json"
          onFileUpload={onServiceAccountUpload}
        >
          Upload service account key
        </FileUpload>
      </InlineField>
      {secureJsonFields.serviceAccountKey && (
        <div>Service account key is configured</div>
      )}
    </>
  );
}