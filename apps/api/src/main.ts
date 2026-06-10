import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

// CommonJS module: se importa con require (esModuleInterop desactivado), igual
// que `sharp` en upload.controller.ts.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression') as () => import('express').RequestHandler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Comprime respuestas (JSON de la API, SVG, etc.) con gzip. Las imágenes WebP
  // ya están comprimidas y compression las omite por content-type.
  app.use(compression());

  // Enable CORS for frontend apps
  app.enableCors();

  // Enable DTO validation globally
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
