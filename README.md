参考 https://juejin.cn/post/7032079740982788132，node 版本尽量高，20+

```
npm i -g @nestjs/cli  // 全局安装Nest
nest new project-name  // 创建项目
yarn 下载依赖
yarn start:dev
```

打开 http://127.0.0.1:3000/
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

nest 可以使用的命令：

- nest new 快速创建项目
- nest generate 快速生成各种代码
- nest build 使用 tsc 或者 webpack 构建代码
- nest start 启动开发服务，支持 watch 和调试
- nest info 打印 node、npm、nest 包的依赖版本

常用命令：

\- nest g [文件类型] [文件名] [文件目录]

\- nest g mo(模块)/co(控制器)/service (服务类) 文件名 文件目录，必须先创建模块，文件目录不写默认与文件名相同

## 实现 CRUDf

- nest go mo posts 创建模块
- nest co mo posts 创建控制器
- nest service posts 创建服务类

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

- 编写文件控制器内容，并把创建的实体类在，app.module.ts 中导入，导入后执行就会自动创建相应表

## 接口统一格式

```
nest g filter core/filter/http-exception
```

会自动生成对应文件，编写 http-exception.filter.ts

```
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse(); // 获取请求上下文中的 response对象
    const status = exception.getStatus(); // 获取异常状态码
    const exceptionResponse: any = exception.getResponse();
    let validMessage = '';

    for (let key in exception) {
      console.log(key, exception[key]);
    }
    if (typeof exceptionResponse === 'object') {
      validMessage =
        typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : exceptionResponse.message[0];
    }
    const message = exception.message
      ? exception.message
      : `${status >= 500 ? 'Service Error' : 'Client Error'}`;
    const errorResponse = {
      data: {},
      message: validMessage || message,
      code: -1,
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}

```

最后需要在main.ts中全局注册

```
...
import { HttpExceptionFilter } from './core/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  ...
   // 注册全局错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(9080);
}
bootstrap();

```

- 拦截成功的返回数据

创建一个拦截器：

```
nest g interceptor core/interceptor/transform

```

拦截器代码实现：

```
import {CallHandler, ExecutionContext, Injectable,NestInterceptor,} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          msg: '请求成功',
        };
      }),
    );
  }
}
```

最后和过滤器一样，在main.ts中全局注册：

```
...
import { TransformInterceptor } from './core/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  ...
  // 全局注册拦截器
 app.useGlobalInterceptors(new TransformInterceptor())
  await app.listen(9080);
}
bootstrap();

```

## 配置接口文档Swagger

```
yarn add @nestjs/swagger swagger-ui-express -S
```

接下来需要在main.ts中设置Swagger文档信息：

```
...
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  ...
  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('管理后台')
    .setDescription('管理后台接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(9080);
}
bootstrap();

```

配置完成，我们就可以访问：http://localhost:3000/docs

在controller 方法中使用给文档加上提示注解

```
@ApiTags('文章')

@ApiOperation({ summary: '获取文章列表' })
```

- 定义数据类型，为了能够生成文档
  在posts目录下创建一个dto文件夹，再创建一个create-post.dot.ts文件：

```
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  readonly title: string;

  @ApiProperty({ description: '作者' })
  readonly author: string;

  @ApiPropertyOptional({ description: '内容' })
  readonly content: string;

  @ApiPropertyOptional({ description: '文章封面' })
  readonly cover_url: string;

  @ApiProperty({ description: '文章类型' })
  readonly type: number;
}
```

然后在Controller中对创建文章是传入的参数进行类型说明：

```
//  posts.controller.ts
...
import { CreatePostDto } from './dto/create-post.dto';

@ApiOperation({ summary: '创建文章' })
@Post()
async create(@Body() post:CreatePostDto) {...}
```

- 添加数据校验

```
yarn add class-validator class-transformer -S
```

然后在create-post.dto.ts文件中添加验证, 完善错误信息提示

```
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsNotEmpty({ message: '文章标题必填' })
  readonly title: string;

  @IsNotEmpty({ message: '缺少作者信息' })
  @ApiProperty({ description: '作者' })
  readonly author: string;

  @ApiPropertyOptional({ description: '内容' })
  readonly content: string;

  @ApiPropertyOptional({ description: '文章封面' })
  readonly cover_url: string;

  @IsNumber()
  @ApiProperty({ description: '文章类型' })
  readonly type: number;
}
```

最后少传作者信息就会报错了

```
{
  "data": {},
  "message": "缺少作者信息",
  "code": -1
}
```

## 自动化部署

