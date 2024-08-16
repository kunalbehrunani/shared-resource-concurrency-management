import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class ModuleBRabbitMqConsumer {
  private channel: amqplib.Channel;
  private exchange: string;
  private queue: string;

  constructor(private readonly configService: ConfigService) {
    this.exchange = this.configService.get('rabbitMq.exchange');
    this.queue = this.configService.get('rabbitMq.queues.moduleB');
    this.connect();
  }

  private async connect() {
    const connection = await amqplib.connect('amqp://localhost');
    this.channel = await connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'fanout', {
      durable: false,
    });
    await this.channel.assertQueue(this.queue, { exclusive: true });
    await this.channel.bindQueue(this.queue, this.exchange, '');
    console.log('[MODULE B RABBIT MQ SUBSCRIBER] Connection Established!');
    return;
  }

  public async start() {
    await this.channel.consume(this.queue, (message) => {
      console.log('[MODULE B] New Message Received!');
      console.log(
        '[MODULE B] Message: ',
        Buffer.from(message.content).toString(),
      );
      return;
    });
  }
}
