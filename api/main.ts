import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🔄 Starting bootstrap...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ NestFactory created');

  // Configuration CORS pour le frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('RomAPI - Écosystème d\'API Commercial Cameroun')
    .setDescription(
      'API complète pour l\'écosystème RomAPI qui centralise les ressources et services locaux du Cameroun.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'ApiKeyAuth')
    .addServer('http://localhost:3000/v1', 'Development server')
    .addServer('https://staging-api.romapi.cm/v1', 'Staging server')
    .addServer('https://api.romapi.cm/v1', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Préfixe global pour les routes API
  app.setGlobalPrefix('api');

  const port = process.env.API_PORT || 3001;
  console.log(`🔄 Starting server on port ${port}...`);
  await app.listen(port);
  
    console.log(`🚀 RomAPI Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
