import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/interceptor';
import 'dotenv/config';
import { AllExceptionsFilter } from './common/filters/exceptions.filter';
import { Logger } from '@nestjs/common';
import { PORT_MESSAGES } from './common/constants/messages';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const logger = new Logger('Bootstrap');
  const {PORT}=process.env;
  if(!PORT){
    throw new Error(PORT_MESSAGES.NOT_DEFINED);
  }
  await app.listen(PORT);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
