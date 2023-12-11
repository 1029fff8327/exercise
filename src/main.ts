import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  const DEFAULT_PORT = 3000;
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle("Lesson api")
  .setDescription("This api for lesson")
  .setVersion("1.0")
  .addTag('API')
  .build()
  const  document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document)
  await app.listen(3000);
}

bootstrap();
