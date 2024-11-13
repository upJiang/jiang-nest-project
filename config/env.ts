import * as fs from 'fs';
import * as path from 'path';

// 我发现打包到 docker 后是没有NODE_ENV这个变量的，可能需要自己增加，这边先反着判断
const isProd = process.env.NODE_ENV !== 'test';

function parseEnv() {
  const localEnv = path.resolve('.env.test');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;
  return { path: filePath };
}
export default parseEnv();