- [添加阿里云镜像](https://cr.console.aliyun.com/cn-shenzhen/instance/namespaces)
- 创建命名空间后，创建该命名空间下的镜像，选择github，绑定项目
- 根目录下创建 Dockerfile

```
# 使用官方 Node 镜像
FROM node:20

# 创建并设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

# 构建 Nest 应用
RUN yarn build

# 绑定应用到 3000 端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "start"]
```

- 在 Github 仓库中的新建 5 个 Repository secrets

SERVER_HOST：服务器 ip
SERVER_USERNAME：服务器登录用户名， 一般 root
SERVER_SSH_KEY：Github 的私钥，服务器需要要生成相对应的公钥，这里不会的可以参考我的 过去文章
ALIYUN_DOCKER_USERNAME：阿里云 Docker 用户名
ALIYUN_DOCKER_PASSWORD：阿里云 Docker 密码

- 添加 `.github/workflows/deploy.yml`

```
name: Deploy to Alibaba Cloud

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

       - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Alibaba Cloud Container Registry
        run: |
          echo "${{ secrets.ALIYUN_DOCKER_PASSWORD }}" | docker login --username ${{ secrets.ALIYUN_DOCKER_USERNAME }} --password-stdin registry.cn-shenzhen.aliyuncs.com

      - name: Build Docker image
        run: docker build -t registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest .

      - name: Push Docker image
        run: docker push registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: SSH to server and deploy
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker login --username ${{ secrets.ALIYUN_DOCKER_USERNAME }} --password ${{ secrets.ALIYUN_DOCKER_PASSWORD }} registry.cn-shenzhen.aliyuncs.com
            docker pull registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest
            docker ps -q --filter "name=jiang-nest-study" | grep -q . && docker stop jiang-nest-study || echo "Container jiang-nest-study is not running"
            docker ps -a -q --filter "name=jiang-nest-study" | grep -q . && docker rm jiang-nest-study || echo "Container jiang-nest-study does not exist"
            docker run -d --name jiang-nest-study -p 3000:3000 registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest

```

- 腾讯云防火墙放开自定义端口3000

推送代码后就自动部署了，然后打开 http://121.4.86.16:3000/docs

## 配置域名访问接口地址

为了区分域名以外其它的服务，添加/api匹配

在nginx 配置文件中添加配置 /www/server/nginx/conf/nginx.conf

// 这个为证书路径，宝塔安装默认为
ssl_certificate /www/server/panel/vhost/cert/junfeng530.xyz/fullchain.pem; # 替换为你的证书路径
ssl_certificate_key /www/server/panel/vhost/cert/junfeng530.xyz/privkey.pem; # 替换为你的私钥路径

```
server {
    listen 443 ssl;  # 启用 SSL 并监听 443 端口
    server_name junfeng530.xyz;  # 你的域名

    ssl_certificate /www/server/panel/vhost/cert/junfeng530.xyz/fullchain.pem;  # 替换为你的证书路径
    ssl_certificate_key /www/server/panel/vhost/cert/junfeng530.xyz/privkey.pem;  # 替换为你的私钥路径

    location /api/ {
        proxy_pass http://121.4.86.16:3000/;  # 代理到 Docker 容器所在的 3000 端口
        proxy_set_header Host $host;  # 保持 Host 头部
        proxy_set_header X-Real-IP $remote_addr;  # 获取真实 IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 传递代理链 IP
        proxy_set_header X-Forwarded-Proto $scheme;  # 传递协议

        # 处理 URL 重写，将 /api 前缀移除
        rewrite ^/api/(.*)$ /$1 break;
    }
}
```

## 调试，debugger

vscode 安装插件 JavaScript Debugger，选择新建 JavaScript Debugger Terminal 终端，执行yarn dev 即可

在代码中写入debugger即可调试

## 添加静态资源访问

在 main.ts 中添加

```

import { NestExpressApplication } from '@nestjs/platform-express';
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// 支持静态资源
// app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/static' }); // 网上的行不通
app.useStaticAssets('public', { prefix: '/static' }); // 可以

```

## 生命周期

- 模块初始化：OnModuleInit
- 应用启动：OnApplicationBootstrap
- 模块销毁：OnModuleDestroy
- 应用关闭前：BeforeApplicationShutdown
- 应用正式关闭：OnApplicationShutdown

执行顺序如上顺序，在模块中 controller => service => module 文件依次执行

## 用户登录

### JWT

> JSON Web Token ，简称 JWT ，一种基于 JSON 的认证授权机制，是一个非常轻巧的标准规范。这个规范允许我们在用户和服务器之间传递安全可靠的信息。
