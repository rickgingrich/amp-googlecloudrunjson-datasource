import { DataSourceJsonData, DataQuery } from '@grafana/data';

export interface MyQuery extends DataQuery {
  Method: string;
  Path: string;
  Body: string;
  Params: { [key: string]: string };
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  Method: 'GET',
  Path: '/',
  Body: '',
  Params: {},
};

export interface MyDataSourceOptions extends DataSourceJsonData {
  serviceUrl: string;
}

export interface MySecureJsonData {
  serviceAccountKey?: string;
}