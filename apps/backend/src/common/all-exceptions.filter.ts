import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global: regista os erros de forma consistente (5xx com stack, 4xx como
 * aviso) e devolve um corpo limpo — nunca expõe a stack ao cliente.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message: 'Erro interno do servidor' };

    const raw = typeof body === 'string' ? body : (body as { message?: unknown }).message;
    const msg = Array.isArray(raw) ? raw.join(', ') : String(raw ?? status);
    const line = `${req.method} ${req.originalUrl} ${status} — ${msg}`;

    if (status >= 500) {
      this.logger.error(line, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(line);
    }

    res
      .status(status)
      .json(typeof body === 'string' ? { statusCode: status, message: body } : body);
  }
}
