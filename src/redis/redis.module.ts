import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // 导出 RedisService 以供其他模块使用
})
export class RedisModule {}
