import { Inject, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModuleAService } from './module-a/module-a.service';
import { ModuleARabbitMqConsumer } from './module-a/module-a.subscriber';
import { ModuleBService } from './module-b/module-b.service';
import { ModuleBRabbitMqConsumer } from './module-b/module-b.subscriber';
import { RabbitMqProducer } from './utilities/rabbit-mq/queue.publisher';
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
  providers: [
    AppService,
    RedisFifoQueueProducer,
    RedisFifoQueueConsumer,
    RabbitMqProducer,
    ModuleAService,
    ModuleARabbitMqConsumer,
    ModuleBService,
    ModuleBRabbitMqConsumer,
  ],
})
export class AppModule {
  constructor(
    @Inject() redisFifoQueueConsumer: RedisFifoQueueConsumer,
    private readonly moduleAService: ModuleAService,
  ) {
    redisFifoQueueConsumer.start();

    setTimeout(() => {
      this.moduleAService.increamentCounter({
        key: 'test',
        ttl: 100,
      });
    }, 2000);
  }
}
