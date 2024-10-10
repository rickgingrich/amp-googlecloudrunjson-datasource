import React, { ChangeEvent } from 'react';
import { InlineField, Input, Select, TextArea } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const actualQuery = { ...DEFAULT_QUERY, ...query };

  const onMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...actualQuery, Method: event.target.value });
  };

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...actualQuery, Path: event.target.value });
  };

  const onBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...actualQuery, Body: event.target.value });
  };

  const onQueryParamChange = (key: string, value: string) => {
    const newParams = { ...actualQuery.Params, [key]: value };
    onChange({ ...actualQuery, Params: newParams });
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
          value={actualQuery.Method}
          onChange={onMethodChange}
        />
      </InlineField>
      <InlineField label="Resource Path">
        <Input value={actualQuery.Path} onChange={onPathChange} />
      </InlineField>
      <InlineField label="Request Body">
        <TextArea value={actualQuery.Body} onChange={onBodyChange} />
      </InlineField>
      <InlineField label="Query Parameters">
        <div>
          {Object.entries(actualQuery.Params).map(([key, value]) => (
            <div key={key}>
              <Input value={key} onChange={(e) => onQueryParamChange(e.target.value, value)} />
              <Input value={value} onChange={(e) => onQueryParamChange(key, e.target.value)} />
            </div>
          ))}
          <button onClick={() => onQueryParamChange('', '')}>Add Query Param</button>
        </div>
      </InlineField>
      <button onClick={onRunQuery}>Run Query</button>
    </div>
  );
}