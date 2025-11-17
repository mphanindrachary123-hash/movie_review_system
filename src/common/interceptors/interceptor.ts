import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import * as http from 'http';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cxt = context.switchToHttp();
    const res = cxt.getResponse();
    return next.handle().pipe(map(data => {
      const statuscode = res.statusCode;
      const statusmessage = http.STATUS_CODES[statuscode] || 'UNKNOWN'
      return {
        statuscode,
        status: statusmessage,
        data,
        timestamp: new Date().toISOString(),
      }
    }));
  }
}