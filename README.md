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
- nest build 使用 `tsc` 或者 `webpack` 构建代码
- nest start 启动开发服务，支持 `watch` 和调试
- nest info 打印 `node、npm、nest` 包的依赖版本
- nest g resource xxx 快速创建 `REST API` 的模块

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

_为了不影响之前的域名文件，需要多增加一条记录_

### 添加子域名解析

在有域名的腾讯云网站中，打开 https://console.cloud.tencent.com/cns

- 添加域名：blog.junfeng530.xyz
- 会提示：请前往域名 junfeng530.xyz 的 DNS服务商处为域名添加以下 TXT 解析记录。
- 在域名 junfeng530.xyz 的 DNS服务商，其实就是域名绑定的服务器中的腾讯云帐号中，打开https://console.cloud.tencent.com/cns/- detail/junfeng530.xyz/records，按照指引添加解析记录，添加完大概等待一两分钟刷新后便有一条新的解析记录
- 需要添加 A @ 记录

刷新后开启解析，会报：子域名未正确设置 NS 记录
继续按照指引添加记录

修改/www/server/nginx/conf/nginx.conf，添加配置

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

     location / {
        root /www/wwwroot/junfeng530.xyz;  # 设置网站文件的路径
        index index.html;  # 设置默认首页文件
        try_files $uri $uri/ =404;  # 处理文件请求或返回 404
    }
}

server {
    listen 443 ssl;  # 启用 SSL 并监听 443 端口
    server_name blog.junfeng530.xyz;  # 子域名

    ssl_certificate /www/server/panel/vhost/cert/blog.junfeng530.xyz/fullchain.pem;  # 替换为你的子域名证书路径
    ssl_certificate_key /www/server/panel/vhost/cert/blog.junfeng530.xyz/privkey.pem;  # 替换为你的子域名私钥路径

    location / {
        root /www/wwwroot/blog.junfeng530.xyz;  # 设置子域名网站的路径
        index index.html;  # 设置默认首页文件
        try_files $uri $uri/ =404;  # 处理文件请求或返回 404
    }
}

```

### 在宝塔的网站中，添加 blog.junfeng.xyz 的网站，是为了添加证书方便

申请证书 https://console.cloud.tencent.com/ssl

在含服务器的腾讯云网站中申请证书，现在申请证书只有90天有效期，蛋疼，按照指引添加记录，或者选择自动验证，证书验证完并签发后，将证书填入到宝塔的子域名ssl设置中

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

#### 接入 jwt

```

- 使用 `bcryptjs` 加密用户密码

```

yarn add bcryptjs

```

用法：

```

/\*\*

- 加密处理 - 同步方法
- bcryptjs.hashSync(data, salt)
- - data 要加密的数据
- - slat 用于哈希密码的盐。如果指定为数字，则将使用指定的轮数生成盐并将其使用。推荐 10
    \*/
    const hashPassword = bcryptjs.hashSync(password, 10)

/\*\*

- 校验 - 使用同步方法
- bcryptjs.compareSync(data, encrypted)
- - data 要比较的数据, 使用登录时传递过来的密码
- - encrypted 要比较的数据, 使用从数据库中查询出来的加密过的密码
    \*/
    const isOk = bcryptjs.compareSync(password, encryptPassword)

```

### 编写文件

- 创建一个 auth 模块

```

nest g resource auth

选择 RESR API

- 定义字段,id name password，`auth.entity.ts`

```
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NV_Users {
// id为主键并且自动递增
@PrimaryGeneratedColumn()
id: number;

@Column()
username: string;

@Column()
password: string;
}
```

- 在 auth.module.ts 中将仓库注入

```
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthEntity } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

```

- 在app.module.ts 中自动注册该表

```
import { AuthModule } from './auth/auth.module';
import { AuthEntity } from './auth/entities/auth.entity';

entities: [AuthEntity],
```

- 在 auth.service.ts 中编写注册登录方法，注册Repository

```
import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  // 注册
  signup(signupData: CreateAuthDto) {
    console.log(signupData, this.authRepository);
    return '注册成功';
  }

  // 登录
  login(loginData: CreateAuthDto) {
    console.log(loginData);
    return '登录成功';
  }
}

```

- 安装 Database Client 插件链接数据库，执行 yarn dev，执行后，数据已经创建好auth的表

- 编写 auth.controller.ts

```
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 注册
   * @param name 姓名
   * @param password 密码
   */
  @Post('/signup')
  signup(@Body() signupData: CreateAuthDto) {
    return this.authService.signup(signupData);
  }

  /**
   * 登录
   * @param name 姓名
   * @param password 密码
   */
  @Post('/login')
  login(@Body() loginData: CreateAuthDto) {
    return this.authService.login(loginData);
  }
}

```

- 编写 create-auth.dto.ts

```
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名必填' })
  readonly username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码必填' })
  readonly password: string;
}

```

- 在 apiFox 测试接口 http://127.0.0.1:3000/auth/signup

## 编写业务代码使用jwt

安装包:
`bcryptjs` 这个是对用户密码进行加密的
`@nestjs/jwt` 用于生成token

```
yarn add bcryptjs @nestjs/jwt
```

- src 目录下新建 `token` 配置文件 `src/common/constants.ts`

```
export const jwtConstants = {
    secret: "leeKey", // 密钥
    expiresIn: "60s" // token有效时间
}

```

- 在 auth.module.ts 中配置 jwt

```
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants';

 imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],

