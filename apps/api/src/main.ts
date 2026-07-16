import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const webOrigin = process.env.WEB_URL ?? 'http://localhost:3000';
  app.enableCors({ origin: [webOrigin], credentials: true });
  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
