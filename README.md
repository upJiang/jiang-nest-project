考https://juejin.cn/post/7032079740982788132

```
npm i -g @nestjs/cli  // 全局安装Nest
nest new project-name  // 创建项目
yarn 下载依赖
yarn start:dev
```

常用命令：

- nest g [文件类型] [文件名] [文件目录]
  - nest g mo(模块)/co(控制器)/service (服务类) 文件名 文件目录，必须先创建模块，文件目录不写默认与文件名相同

使用 typeOrm

```
yarn add @nestjs/typeorm typeorm mysql2 @nestjs/config -S
```

- 增加 .env .env.prod 文件，写入数据库配置

- 增加根据env config 文件
  / config/env.ts

```
import * as fs from 'fs';
import * as path from 'path';
const isProd = process.env.NODE_ENV === 'production';

function parseEnv() {
  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;
  return { path: filePath };
}
export default parseEnv();

```

- 在 app.module.ts，添加imports配置

```
imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        entities: [], // 数据表实体
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
      }),
    }),
    PostsModule,
  ],
```

yarn start:dev 不报错则连接数据库成功

## 实现 CRUD

- 在 posts 文件夹上新建实体方法，posts.entity.ts

```
//    posts/posts.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('posts')
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: number; // 标记为主列，值自动生成

  @Column({ length: 50 })
  title: string;

  @Column({ length: 20 })
  author: string;

  @Column('text')
  content: string;

  @Column({ default: '' })
  thumb_url: string;

  @Column('tinyint')
  type: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
}

```
