import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api'); // 设置全局路由前缀
  await app.listen(3000);
}
bootstrap();
