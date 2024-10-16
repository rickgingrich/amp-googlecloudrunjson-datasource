import { DataSourceInstanceSettings, DataQueryResponse} from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { MyQuery, MyDataSourceOptions } from './types';
import { Observable, tap } from 'rxjs';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  query(request: any): Observable<DataQueryResponse> {
    console.log('Query method called with request:', request);
    return super.query(request).pipe(
      tap(
        (response: DataQueryResponse) => console.log('Query response:', response),
        (error: any) => console.error('Query error:', error)
      )
    );
  }

  testDatasource() {
    console.log('TestDatasource method called');
    return super.testDatasource();
  }
}