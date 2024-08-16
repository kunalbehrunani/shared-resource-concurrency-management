import { Inject, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisFifoQueueConsumer } from './utilities/redis/fifo-queue.consumer';
import { RedisFifoQueueProducer } from './utilities/redis/fifo-queue.producer';

const defaultConfig = () => {
  const path = `./config/default.json`;
  const data = fs.readFileSync(path, { encoding: 'utf-8' });
  return data ? JSON.parse(data) : {};
};

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      cache: false,
      load: [defaultConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RedisFifoQueueProducer, RedisFifoQueueConsumer],
})
export class AppModule {
  constructor(@Inject() redisFifoQueueConsumer: RedisFifoQueueConsumer) {
    redisFifoQueueConsumer.start();
  }
}
