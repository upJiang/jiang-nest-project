import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名必填' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码必填' })
  password: string;
}
