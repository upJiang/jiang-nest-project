> `nestjs` 作为前端儿最简单入门的后端语言，就算不是为了工作，在日常自己的项目中掌握一门后端语言也是非常有必要的。

## 前言

通过这篇文章，我将带你学会

- 使用 `typeorm` 连接数据库，实现简单的 `CRUD`，实现接口的统一格式，自动生成 `swagger` 文档
- 通过 `docker` + `GITHUB ACTION` 自动化部署到腾讯云服务器上，并通过域名访问接口，真正实战落地
- 使用 `JWT` 实现用户注册登录，并做身份验证（`token`）拦截，全局拦截返回 `401`
- 在服务器上安装 `redis`，并在 `nest` 中使用

文章大部分都是基于腾讯云服务器实现的，系统是 `Linux CentOS`如果你没有可以选择本地数据库，也可以新购一台，想学习后端知识服务器肯定是必备的。`vscode` 需要安装插件 `Database Client`，`node` 版本选择高于20的，我的是 `20.9.0`

![1730876009691.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/da5483157f744a0493d4e0b886f65a71~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730962420&x-orig-sign=mAx4SjrcRwX6HkdiT4yzgnAv7Pw%3D)

可以先行下载代码后阅读，[代码地址](https://github.com/upJiang/jiang-nest-project)，觉得还行的话希望能给仓库点个 `star `。下面开始动手吧！

## nest项目 初始化

- 安装依赖并初始化 `nest` 项目

```
# 全局安装 nest
$ npm i -g @nestjs/cli

# 创建 nest 项目
$ nest new project-name

# 安装依赖
$ yarn
```

贴一下我的项目结构

![1730876815124.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3a3a4ae567d9413b82b38612b11ce0ea~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730963222&x-orig-sign=JPOraQyiERkSGQm9cFHH%2BNUiP3U%3D)

在 `package.json` 中修改 `dev` 的命令，便于调试，可以实时监听代码修改

```
"dev": "nest start --watch",
```

`nest` 常用命令：

- `nest new` 快速创建项目
- `nest generate` 快速生成各种代码
- `nest build` 使用 `tsc` 或者 `webpack` 构建代码
- `nest start` 启动开发服务，支持 `watch` 和调试
- `nest info` 打印 `node、npm、nest` 包的依赖版本
- `nest g resource xxx` 快速创建 `REST API` 的模块

**nest 的生命周期**

- 模块初始化：OnModuleInit
- 应用启动：OnApplicationBootstrap
- 模块销毁：OnModuleDestroy
- 应用关闭前：BeforeApplicationShutdown
- 应用正式关闭：OnApplicationShutdown

执行顺序如上顺序，在模块中 controller => service => module 文件依次执行

## 使用 typeorm 连接数据库

- 在腾讯云服务器上新建一个数据库，并设置用户名跟密码，或者在本地安装数据库软件 `Navicat` 自行创建数据库

![1730877884988.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/51b1b24db6d34106955c4945af64e961~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730964339&x-orig-sign=V1QVfU%2FzNBSdW3GVXUCt2TEjWQU%3D)

- 前面我让大家安装的 `Database Client`，这时候可以打开了，自行连接上，后面我们都在这里直接看数据库的数据变化

![1730878038916(1).png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/33f95c2671404e778ebac0add0f188e1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730964444&x-orig-sign=eLjhYgboEei8f8iORFya6cROADM%3D)

- 安装数据库相关的依赖

```
yarn add @nestjs/typeorm typeorm mysql2 @nestjs/config -S
```

- 在根目录下新建 .env .env.prod 配置文件

```
// 数据库地址
DB_HOST=
// 数据库端口
DB_PORT=3306
// 数据库登录名
DB_USER=
// 数据库登录密码
DB_PASSWD=
// 数据库名字
DB_DATABASE=
```

- 根目录下新增配置文件 `config/env.ts`，后面需要给数据库连接使用

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

- 在 `src/app.module.ts` 中添加数据库连接

```
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from '../config/env';

@Module({
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
        entities: [], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
      }),
    }),
  ],
  controllers: [AppController],
  // 注册为全局守卫
  providers: [
    AppService,
  ],
})
```

执行 `yarn dev` 不报错则连接数据库成功

## 实现 CRUD

我们直接通过快捷命令生成 `restful` 风格的模块 `posts`，执行完会自动生成文件，并且会自动在 `src/app.module.ts` 中注册

```
nest g resource posts
```

![1730878411584(1).png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/992e98f32a4343309155277f14dd9e49~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730964820&x-orig-sign=3MAepM8bj09XOPNokG5gv7%2B2FtE%3D)

- `src/posts/entities/posts.entity.ts` ，熟悉 `ts` 的应该一看就懂了

```
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('posts')
export class PostsEntity {
  @PrimaryGeneratedColumn() // 标记为主列，值自动生成
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 20 })
  author: string;

  @Column('text')
  content: string;

  @Column({ default: '' })
  thumb_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
}
```

- 在 app.module.ts 中添加数据库表，添加后会根据 `posts.entity.ts` 定义的字段自动创建相应规则的表

```
import { PostsEntity } from './posts/entities/posts.entity';

entities: [PostsEntity], // 在前面添加的数据库设置中添加
```

`src/posts/posts.service.ts`，下面的方法执行后就能在数据库看到相应的变化

```
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';

export interface PostsRo {
  list: PostsEntity[];
  count: number;
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 创建文章
  async create(post: Partial<PostsEntity>): Promise<PostsEntity> {
    const { title } = post;
    if (!title) {
      throw new HttpException('缺少文章标题', 401);
    }
    const doc = await this.postsRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 401);
    }
    return await this.postsRepository.save(post);
  }

  // 获取文章列表
  async findAll(query): Promise<PostsRo> {
    const qb = await getRepository(PostsEntity).createQueryBuilder('post');
    qb.where('1 = 1');
    qb.orderBy('post.create_time', 'DESC');

    const count = await qb.getCount();
    const { pageNum = 1, pageSize = 10, ...params } = query;
    qb.limit(pageSize);
    qb.offset(pageSize * (pageNum - 1));

    const posts = await qb.getMany();
    return { list: posts, count: count };
  }

  // 获取指定文章
  async findById(id): Promise<PostsEntity> {
    return await this.postsRepository.findOne({ where: { id } });
  }

  // 更新文章
  async updateById(id, post): Promise<PostsEntity> {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    const updatePost = this.postsRepository.merge(existPost, post);
    return this.postsRepository.save(updatePost);
  }

  // 刪除文章
  async remove(id) {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    return await this.postsRepository.remove(existPost);
  }
}
```

- 编写 `create-post.dot.ts`，定义字段类型

```
export class CreatePostDto {
  readonly title: string;

  readonly author: string;

  readonly content: string;

  readonly cover_url: string;
}

```

- 编写控制器文件，控制器也是接口地址的入口，接口传参，路由规则都是在这里，为了与其它模块区分，`@Controller('post')`，在最前面添加这个注解，之后的接口地址前面都需要带这个前缀。

```
import { PostsService, PostsRo } from './posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dot';

@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 创建文章
   * @param post
   */
  @Post('/create')
  async create(@Body() post: CreatePostDto) {
    return await this.postsService.create(post);
  }

  /**
   * 获取所有文章
   */
  @Get('/findAll')
  async findAll(@Query() query): Promise<PostsRo> {
    return await this.postsService.findAll(query);
  }

  /**
   * 获取指定文章
   * @param id
   */
  @Get(':id')
  async findById(@Param('id') id) {
    return await this.postsService.findById(id);
  }

  /**
   * 更新文章
   * @param id
   * @param post
   */
  @Put(':id')
  async update(@Param('id') id, @Body() post) {
    return await this.postsService.updateById(id, post);
  }

  /**
   * 删除
   * @param id
   */
  @Delete('id')
  async remove(@Param('id') id) {
    return await this.postsService.remove(id);
  }
}

```

- 在 `src/posts/posts.module.ts` 将 `PostsEntity` 关联数据库

```
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from './entities/posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

- 此时的 `src/app.module.ts` 是这样的，有一些是在执行 `nest g` 时自动新增的，执行若有报错请检查以下是否漏了什么没写。

```
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import envConfig from '../config/env';
import { PostsEntity } from './posts/entities/posts.entity';

@Module({
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
        entities: [PostsEntity], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
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
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
```

这时候我们执行 `yarn dev`，没有报错则前面步骤都很成功，然后我们打开本地软件 `Apifox` 或者 `Postman`，调用接口尝试

![1730880123722.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ab7b94b1cf094b05950928107fd12702~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730966528&x-orig-sign=jZZ8Humc8bbiaR5bAvE1XOy%2B0ek%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/07619ad363cd46738d56acf631991f59~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730967618&x-orig-sign=mhZ8OcM0bruSbNDcIayGBYl9Xdw%3D)

可以看到，此时已经将数据插入到数据库对应表了

![1730881253446.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6a7ae3fb6b45490d928f5f9a25ef70d1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730967658&x-orig-sign=VYXZcsfbfFZ2JXq2gP1WyeoJv%2Bs%3D)

## 接口返回统一格式

前面的接口返回格式需要做以下处理

### 封装全局错误的过滤器

- 使用命令生成过滤器

```
nest g filter core/filter/http-exception
```

- 在自动生成的 `src/core/filter/http-exceptionhttp-exception.filter.ts`，写入

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

在 `main.ts` 中全局注册

```
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

### 封装全局的成功拦截器

- 使用命令生成拦截器

```
nest g interceptor core/interceptor/transform
```

拦截器代码实现：

```
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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

同样在 `main.ts` 中全局注册

```
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

至此接口返回的数据格式就统一了

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bde643e30384467cba86d398def166ca~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730968401&x-orig-sign=%2B6t7bO%2BiZMT9Jd8UP%2Fw20FIAlg4%3D)

## 自动生成 swagger 接口文档

- 安装相关依赖

```
yarn add @nestjs/swagger swagger-ui-express -S
```

- 在 `main.ts` 中设置 `Swagger`

```
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

- 配置完成，我们就可以访问：[文档地址](http://localhost:3000/docs)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a5d5943f57b146168f2f8dd639ef60d5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730970503&x-orig-sign=ENYFerGKEcrippKMPU4gPfJMJi4%3D)

这些描述需要我们分别在 `controller` 文件以及 `dto` 文件中添加注解

- 在 `src/posts/posts.controller.ts` ，使用 `ApiOperation, ApiTags` 添加注解

```
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文章')
@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 创建文章
   * @param post
   */
  @ApiOperation({ summary: '创建文章' })
  @Post('/create')
  async create(@Body() post: CreatePostDto) {
    return await this.postsService.create(post);
  }
  ...
}
```

- 在 `src/posts/dto/create-post.dot.ts`,添加 `ApiProperty, ApiPropertyOptional` 注解

```
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
}

