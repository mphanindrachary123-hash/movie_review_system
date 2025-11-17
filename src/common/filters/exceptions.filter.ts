import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle known HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as Record<string, any>).message || message;
    } else if (exception instanceof Error) {
      // Non-HTTP errors
      message = exception.message;
    }

    // Log the error 
    console.error('Error:', exception);

    response.status(status).json({
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
    });
  }
}
