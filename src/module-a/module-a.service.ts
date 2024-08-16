import { Injectable } from '@nestjs/common';
import { RedisFifoQueueProducer } from 'src/utilities/redis/fifo-queue.producer';
import { ModuleARabbitMqConsumer } from './module-a.subscriber';

@Injectable()
export class ModuleAService {
  constructor(
    private readonly redisFifoQueueProducer: RedisFifoQueueProducer,
    private readonly moduleARabbitMqConsumer: ModuleARabbitMqConsumer,
  ) {
    setTimeout(() => {
      this.moduleARabbitMqConsumer.start();
    }, 1000);
  }

  public async increamentCounter(param: { key: string; ttl: number }) {
    this.redisFifoQueueProducer.sendMessage({
      service: 'module-a',
      action: 'increamentCounter',
      parameters: {
        key: param.key,
        ttl: param.ttl,
      },
    });
  }
}