```

- 添加数据校验

安装相关依赖

```
yarn add class-validator class-transformer -S
```

在 `create-post.dto.ts` 文件中添加验证, 完善错误信息提示

```
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
}

```

刷新文档地址就会生效了，少传作者信息也会报错了

```
{
  "data": {},
  "message": "缺少作者信息",
  "code": -1
}
```

## 自动化部署 github action、docker

使用 `GITHUB ACTION` + `docker` ，在推送代码后自动构建 `docker` 镜像并推送代码到服务器，这一步跟我之前的 go 文章是大同小异的，可以参考 [go 入门文章](https://juejin.cn/post/7398038441524707362)

- [添加阿里云镜像](https://cr.console.aliyun.com/cn-shenzhen/instance/namespaces)
- 创建命名空间后，创建该命名空间下的镜像，选择 `github`，绑定当前项目
- 根目录下创建 `Dockerfile`

写入：

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

- 在 `Github` 仓库中的新建 5 个 `Repository secrets`

  - `SERVER_HOST`：服务器 ip
  - `SERVER_USERNAME`：服务器登录用户名， 一般 `root`
  - `SERVER_SSH_KEY`：`Github` 的私钥，服务器需要要生成相对应的公钥，这里不会的可以参考我的 过去文章
  - `ALIYUN_DOCKER_USERNAME`：阿里云 `Docker` 用户名
  - `ALIYUN_DOCKER_PASSWORD`：阿里云 `Docker` 密码

- 新增 .github/workflows/deploy.yml

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

- 腾讯云防火墙记得放开自定义端口 `3000`

推送代码后就自动部署了，然后打开 http://服务器ip:3000/docs

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/65e9f9dcca974c36bd9865c4478bc68e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730971735&x-orig-sign=StwzdQ7No0PiunmusUzn6v9pwSI%3D)

## 配置域名访问接口地址

前面我们使用的还是 ip 地址访问接口，但是在实际开发中是不可能只使用 ip 地址的，所以我们这里要设置可以通过域名访问接口。并且为了跟同域名下的其它功能区分，我们添加 `/api` 匹配。

在 `nginx` 配置文件 `/www/server/nginx/conf/nginx.conf` 中添加配置

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

修改后重启 `nginx`，就可以通过域名 + `/api` 访问接口了，https://junfeng530.xyz/api/app/say-hello

## 添加静态资源访问

在 `main.ts` 中添加

```
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // 支持静态资源
    app.useStaticAssets('public', { prefix: '/static' });
}
```

访问 https://junfeng530.xyz/api/static/aa.png 生效，前面仍然需要加 `/api` 的前缀

## 使用 JWT 实现用户注册登录校验

> JSON Web Token ，简称 JWT ，一种基于 JSON 的认证授权机制，是一个非常轻巧的标准规范。这个规范允许我们在用户和服务器之间传递安全可靠的信息。

- 新增 `auth` 模块，前面已经做过一遍这样的操作了

```
nest g resource auth
```

- 定义字段：`id name password`，修改 `src/auth/entities/auth.entity.ts`

```
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth')
export class AuthEntity {
  // id为主键并且自动递增
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

- 在 `auth.module.ts` 中将数据库注入

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

- 在 `app.module.ts` 中自动注册该表，执行后会自动创建 `auth` 表

```
import { AuthModule } from './auth/auth.module';
import { AuthEntity } from './auth/entities/auth.entity';

entities: [AuthEntity],
```

- 在 `auth.service.ts` 中编写注册登录方法

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

- 执行 `yarn dev`，数据已经创建好 `auth` 的表

![1730886546270.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/305bf98a2c0f40c5aa461d318aaf30d5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730972961&x-orig-sign=sJ1E1QwbomivAYXSJpGhn9X0z7w%3D)

- `auth.controller.ts`，编写登录注册方法

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

- 编写 `create-auth.dto.ts`，定义字段规则

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

在 `apiFox` 测试接口 http://127.0.0.1:3000/auth/signup

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/dbd0ccc8299a4cbaad85fd268a8aa6e1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730973135&x-orig-sign=xS%2FZQUBtiEoxZgyBKxeqKxDYa%2FM%3D)

