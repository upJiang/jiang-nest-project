import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    // 配置 Redis 连接
    this.redisClient = new Redis({
      host: '129.211.13.9', // Redis 服务器地址
      port: 6379, // Redis 端口
      password: 'jiang', // 如果设置了密码，请输入
      db: 0, // 使用的 Redis 数据库，默认为 0
    });
  }

  // 通过 get 方法访问 Redis 中的键值
  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  // 通过 set 方法将值存入 Redis 中
  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  // 关闭 Redis 客户端连接
  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
