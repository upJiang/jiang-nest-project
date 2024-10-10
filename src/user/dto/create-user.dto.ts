import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
}
