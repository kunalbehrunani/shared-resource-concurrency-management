import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMqProducer } from '../rabbit-mq/queue.publisher';
import { RedisService } from './redis.service';

/**
 * @description A FIFO Queue is maintained in Redis to manage the order of update queries into the `main` redis server. FIFO Queue consumer constantly monitors the queue and checks for new messages at a constant time intervals. As soon as a new message is received, it performs the necessary action in the `main` redis server and prompts other applications via rabbit-mq broker.
 *
 * @param _pollingIntervalInMilliSeconds defines the time interval in milliseconds at which the redis fifo queue consumer constantly polls for the messages.
 *
 * @future_scope Even though the queue is presently maintaind in the same (a.k.a `main`) redis servier, in future scope, it can be maintained on a different redis server to add fault tolerance to our system.
 *
 * @future_scope A Dead letter queue (another instance of RedisFifoQueueConsumer) can be used to handle failed update redis queries.
 */
@Injectable()
export class RedisFifoQueueConsumer extends RedisService {
  private _queue: string;
  private _pollingIntervalInMilliSeconds: number;
  private _rabbitMqExchange: string;

  constructor(
    @Inject() configService: ConfigService,
    private readonly rabbitMqProducer: RabbitMqProducer,
  ) {
    super(configService);

    this._queue = configService.get('redis.queue');
    this._pollingIntervalInMilliSeconds = configService.get(
      'redis.pollingIntervalInMilliSeconds',
    );
    this._rabbitMqExchange = configService.get('rabbitMq.exchange');
  }

  private async _consumeMessage(): Promise<void> {
    const message = await this.popMessageFromQueue({ queue: this._queue });

    if (!message) {
      return;
    }

    let service: string;
    let action: string;
    let parameters: { key: string; ttl: number };

    try {
      ({ service, action, parameters } = JSON.parse(message));
    } catch (err) {}

    if (
      !(service && action && parameters && parameters.key && parameters.ttl)
    ) {
      console.log('[REDIS FIFO QUEUE CONSUMER] Invalid Message Found!');
      console.log('[REDIS FIFO QUEUE CONSUMER] Message: ', message);
      return;
    }

    if (action === 'increamentCounter') {
      const data = await this.increamentCounter({
        key: parameters.key,
        ttl: parameters.ttl,
      });

      console.log(
        `[INCREAMENT COUNTER] Key: ${parameters.key} | Updated Value: ${data}`,
      );

      this.rabbitMqProducer.sendMessage({
        exchange: this._rabbitMqExchange,
        message: `[INCREAMENT COUNTER] Key: ${parameters.key} | Updated Value: ${data}`,
      });
    } else {
      console.log(
        '[REDIS FIFO QUEUE CONSUMER] Invalid Message Found! Action Value is incorrect',
      );
      console.log('[REDIS FIFO QUEUE CONSUMER] Action: ', action);
    }

    return;
  }

  public async start() {
    console.log('[REDIS FIFO QUEUE CONSUMER] Listening to messages...');
    setInterval(() => {
      this._consumeMessage();
    }, this._pollingIntervalInMilliSeconds);
  }
}