![1730886768337.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1a9dcf166b4d41aca482d7b7d3d52b3f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730973174&x-orig-sign=gaL%2FU%2BH9WMPnpcCUhHhg2AdNMZ0%3D)

数据库已插入，接下来写 `jwt` 的逻辑

安装相关依赖

```
yarn add bcryptjs @nestjs/jwt
```

- 新建 `token` 配置文件 `src/common/constants.ts`

```
export const jwtConstants = {
    secret: "leeKey", // 密钥
    expiresIn: "60s" // token有效时间
}
```

- 在 `auth.module.ts` 中配置 `jwt`

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

- 编写注册登录逻辑，`src/auth/auth.service.ts`

```
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity) private readonly auth: Repository<AuthEntity>,
    private readonly JwtService: JwtService,
    private readonly redisService: RedisService, // 注册redis控制器
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
    // 尝试将注册成功的用户存入redis中
    this.redisService.set(signupData.username, signupData.password);
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

### 身份验证拦截

- 安装依赖

```
yarn add @nestjs/passport passport-jwt passport
yarn add -D @types/passport-jwt
```

- 编写自定义装饰器，新增 `src/common/public.decorator.ts`

```
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- 新建 `src/auth/jwt-auth.grard.ts` 文件，用于全局守卫，将未携带 `token` 的接口进行拦截

