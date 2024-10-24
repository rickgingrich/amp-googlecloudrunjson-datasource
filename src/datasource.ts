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
    console.log('Raw query options:', JSON.stringify(options, null, 2));

    const templateSrv = getTemplateSrv();
    const queries = options.targets.map(target => {
      const query = { ...target };
      
      // Use ScopedVars when replacing variables
      const scopedVars: ScopedVars = { ...options.scopedVars };
      
      if (query.Body) {
        console.log('Query body before processing:', query.Body);
        
        // Convert Body to string if it's not already
        let bodyStr = typeof query.Body === 'string' ? query.Body : JSON.stringify(query.Body);

        if (query.Body === '') {
          delete query.Body;
        }
        
        // Replace unescaped single quotes with double quotes
        bodyStr = bodyStr.replace(/(?<!\\)'/g, '"');
        
        // Perform variable replacement
        bodyStr = templateSrv.replace(bodyStr, scopedVars);
        
        // Parse the string back into an object
        try {
          query.Body = JSON.parse(bodyStr);
        } catch (error) {
          console.error('Error parsing query body:', error);
          console.log('Problematic body string:', bodyStr);
          // If parsing fails, keep the string version
          query.Body = bodyStr;
        }
        
        console.log('Query body after processing:', JSON.stringify(query.Body, null, 2));
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

    console.log('Processed queries:', JSON.stringify(queries, null, 2));

    return super.query({ ...options, targets: queries });
  }
}