import { Injectable } from '@nestjs/common';
import { RedisFifoQueueProducer } from 'src/utilities/redis/fifo-queue.producer';
import { ModuleBRabbitMqConsumer } from './module-b.subscriber';

@Injectable()
export class ModuleBService {
  constructor(
    private readonly redisFifoQueueProducer: RedisFifoQueueProducer,
    private readonly moduleBRabbitMqConsumer: ModuleBRabbitMqConsumer,
  ) {
    setTimeout(() => {
      this.moduleBRabbitMqConsumer.start();
    }, 1000);
  }

  public async increamentCounter(param: { key: string; ttl: number }) {
    this.redisFifoQueueProducer.sendMessage({
      service: 'module-b',
      action: 'increamentCounter',
      parameters: {
        key: param.key,
        ttl: param.ttl,
      },
    });
  }
}
