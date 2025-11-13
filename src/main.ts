// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');
  // app.enableCors();

  await app.listen(3001);

  const serverUrl = await app.getUrl();
  console.log(`🚀 Application is running on: ${serverUrl}`);
  console.log(`✅ API is available at: ${serverUrl}/api`);
  console.log(`👑 AdminJS is available at: ${serverUrl}/admin`);
}

void bootstrap();
