import {
  DataSourceInstanceSettings,
  DataQueryRequest,
  DataQueryResponse,
  ScopedVars
} from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { Observable } from 'rxjs';
import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const templateSrv = getTemplateSrv();
    const queries = options.targets.map(target => {
      const query = { ...target };
      
      // Use ScopedVars when replacing variables
      const scopedVars: ScopedVars = { ...options.scopedVars };
      
      if (query.Body) {
        query.Body = templateSrv.replace(query.Body, scopedVars);
      }

      if (query.Path) {
        query.Path = templateSrv.replace(query.Path, scopedVars);
      }

      if (query.Params) {
        Object.keys(query.Params).forEach(key => {
          query.Params![key] = templateSrv.replace(query.Params![key], scopedVars);
        });
      }

      return query;
    });

    return super.query({ ...options, targets: queries });
  }
}