```

- 编写注册登录逻辑

```
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity) private readonly auth: Repository<AuthEntity>,
    private readonly JwtService: JwtService,
  ) {}

  // 注册
  async signup(signupData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: signupData.username },
    });
    if (findUser && findUser.username === signupData.username)
      return '用户已存在';
    // 对密码进行加密处理
    signupData.password = bcryptjs.hashSync(signupData.password, 10);
    await this.auth.save(signupData);
    return '注册成功';
  }

  // 登录
  async login(loginData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: loginData.username },
    });
    // 没有找到
    if (!findUser) return new BadRequestException('用户不存在');

    // 找到了对比密码
    const compareRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password,
    );
    // 密码不正确
    if (!compareRes) return new BadRequestException('密码不正确');
    const payload = { username: findUser.username };

    return {
      access_token: this.JwtService.sign(payload),
      msg: '登录成功',
    };
  }
}
```

## 身份验证拦截

### 编写自定义装饰器

`src/common/public.decorator.ts`

```
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

### 安装依赖

```
yarn add @nestjs/passport passport-jwt passport
yarn add -D @types/passport-jwt
```

- 新建 `src/auth/jwt-auth.grard.ts` 文件，用于全局守卫，将未携带 `token` 的接口进行拦截

```
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport"
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs"
import { IS_PUBLIC_KEY } from "src/common/public.decorator";


@Injectable()

export class jwtAuthGuard extends AuthGuard("jwt") {
    constructor(private reflector: Reflector) {
        super()
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        console.log(isPublic, "isPublic");
        if (isPublic) return true
        return super.canActivate(context)
    }
}

```

- 新建 验证策略文件 /src/auth/jwt-auth.strategy.ts

```
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../common/constants';

export interface JwtPayload {
  username: string;
}

@Injectable()
// 验证请求头中的token
export default class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log(payload.username);
    const { username } = payload;
    return {
      username,
    };
  }
}

```

- 在 `auth.module.ts` 的 `providers` 中配置 `JwtAuthStrategy`

```
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants';
import JwtAuthStrategy from './jwt-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy],
})
export class AuthModule {}

```

- 在 `app.module.ts` 将其注册为全局守卫

```
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.grard';

 // 注册为全局守卫
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: jwtAuthGuard,
    },
  ],
```

- 给通用接口(注册和登录接口)都加上@Public装饰器，绕过检测 `auth.controller.ts`

```
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from 'src/common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 注册
   * @param name 姓名
   * @param password 密码
   */
  @Public()
  @Post('/signup')
  signup(@Body() signupData: CreateAuthDto) {
    return this.authService.signup(signupData);
  }

  /**
   * 登录
   * @param name 姓名
   * @param password 密码
   */
  @Public()
  @Post('/login')
  login(@Body() loginData: CreateAuthDto) {
    return this.authService.login(loginData);
  }
}

```

## 使用 Redis

### 在腾讯云服务器上安装 redis

在腾讯云终端执行，不同的操作系统命令不同，这里是linux CentOS

```
# 安装 redis
$ yum install redis

# 启动 redis
systemctl start redis

# 设置开机自启
systemctl enable redis

# 验证 redis 是否正常启动
redis-cli ping
```

- 安装完后，打开 /etc/redis.conf

```
设置密码：
requirepass jiang

Redis 监听地址和端口:
bind 127.0.0.1 // 需要连接到服务器，修改成自己的 0.0.0.0

修改端口
port 6379  # 默认为 6379
```

修改配置后重启 redis

```
systemctl restart redis
```

### 在 nest 中使用 redis

- 安装依赖
  ioredis 是国内 nodejs 的最广泛的 redis 客户端

```
yarn add ioredis
```

- 创建 redis 管理模块

```
nest generate service redis
```

设置 redis，并注册一些方法，在生成的 redis.service.ts 中写入

```
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    // 配置 Redis 连接
    this.redisClient = new Redis({
      host: 'localhost', // Redis 服务器地址
      port: 6379, // Redis 端口
      password: 'yourpassword', // 如果设置了密码，请输入
      db: 0, // 使用的 Redis 数据库，默认为 0
    });
  }

  // 通过 get 方法访问 Redis 中的键值
  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  // 通过 set 方法将值存入 Redis 中
  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  // 关闭 Redis 客户端连接
  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}

```

- 创建 module，负责将 RedisService 提供给其他模块使用，在app.module.ts 中会自动注入

```
nest generate module redis
```

写入 `redis.module.ts`

```
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // 导出 RedisService 以供其他模块使用
})
export class RedisModule {}

```

- 腾讯云服务器需要放开 6379 端口，需要修改redis配置文件 bind 0.0.0.0

## 在其它模块中使用 redis

- 步骤一：在 auth.module.ts 中导入 redis.module.ts

```
import { RedisModule } from '../redis/redis.module'; // 添加

 imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    RedisModule, // 添加
  ],
```

- 步骤二：在 auth.service.ts 中导入 redis.service.ts，并调用方法使用

```
import { RedisService } from '../redis/redis.service';

 constructor(
    private readonly redisService: RedisService, // 注册redis控制器
  ) {}


  // 尝试将注册成功的用户存入redis中
    this.redisService.set(signupData.username, signupData.password);

```

- 在 apiFox 中调用 http://127.0.0.1:3000/auth/signup

- 在 插件 Database 中，连接 redis 数据库，用户名不用填写，其它正常填写，连接成功后，会发现多了一条刚刚注册的用户信息
