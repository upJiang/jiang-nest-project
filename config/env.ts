import * as fs from 'fs';
import * as path from 'path';

function parseEnv() {
  console.log('当前环境NODE_ENV', process);
  const isProd = process.env.NODE_ENV === 'production';

  console.log('当前环境NODE_ENV', process.env.NODE_ENV);

  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;
  return { path: filePath };
}
export default parseEnv();
