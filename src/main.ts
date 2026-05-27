import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Establecer un prefijo global para las rutas REST, excluyendo GraphQL
  app.setGlobalPrefix('api', {
    exclude: ['graphql'],
  });

  // Habilitar validaciones globales en DTOs e Inputs de GraphQL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Habilitar CORS para permitir solicitudes del Frontend/Móvil
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(port);
  logger.log(
    `Subsistema Clínico corriendo en: http://localhost:${port}/graphql`,
  );
}
bootstrap();
