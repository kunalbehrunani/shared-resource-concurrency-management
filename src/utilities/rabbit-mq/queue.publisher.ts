import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMqProducer {
  private channel: amqplib.Channel;

  constructor(private readonly configService: ConfigService) {
    const exchange = this.configService.get('rabbitMq.exchange');
    this.connect({ exchange });
  }

  private async connect(param: { exchange: string }) {
    const connection = await amqplib.connect('amqp://localhost');
    this.channel = await connection.createChannel();
    await this.channel.assertExchange(param.exchange, 'fanout', {
      durable: false,
    });
    console.log('[RABBIT MQ PRODUCER] Connection Established!');
    return;
  }

  public async sendMessage(param: {
    exchange: string;
    message: string;
  }): Promise<void> {
    await this.channel.publish(param.exchange, '', Buffer.from(param.message));
    console.log(
      '[RABBIT MQ PRODUCER] Message published to exchange: ',
      param.exchange,
    );
    console.log('[RABBIT MQ PRODUCER] Message: ', param.message);
    return;
  }
}
