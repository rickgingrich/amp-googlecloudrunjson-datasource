import React, { ChangeEvent } from 'react';
import { InlineField, Input, Select, TextArea } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...query, Method: event.target.value });
  };

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, Path: event.target.value });
  };

  const onBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...query, Body: event.target.value });
  };

  const onQueryParamChange = (key: string, value: string) => {
    const newParams = { ...query.Params, [key]: value };
    onChange({ ...query, Params: newParams });
  };

  return (
    <div>
      <InlineField label="Request Type">
        <Select
          options={[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ]}
          value={query.Method}
          onChange={onMethodChange}
        />
      </InlineField>
      <InlineField label="Resource Path">
        <Input value={query.Path} onChange={onPathChange} />
      </InlineField>
      <InlineField label="Request Body">
        <TextArea value={query.Body} onChange={onBodyChange} />
      </InlineField>
      <InlineField label="Query Parameters">
        {Object.entries(query.Params).map(([key, value]) => (
          <div key={key}>
            <Input value={key} onChange={(e) => onQueryParamChange(e.target.value, value)} />
            <Input value={value} onChange={(e) => onQueryParamChange(key, e.target.value)} />
          </div>
        ))}
        <button onClick={() => onQueryParamChange('', '')}>Add Query Param</button>
      </InlineField>
      <button onClick={onRunQuery}>Run Query</button>
    </div>
  );
}