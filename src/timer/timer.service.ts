import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron'; // 从 cron 包导入 CronJob 类

/**
 * 定时器服务，用于管理定时任务。
 */
@Injectable()
export class TimerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  /**
   * 添加自定义 Cron 定时任务。
   *
   * @param name 任务名称，用于标识定时任务
   * @param cronExpression Cron 表达式，定义任务执行的时间和频率
   * @param callback 定时任务触发时调用的回调函数
   */
  addCronJob(name: string, cronExpression: string, callback: () => void) {
    const job = new CronJob(cronExpression, callback); // 使用 CronJob 来创建定时任务
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    return `定时任务 ${name} 已启动`;
  }

  /**
   * 停止指定的 Cron 定时任务。
   *
   * @param name 任务名称
   */
  stopCronJob(name: string) {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      return '定时任务已停止';
    } catch (error) {
      return '找不到该定时任务，或者已被停止';
    }
  }

  /**
   * 添加延时任务（Timeout）。
   *
   * @param name 任务名称
   * @param delay 延时的时间，单位为毫秒
   * @param callback 延时结束后调用的回调函数
   */
  addTimeout(name: string, delay: number, callback: () => void) {
    const timeout = setTimeout(callback, delay);
    this.schedulerRegistry.addTimeout(name, timeout);
    return '`延时任务 ${name} 已启动`';
  }

  /**
   * 停止指定的延时任务（Timeout）。
   *
   * @param name 任务名称
   */
  stopTimeout(name: string) {
    try {
      const timeout = this.schedulerRegistry.getTimeout(name);
      if (timeout) {
        clearTimeout(timeout);
        return `延时任务 ${name} 已停止`;
      } else {
        return `延时任务 ${name} 不存在`;
      }
    } catch (error) {
      return '找不到该延时任务，或者已被停止';
    }
  }

  /**
   * 添加间隔任务（Interval）。
   *
   * @param name 任务名称
   * @param interval 间隔时间，单位为毫秒
   * @param callback 间隔时间到达后调用的回调函数
   */
  addInterval(name: string, interval: number, callback: () => void) {
    const intervalId = setInterval(callback, interval);
    this.schedulerRegistry.addInterval(name, intervalId);
    return `间隔任务 ${name} 已启动`;
  }

  /**
   * 停止指定的间隔任务（Interval）。
   *
   * @param name 任务名称
   */
  stopInterval(name: string) {
    try {
      const intervalId = this.schedulerRegistry.getInterval(name);
      if (intervalId) {
        clearInterval(intervalId);
        return `间隔任务 ${name} 已停止`;
      } else {
        return `间隔任务 ${name} 不存在`;
      }
    } catch (error) {
      return '找不到该间隔任务，或者已被停止';
    }
  }
}
