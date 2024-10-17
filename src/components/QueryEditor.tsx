import React, { ChangeEvent } from 'react';
import { InlineField, Input, Select, Button, CodeEditor } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const actualQuery = { ...DEFAULT_QUERY, ...query };

  const methodOptions: Array<SelectableValue<string>> = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
  ];

  const onMethodChange = (option: SelectableValue<string>) => {
    onChange({ ...actualQuery, Method: option.value || 'GET' });
  };

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...actualQuery, Path: event.target.value });
  };

  const onBodyChange = (value: string) => {
    onChange({ ...actualQuery, Body: value });
  };

  const onQueryParamChange = (key: string, value: string) => {
    const newParams = { ...actualQuery.Params, [key]: value };
    onChange({ ...actualQuery, Params: newParams });
  };

  const addQueryParam = () => {
    const newParams = { ...actualQuery.Params, '': '' };
    onChange({ ...actualQuery, Params: newParams });
  };

  return (
    <div>
      <InlineField label="Request Type">
        <Select
          options={methodOptions}
          value={methodOptions.find(option => option.value === actualQuery.Method)}
          onChange={onMethodChange}
          width={20}
        />
      </InlineField>
      <InlineField label="Resource Path" labelWidth={14}>
        <Input value={actualQuery.Path || ''} onChange={onPathChange} width={40} />
      </InlineField>
      <InlineField label="Request Body" labelWidth={14} grow>
        <CodeEditor
          value={actualQuery.Body || ''}
          language="json"
          showMiniMap={false}
          showLineNumbers={true}
          height="200px"
          width="100%"
          onBlur={onBodyChange}
        />
      </InlineField>
      <InlineField label="Query Parameters" labelWidth={14}>
        <div>
          {Object.entries(actualQuery.Params || {}).map(([key, value], index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <Input
                value={key}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryParamChange(e.target.value, value)}
                placeholder="Key"
                width={20}
              />
              <Input
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryParamChange(key, e.target.value)}
                placeholder="Value"
                width={20}
              />
            </div>
          ))}
          <Button onClick={addQueryParam} variant="secondary" size="sm">
            Add Query Param
          </Button>
        </div>
      </InlineField>
      <Button onClick={onRunQuery} variant="primary">
        Run Query
      </Button>
    </div>
  );
}