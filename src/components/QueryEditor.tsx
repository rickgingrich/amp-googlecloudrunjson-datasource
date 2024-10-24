import React, { ChangeEvent, useCallback, useState } from 'react';
import { InlineField, Input, Select, Button, CodeEditor } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import debounce from 'lodash/debounce';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const [localQuery, setLocalQuery] = useState<MyQuery>(query);

  const debouncedOnChange = useCallback(
    debounce((newQuery: MyQuery) => {
      onChange(newQuery);
    }, 500),
    [onChange]
  );

  const updateQuery = useCallback((updater: (q: MyQuery) => Partial<MyQuery>) => {
    setLocalQuery((prevQuery) => {
      const newQuery = { ...prevQuery, ...updater(prevQuery) };
      debouncedOnChange(newQuery);
      return newQuery;
    });
  }, [debouncedOnChange]);

  const onMethodChange = (option: SelectableValue<string>) => {
    updateQuery((q) => ({ ...q, Method: option.value || 'GET' }));
  };

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateQuery((q) => ({ ...q, Path: event.target.value }));
  };

  const onBodyChange = (value: string) => {
    updateQuery((q) => ({ ...q, Body: value }));
  };

  const onQueryParamChange = (key: string, value: string) => {
    updateQuery((q) => ({
      ...q,
      Params: { ...q.Params, [key]: value },
    }));
  };

  const addQueryParam = () => {
    updateQuery((q) => ({
      ...q,
      Params: { ...q.Params, '': '' },
    }));
  };

  const handleRunQuery = () => {
    onChange(localQuery);
    onRunQuery();
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
            { label: 'PATCH', value: 'PATCH' },
          ]}
          value={localQuery.Method}
          onChange={onMethodChange}
          width={20}
        />
      </InlineField>
      <InlineField label="Resource Path" labelWidth={14}>
        <Input value={localQuery.Path || ''} onChange={onPathChange} width={40} />
      </InlineField>
      <InlineField label="Request Body" labelWidth={14} grow>
        <CodeEditor
          value={localQuery.Body || ''}
          language="json"
          showMiniMap={false}
          showLineNumbers={true}
          height="200px"
          width="100%"
          onBlur={(value) => onBodyChange(value)}
        />
      </InlineField>
      <InlineField label="Query Parameters" labelWidth={14}>
        <div>
          {Object.entries(localQuery.Params || {}).map(([key, value], index) => (
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
      <Button onClick={handleRunQuery} variant="primary">
        Run Query
      </Button>
    </div>
  );
}