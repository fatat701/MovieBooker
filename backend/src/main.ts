import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation automatique des DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MovieBooker Auth API')
    .setDescription("Endpoints d'inscription et de connexion")
    .setVersion('1.0')
    .addBearerAuth() // pour permettre l’auth via JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`🚀 MovieBooker API is running at http://localhost:3000/api`);
}
bootstrap();
