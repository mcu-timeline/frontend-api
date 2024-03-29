import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Config>);
  const port = configService.get('PORT', { infer: true });
  await app.listen(port, async () => {
    console.log(`Server started on ${await app.getUrl()}`);
  });
}
bootstrap();
