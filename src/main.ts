import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });


   app.useStaticAssets(join(__dirname, '..', 'public', 'test-front'), {
    prefix: '/',
  });

 app.enableCors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  exposedHeaders: ['Authorization']
});

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
