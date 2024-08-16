import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * @description A FIFO Queue is maintained in Redis to manage the order of update queries into the `main` redis server. All the queries to the redis server go via this redis fifo queue producer. This class has only one public method that is used to push message to the redis fifo queue. The consumer then receives the messages and performs the necessary updates atomically.
 *
 * @future_scope Even though the queue is presently maintaind in the same (a.k.a `main`) redis servier, in future scope, it can be maintained on a different redis server to add fault tolerance to our system.
 */
@Injectable()
export class RedisFifoQueueProducer extends RedisService {
  private _queue: string;

  constructor(@Inject() configService: ConfigService) {
    super(configService);
    this._queue = configService.get('redis.queue');
  }

  public async sendMessage(param: {
    service: string;
    action: string;
    parameters: {
      key: string;
      ttl: number;
    };
  }): Promise<void> {
    await this.pushMessageToQueue({
      queue: this._queue,
      message: JSON.stringify({ ...param }),
    });

    console.log('[REDIS FIFO QUEUE PRODUCER] Message pushed to Queue!');
    console.log(
      '[REDIS FIFO QUEUE PRODUCER] Message: ',
      JSON.stringify({ ...param }),
    );

    return;
  }
}
