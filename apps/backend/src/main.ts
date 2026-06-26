import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás de um reverse proxy (Traefik/Dokploy): confiar no 1.º hop para obter
  // o IP real do cliente (necessário para o rate limiting e cookies Secure).
  app.set('trust proxy', 1);

  // Cabeçalhos de segurança. CSP desligada (API JSON, não renderiza HTML) e CORP
  // em cross-origin para não interferir com o consumo da API pelo frontend.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cookieParser());
  // Uploads de fotos de progresso são enviados como data URL (base64) no corpo
  // JSON — acima do limite por defeito do Express (100kb).
  app.useBodyParser('json', { limit: '8mb' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Logging estruturado: regista pedidos e erros de forma consistente.
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS configurado para o domínio do frontend (PROJECT.md 12.4 — nunca "*" com cookies)
  const origin = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, '')) // tolera barra(s) no fim
    .filter(Boolean);
  app.enableCors({ origin, credentials: true });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`FitPlan API a correr em http://localhost:${port}/api`);
}

void bootstrap();