```
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../common/public.decorator';

@Injectable()
export class jwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(isPublic, 'isPublic');
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

- 新建 验证策略文件 `/src/auth/jwt-auth.strategy.ts`

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

// 注册全局守卫
providers: [
AppService,
    {
        provide: APP_GUARD,
        useClass: jwtAuthGuard,
    },
],
```

此时，请求注册接口 http://127.0.0.1:3000/auth/signup， 将会返回 401

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ff89832e463d4aefba3e24cf0d021ae4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730974199&x-orig-sign=4RVFzzhBQGgXTrQLJYOzp%2Fe2zv8%3D)

- 给通用接口(注册和登录接口)都加上 `@Public` 装饰器，绕过检测 `src/auth/auth.controller.ts`

```
import { Public } from 'src/common/public.decorator';

 /**
   * 注册
   * @param name 姓名
   * @param password 密码
   */
  @Public() 在这里添加 @Public
  @Post('/signup')
  signup(@Body() signupData: CreateAuthDto) {
    return this.authService.signup(signupData);
  }
```

至此，再次请求注册接口 http://127.0.0.1:3000/auth/signup， 就可以直接绕过 `token` 校验了

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9a5642edf3c5499e8660cb46aa3b808d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730974246&x-orig-sign=1qpc7Xn3yJoQhTxz4wSOBKTz%2FRs%3D)

