import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // дає можливість приймати запити з фронту
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // видаляє зайві поля при отриманні запитів
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
