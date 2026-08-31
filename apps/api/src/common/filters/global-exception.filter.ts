import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpResponse = isHttpException ? exception.getResponse() : null;
    const message =
      typeof httpResponse === 'object' && httpResponse !== null && 'message' in httpResponse
        ? (httpResponse as any).message
        : isHttpException
          ? exception.message
          : 'Internal server error';

    // Anything that reaches here as a non-HttpException is an unexpected bug —
    // log it loudly server-side (and to Sentry, wired in main.ts) even though the
    // client only ever sees a generic message for 500s.
        if (!isHttpException) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${(exception as Error)?.stack ?? exception}`,
      );
      if (process.env.SENTRY_DSN) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('@sentry/node').captureException(exception);
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: isHttpException ? exception.name : 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}