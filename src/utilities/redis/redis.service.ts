import { BadGatewayException, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private _client: Redis;
  private _host: string = '127.0.0.1';
  private _port: number = 6379;

  constructor() {
    this._client = new Redis({
      host: this._host,
      port: this._port,
      retryStrategy: function (times) {
        if (times >= 1) {
          throw new BadGatewayException(
            '[SYSTEM ERROR] Unable to connect to Redis',
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
}
