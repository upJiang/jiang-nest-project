import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { ScheduleModule } from '@nestjs/schedule'; // 导入调度模块
import { TimerService } from './timer.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TimerController],
  providers: [TimerService],
})
export class TimerModule {}
