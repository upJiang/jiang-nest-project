import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NV_Users } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NV_Users) private readonly user: Repository<NV_Users>,
  ) {}

  // 注册
  signup(signupData: CreateAuthDto) {
    console.log(signupData);
    return '注册成功';
  }

  // 登录
  login(loginData: CreateAuthDto) {
    console.log(loginData);
    return '登录成功';
  }
}
