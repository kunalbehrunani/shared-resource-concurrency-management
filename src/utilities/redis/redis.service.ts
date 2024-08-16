import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private _client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis');
    this._client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: function (times) {
        if (times >= 1) {
          throw new BadGatewayException(
            '[SYSTEM ERROR] | REDIS | Unable to connect to Redis',
            {
              cause:
                'Please ensure redis server - ' + this._host + ' is active',
              description:
                'Unable to establish connection to redis server: ' + this._host,
            },
          );
        }
        return 0;
      },
    });
  }

  protected async increamentCounter(param: {
    key: string;
    ttl?: number;
  }): Promise<number> {
    const data = await this._client.incr(param.key);
    if (param.ttl && data === 1) {
      await this._client.expire(param.key, param.ttl);
    }
    return data;
  }

  protected async pushMessageToQueue(param: {
    queue: string;
    message: string;
  }): Promise<void> {
    await this._client.lpush(param.queue, param.message);
    return;
  }

  protected async popMessageFromQueue(param: {
    queue: string;
  }): Promise<string> {
    let data: string;

    try {
      data = await this._client.rpop(param.queue);
    } catch (err) {}

    return data;
  }
}
