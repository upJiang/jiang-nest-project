import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

function parseEnv() {
  const configService = new ConfigService();
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;
  return { path: filePath };
}
export default parseEnv();
