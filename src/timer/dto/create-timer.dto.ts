import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTimerDto {
  @ApiProperty({ description: '定时器名称' })
  @IsNotEmpty({ message: '定时器名称必填' })
  name: string;
}
