import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimerService } from './timer.service';
import { Public } from 'src/common/public.decorator';
import { CreateTimerDto } from './dto/create-timer.dto';

@ApiTags('定时器')
@Controller('timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  /**
   * 尝试定时任务
   * @param post
   */
  @Public()
  @ApiOperation({ summary: '开启定时任务' })
  @Post('/start-timer')
  async create(@Body() post: CreateTimerDto) {
    return this.timerService.addCronJob(post.name, '*/5 * * * * *', () => {
      console.log('定时任务已启动，每五秒执行一次');
    });
  }

  /**
   * 手动停止 Cron 定时任务
   * @param post
   */
  @Public()
  @ApiOperation({ summary: '手动停止 Cron 定时任务' })
  @Get('/stop-timer/:name')
  async stopTimer(@Param('name') name: string) {
    return this.timerService.stopCronJob(name);
  }
}
