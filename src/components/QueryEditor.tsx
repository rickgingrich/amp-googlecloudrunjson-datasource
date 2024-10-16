import React, { ChangeEvent } from 'react';
import { InlineField, Input, Select, TextArea, Button } from '@grafana/ui';
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
    const newQuery = { ...actualQuery, Method: option.value || 'GET' };
    onChange(newQuery);
    console.log('Method changed:', newQuery);
  };

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuery = { ...actualQuery, Path: event.target.value };
    onChange(newQuery);
    console.log('Path changed:', newQuery);
  };

  const onBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = { ...actualQuery, Body: event.target.value };
    onChange(newQuery);
    console.log('Body changed:', newQuery);
  };

  const onQueryParamChange = (key: string, value: string) => {
    const newParams = { ...actualQuery.Params, [key]: value };
    const newQuery = { ...actualQuery, Params: newParams };
    onChange(newQuery);
    console.log('Query params changed:', newQuery);
  };

  const addQueryParam = () => {
    const newParams = { ...actualQuery.Params, '': '' };
    const newQuery = { ...actualQuery, Params: newParams };
    onChange(newQuery);
    console.log('Query param added:', newQuery);
  };

  const runQuery = () => {
    console.log('Run Query clicked. Current query:', actualQuery);
    onRunQuery();
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
        <Input value={actualQuery.Path} onChange={onPathChange} width={40} />
      </InlineField>
      <InlineField label="Request Body" labelWidth={14}>
        <TextArea value={actualQuery.Body} onChange={onBodyChange} rows={4} width={40} />
      </InlineField>
      <InlineField label="Query Parameters" labelWidth={14}>
        <div>
          {Object.entries(actualQuery.Params).map(([key, value], index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <Input
                value={key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQueryParamChange(e.target.value, value)}
                placeholder="Key"
                width={20}
              />
              <Input
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQueryParamChange(e.target.value, value)}
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
      <Button onClick={runQuery} variant="primary">
        Run Query
      </Button>
    </div>
  );
}