## 接入 redis

### 在腾讯云服务器上安装 redis

在腾讯云终端执行，不同的操作系统命令不同，这里是 `Linux CentOS`

```
# 安装 redis
$ yum install redis

# 启动 redis
$ systemctl start redis

# 设置开机自启
$ systemctl enable redis

# 验证 redis 是否正常启动
$ redis-cli ping
```

- 安装完后，编辑 `/etc/redis.conf`，设置 `redis` 配置，连接到服务器，`bind` 值需要改成：`bind 0.0.0.0`

```
设置密码：
requirepass jiang

Redis 监听地址和端口:
bind 127.0.0.1 // 需要连接到服务器，修改成自己的 0.0.0.0

修改端口
port 6379 # 默认为 6379
```

修改配置后重启 redis

```
systemctl restart redis
```

### 在 nest 中使用 redis

> ioredis 是国内 nodejs 的最广泛的 redis 客户端

- 安装依赖

```
yarn add ioredis
```

- 创建 `redis` 管理模块，这里只需创建 `service、module` 文件

```
nest generate service redis
nest generate module redis
```

- 设置 `redis` 连接，并注册一些方法，在生成的 `redis.service.ts` 中写入

```
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    // 配置 Redis 连接
    this.redisClient = new Redis({
      host: '121.4.86.16', // Redis 服务器地址
      port: 6379, // Redis 端口
      password: 'jiang', // 如果设置了密码，请输入
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

- 编写 `redis.module.ts`

```
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

- 腾讯云服务器需要放开 `6379` 端口

#### 在其它模块中使用 redis

- 步骤一：在 `src/auth/auth.module.ts` 中导入 `redis.module.ts`

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

- 步骤二：在 `auth.service.ts` 中导入 `redis.service.ts`，并调用方法使用

```

import { RedisService } from '../redis/redis.service';

constructor(
private readonly redisService: RedisService, // 注册redis控制器
) {}

// 尝试将注册成功的用户存入redis中
this.redisService.set(signupData.username, signupData.password);
```

- 在 `apiFox` 中调用 http://127.0.0.1:3000/auth/signup

- 在插件 `Database` 中，连接 redis 数据库，用户名不用填写，其它正常填写，连接成功后，会发现多了一条刚刚注册的用户信息

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2f91261c6799463ba8f8d176f987c2e5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1730974811&x-orig-sign=0SOgZJE4b1npXVlppJV12pk78n0%3D)

至此，你也入门 `nestjs` 了，真棒，能够看到这里相信你一定有所收获，觉得不错可以给文章点个赞~
