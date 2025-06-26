---
theme: condensed-night-purple
---

[掘金原文地址](https://juejin.cn/post/7434059234760556594)

`本篇文章将带你彻底入门` `nestjs`，你将学会：

- 使用 `typeorm` 连接数据库，实现简单的 `CRUD`，实现接口的统一格式，自动生成 `swagger` 文档
- 通过 `docker` + `GITHUB ACTION` 自动化部署到腾讯云服务器上，并通过域名访问接口，真正实战落地
- 使用 `JWT` 实现用户注册登录，身份验证（`token`）拦截返回 `401`
- 学习 `redis` 数据库，在服务器上安装 `redis`，并在 `nest` 中落地使用
- 通过 `Multer` 实现文件上传
- 使用 `Winston` 保存日志
- 使用 `@nestjs/schedule` 封装定时器

`nestjs` 基础知识可以参考 [中文官方文档](https://www.itying.com/nestjs/article-index-id-108.html)，文章关于服务器的知识都是基于腾讯云服务器实现的，系统是 `Linux CentOS`，如果你没有服务器也可以选择本地数据库，也可以新购一台，想学习后端知识服务器肯定是必备的。`VsCode` 需要安装插件 `Database Client`，`node` 版本选择高于 `20` 的，我的是 `20.9.0`。

![1730876009691.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/da5483157f744a0493d4e0b886f65a71~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=5VSDNowkuT2hM%2Bo3KkY8ErsXJ1Y%3D)

可以先行下载代码后阅读，[代码地址](https://github.com/upJiang/jiang-nest-project)，觉得还行的话希望能给仓库点个 `star `。下面开始动手吧！

## nest项目 初始化

- 安装依赖并初始化 `nest` 项目

<!---->

    # 全局安装 nest
    $ npm i -g @nestjs/cli

    # 创建 nest 项目
    $ nest new project-name

    # 安装依赖
    $ yarn

贴一下我的项目结构

![1730876815124.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3a3a4ae567d9413b82b38612b11ce0ea~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=jYfGhnmxPunJcwY7TL2ZFCwPWhs%3D)

在 `package.json` 中修改 `dev` 的命令，便于调试，可以实时监听代码修改

    "dev": "nest start --watch",

`nest` 常用命令：

- `nest new` 快速创建项目
- `nest generate` 快速生成各种代码
- `nest build` 使用 `tsc` 或者 `webpack` 构建代码
- `nest start` 启动开发服务，支持 `watch` 和调试
- `nest info` 打印 `node、npm、nest` 包的依赖版本
- `nest g resource xxx` 快速创建 `REST API` 的模块

  - 在根目录下新建 `nest-cli.json` ，添加如下配置，可以禁用测试用例生成

  <!---->

      "generateOptions": {
          "spec": false
       }

**nest 的生命周期**

- 模块初始化：`OnModuleInit`
- 应用启动：`OnApplicationBootstrap`
- 模块销毁：`OnModuleDestroy`
- 应用关闭前：`BeforeApplicationShutdown`
- 应用正式关闭：`OnApplicationShutdown`

执行顺序如上顺序，在模块中 `controller => service => module` 文件依次执行

## 使用 typeorm 连接数据库

- 在腾讯云服务器上新建一个数据库，并设置用户名跟密码，或者在本地安装数据库软件 `Navicat` 自行创建数据库

![1730877884988.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/51b1b24db6d34106955c4945af64e961~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=5SHaPH3lPVG%2FJF7Io039wZze7zA%3D)

- 前面我让大家安装的 `Database Client`，这时候可以打开，自行连接数据库，后面我们都在这里直接看数据库的数据变化

![1730889831874.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e0872dbc20f54e9c8d4955cc12cfb9fd~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=Bzd%2BWdMyv1A6EteUUEu1zTWIZ%2FI%3D)

- 安装数据库相关的依赖

<!---->

    yarn add @nestjs/typeorm typeorm mysql2 @nestjs/config cross-env -S

- `package.json` 中修改命令指定开发环境变量

<!---->

     "dev": "cross-env NODE_ENV=test nest start --watch",

- 在根目录下新建 `.env 以及 .env.prod` 配置文件

<!---->

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
    // 当前环境，测试环境为 test
    NODE_ENV=production

- 根目录下新增配置文件 `config/env.ts`，后面需要给数据库连接使用

<!---->

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

- 在 `src/app.module.ts` 中添加数据库连接

<!---->

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

执行 `yarn dev` 不报错则连接数据库成功

## 实现 CRUD

我们直接通过快捷命令生成 `restful` 风格的模块 `posts`，执行完会自动生成文件，并且会自动在 `src/app.module.ts` 中注册

    nest g resource posts

![1730889899478.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e5c00ec69c4e475ea9f3cd3524b5ed27~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=8ARwwGwG%2BYBKMiqrc%2FFyRxAsYBQ%3D)

- `src/posts/entities/posts.entity.ts` ，熟悉 `ts` 的应该一看就懂了

<!---->

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

- 在 `app.module.ts` 中添加数据库表，添加后会根据 `posts.entity.ts` 定义的字段自动创建相应规则的表

<!---->

    import { PostsEntity } from './posts/entities/posts.entity';

    entities: [PostsEntity], // 在前面添加的数据库设置中添加

`src/posts/posts.service.ts`，下面的方法执行后就能在数据库看到相应的变化

    import { HttpException, Injectable } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { getRepository, Repository } from 'typeorm';
    import { PostsEntity } from './entities/posts.entity';

    export interface PostsRo {
      list: PostsEntity[];
      count: number;
      totalPages: number;
      currentPage: number;
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
      async findAll(page: number = 1, pageSize: number = 10): Promise<PostsRo> {
        const [posts, totalCount] = await this.postsRepository.findAndCount({
          skip: (page - 1) * pageSize, // 分页偏移量
          take: pageSize, // 每页显示的记录数
          order: { create_time: 'DESC' },
        });

        return {
          list: posts,
          count: totalCount,
          totalPages: Math.ceil(totalCount / pageSize), // 计算总页数
          currentPage: page, // 当前页
        };
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

<!---->

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

- 此时的 `src/app.module.ts` 是这样的，有一些是在执行 `nest g` 时自动新增的，执行若有报错请检查以下是否漏了什么没写。

<!---->

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

这时候我们执行 `yarn dev`，没有报错则前面步骤都很成功，然后我们打开本地软件 `Apifox` 或者 `Postman`，调用接口尝试

![1730880123722.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ab7b94b1cf094b05950928107fd12702~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=SguoNVk3n%2FZ%2BDacKCptQZON%2FeiA%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/07619ad363cd46738d56acf631991f59~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=P5lNmu7BcKN6l39dLWGYcmBfBvk%3D)

可以看到，此时已经将数据插入到数据库对应表了

![1730881253446.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6a7ae3fb6b45490d928f5f9a25ef70d1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=eGf0sPaLnAAbCuSWm4zhus1AsFk%3D)

## 接口返回统一格式

前面的接口返回格式需要做以下处理

### 封装全局错误的过滤器

- 使用命令生成过滤器

<!---->

    nest g filter core/filter/http-exception

- 在自动生成的 `src/core/filter/http-exceptionhttp-exception.filter.ts`，写入

<!---->

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

在 `main.ts` 中全局注册

    import { HttpExceptionFilter } from './core/interceptor/transform.interceptor';

    async function bootstrap() {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      ...
       // 注册全局错误的过滤器
      app.useGlobalFilters(new HttpExceptionFilter());

      await app.listen(9080);
    }
    bootstrap();

### 封装全局成功的拦截器

- 使用命令生成拦截器

<!---->

    nest g interceptor core/interceptor/transform

拦截器代码实现：

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

同样在 `main.ts` 中全局注册

    import { TransformInterceptor } from './core/interceptor/transform.interceptor';

    async function bootstrap() {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      ...
      // 全局注册拦截器
     app.useGlobalInterceptors(new TransformInterceptor())
      await app.listen(9080);
    }
    bootstrap();

至此接口返回的数据格式就统一了

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bde643e30384467cba86d398def166ca~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=6RLg97lqLTj3FyiNCW%2FPUf2niRo%3D)

## 自动生成 swagger 接口文档

- 安装相关依赖

<!---->

    yarn add @nestjs/swagger swagger-ui-express -S

- 在 `main.ts` 中设置 `Swagger`

<!---->

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

- 配置完成，我们就可以访问：[文档地址](http://localhost:3000/docs)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a5d5943f57b146168f2f8dd639ef60d5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=XPqorNecmYT9pQww%2B%2BkmfaoIYWI%3D)

这些描述需要我们分别在 `controller` 文件以及 `dto` 文件中添加注解

- 在 `src/posts/posts.controller.ts` ，使用 `ApiOperation, ApiTags` 添加注解

<!---->

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

    yarn add class-validator class-transformer -S

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

在 `src/main.ts` 中注册全局管道

    import { ValidationPipe } from '@nestjs/common';

    // 注册全局管道
    app.useGlobalPipes(new ValidationPipe());

刷新文档地址就会生效了，少传作者信息也会报错了

    {
      "data": {},
      "message": "缺少作者信息",
      "code": -1
    }

## 自动化部署 github action、docker

使用 `GITHUB ACTION` + `docker` ，在推送代码后自动构建 `docker` 镜像并推送代码到服务器，这一步跟我之前的 `go` 文章是大同小异的，可以参考 [go 入门文章](https://juejin.cn/post/7398038441524707362)

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

<!---->

- SERVER_HOST：服务器 ip
- SERVER_USERNAME：服务器登录用户名，一般 root
- SERVER_SSH_KEY：
  - 在本地生成 `ssh` 密钥对
  ```bash
  ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
  ```
  - 将私钥添加到 `Github` 仓库的 `Repository secrets` 中，命名为 `SERVER_SSH_KEY`
  - 将公钥添加到服务器的 \~/.ssh/authorized_keys 文件中
  ```bash
  echo "前面生成的公钥内容.pub" >> ~/.ssh/authorized_keys
  ```
- ALIYUN_DOCKER_USERNAME：阿里云 Docker 用户名
- ALIYUN_DOCKER_PASSWORD：阿里云 Docker 密码

<!---->

- 新增 `.github/workflows/deploy.yml`

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

推送代码后就自动部署了，然后打开 <http://服务器ip:3000/docs>

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/65e9f9dcca974c36bd9865c4478bc68e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=yJ0j78TxiTKU1bVOR1R4%2Fqp83TQ%3D)

## 配置域名访问接口地址

前面我们使用的还是 `ip` 地址访问接口，但是在实际开发中是不可能只使用 `ip` 地址的，所以我们这里要设置可以通过域名访问接口。并且为了跟同域名下的其它功能区分，我们添加 `/api` 匹配。

在 `nginx` 配置文件 `/www/server/nginx/conf/nginx.conf` 中添加配置

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

修改后重启 `nginx`，就可以通过域名 + `/api` 访问接口了，<https://junfeng530.xyz/api/app/say-hello>

## 添加静态资源访问

在 `main.ts` 中添加

    import { NestExpressApplication } from '@nestjs/platform-express';
    async function bootstrap() {
        const app = await NestFactory.create<NestExpressApplication>(AppModule);

        // 支持静态资源
        app.useStaticAssets('public', { prefix: '/static' });
    }

访问 <https://junfeng530.xyz/api/static/aa.png> 生效，前面仍然需要加 `/api` 的前缀

## 使用 JWT 实现用户注册登录校验

> JSON Web Token ，简称 JWT ，一种基于 JSON 的认证授权机制，是一个非常轻巧的标准规范。这个规范允许我们在用户和服务器之间传递安全可靠的信息。

- 新增 `auth` 模块，前面已经做过一遍这样的操作了

<!---->

    nest g resource auth

- 定义字段：`id name password`，修改 `src/auth/entities/auth.entity.ts`

<!---->

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

- 在 `auth.module.ts` 中将数据库注入

<!---->

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

- 在 `app.module.ts` 中自动注册该表，执行后会自动创建 `auth` 表

<!---->

    import { AuthModule } from './auth/auth.module';
    import { AuthEntity } from './auth/entities/auth.entity';

    entities: [AuthEntity],

- 在 `auth.service.ts` 中编写注册登录方法

<!---->

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

- 执行 `yarn dev`，数据已经创建好 `auth` 的表

![1730886546270.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/305bf98a2c0f40c5aa461d318aaf30d5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=LqjuSCAfGXXkU4olVPEZPxJPQDk%3D)

- `auth.controller.ts`，编写登录注册方法

<!---->

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

- 编写 `create-auth.dto.ts`，定义字段规则

<!---->

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

在 `apiFox` 测试接口 <http://127.0.0.1:3000/auth/signup>

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/dbd0ccc8299a4cbaad85fd268a8aa6e1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=yPMpcS6MjENS5wOCp7t2ghuGhms%3D)

![1730886768337.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1a9dcf166b4d41aca482d7b7d3d52b3f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=hdRojY5JJFP2oWOUxejKnSwyjH0%3D)

数据库已插入，接下来写 `jwt` 的逻辑

安装相关依赖

    yarn add bcryptjs @nestjs/jwt

- 新建 `token` 配置文件 `src/common/constants.ts`

<!---->

    export const jwtConstants = {
        secret: "leeKey", // 密钥
        expiresIn: "60s" // token有效时间
    }

- 在 `auth.module.ts` 中配置 `jwt`

<!---->

    import { JwtModule } from '@nestjs/jwt';
    import { jwtConstants } from '../common/constants';

    imports: [
        TypeOrmModule.forFeature([AuthEntity]),
        JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
    ],

- 编写注册登录逻辑，`src/auth/auth.service.ts`

<!---->

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

### 身份验证拦截

- 安装依赖

<!---->

    yarn add @nestjs/passport passport-jwt passport
    yarn add -D @types/passport-jwt

- 编写自定义装饰器，新增 `src/common/public.decorator.ts`

<!---->

    import { SetMetadata } from "@nestjs/common";

    export const IS_PUBLIC_KEY = 'isPublic'
    export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

- 新建 `src/auth/jwt-auth.grard.ts` 文件，用于全局守卫，将未携带 `token` 的接口进行拦截

<!---->

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

- 新建 验证策略文件 `/src/auth/jwt-auth.strategy.ts`

<!---->

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

- 在 `auth.module.ts` 的 `providers` 中配置 `JwtAuthStrategy`

<!---->

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

- 在 `app.module.ts` 将其注册为全局守卫

<!---->

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

此时，请求注册接口 <http://127.0.0.1:3000/auth/signup，> 将会返回 401

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ff89832e463d4aefba3e24cf0d021ae4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=%2BriMtBfs9Z%2FHOMr8QyvkHhqEgkA%3D)

- 给通用接口(注册和登录接口)都加上 `@Public` 装饰器，绕过检测 `src/auth/auth.controller.ts`

<!---->

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

至此，再次请求注册接口 <http://127.0.0.1:3000/auth/signup，> 就可以直接绕过 `token` 校验了

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9a5642edf3c5499e8660cb46aa3b808d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=dlZ%2BXm%2F8%2FR3XZUTPBsf4KMqND%2B4%3D)

在其它请求的 `Headers` 中添加登录返回的 `token` 可正常访问

![企业微信截图_1731405334140.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/355e74e593f34be894f72f716e1f30fb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=M%2FqWH9SGFkTS%2Fr9eyu0BNoS%2FyDE%3D)

## 接入 redis

### 在腾讯云服务器上安装 redis

在腾讯云终端执行，不同的操作系统命令不同，这里是 `Linux CentOS`

    # 安装 redis
    $ yum install redis

    # 启动 redis
    $ systemctl start redis

    # 设置开机自启
    $ systemctl enable redis

    # 验证 redis 是否正常启动
    $ redis-cli ping

- 安装完后，编辑 `/etc/redis.conf`，设置 `redis` 配置，连接到服务器，`bind` 值需要改成：`bind 0.0.0.0`

<!---->

    设置密码：
    requirepass jiang

    Redis 监听地址和端口:
    bind 127.0.0.1 // 需要连接到服务器，修改成自己的 0.0.0.0

    修改端口
    port 6379 # 默认为 6379

修改配置后重启 `redis`

    systemctl restart redis

### 在 nest 中使用 redis

> ioredis 是国内 nodejs 的最广泛的 redis 客户端

- 安装依赖

<!---->

    yarn add ioredis

- 创建 `redis` 管理模块，这里只需创建 `service、module` 文件

<!---->

    nest generate service redis
    nest generate module redis

- 设置 `redis` 连接，并注册一些方法，在生成的 `redis.service.ts` 中写入

<!---->

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

- 编写 `redis.module.ts`

<!---->

    import { Module } from '@nestjs/common';
    import { RedisService } from './redis.service';

    @Module({
      providers: [RedisService],
      exports: [RedisService],
    })
    export class RedisModule {}

- 腾讯云服务器需要放开 `6379` 端口

#### 在其它模块中使用 redis

- 步骤一：在 `src/auth/auth.module.ts` 中导入 `redis.module.ts`

<!---->

    import { RedisModule } from '../redis/redis.module'; // 添加

    imports: [
        TypeOrmModule.forFeature([AuthEntity]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
        RedisModule, // 添加
    ],

- 步骤二：在 `auth.service.ts` 中导入 `redis.service.ts`，并调用方法使用

```

import { RedisService } from '../redis/redis.service';

constructor(
private readonly redisService: RedisService, // 注册redis控制器
) {}

// 尝试将注册成功的用户存入redis中
this.redisService.set(signupData.username, signupData.password);
```

- 在 `apiFox` 中调用 <http://127.0.0.1:3000/auth/signup>

- 在插件 `Database` 中，连接 redis 数据库，用户名不用填写，其它正常填写，连接成功后，会发现多了一条刚刚注册的用户信息

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2f91261c6799463ba8f8d176f987c2e5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=FanIoxVBulLHy4HNsG0D8L5LYRs%3D)

## Multer 实现文件上传

> 使用 `multer` 中间件实现文件上传，通过解析请求的 `multipart/form-data` 数据，从中提取文件并将其保存到指定位置或存储系统中。它支持多种存储方式，例如本地磁盘、云存储服务等。

> `multipart/form-data` 是一种 `HTTP` 请求的编码类型，适合传输包含文件的表单数据，允许将表单信息分为多个部分，每个部分都可以有自己的内容类型。这使得其可以同时发送文本字段和文件数据，非常适合文件上传的场景。

- 安装相关依赖

<!---->

    yarn add multer
    yarn add @types/multer -D

### 创建 Upload 模块

    nest g resource upload

`Multer` 有四个基本设置：

- `diskStorage`：控制文件的存储方式，存储到磁盘里，可定义文件的储存路径和文件名

- `memoryStorage`：控制文件的储存方式，储存到内存中，适用于临时文件处理

- `limits`：定义上传文件的大小限制

- `fileFilter`：根据文件类型，过滤文件

- 在 `src/upload/upload.controller.ts`，编写文件上传方法，使用 `@nestjs/config` 获取当前环境，在不同环境下指定不同的上传目录，设置文件名

<!---->

    import {
      Controller,
      Post,
      UseInterceptors,
      UploadedFiles,
    } from '@nestjs/common';
    import { FilesInterceptor } from '@nestjs/platform-express';
    import { UploadService } from './upload.service';
    import * as multer from 'multer';
    import * as path from 'path';
    import * as fs from 'fs';
    import { ConfigService } from '@nestjs/config';

    @Controller('upload')
    export class UploadController {
      constructor(private readonly uploadService: UploadService) {}

      @Post('/files')
      @UseInterceptors(
        FilesInterceptor('files', undefined, {
          storage: multer.diskStorage({
            destination(_req, _file, cb) {
              const configService = new ConfigService();

              const uploadPath =
                configService.get('NODE_ENV') === 'production'
                  ? '/www/wwwroot/blog.junfeng530.xyz/uploads'
                  : path.join(__dirname, '..', '..', 'uploads');

              // 检查目标路径是否存在，如果不存在则创建
              if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
              }

              cb(null, uploadPath); // 目录设置
            },
            filename: (_req, file, cb) => {
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const fileExtension = path.extname(file.originalname);
              cb(null, `${uniqueSuffix}${fileExtension}`); // 设置文件名
            },
          }),
        }),
      )
      async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        const result = await Promise.all(
          files.map((file) => this.uploadService.uploadFile(file)),
        );
        return result;
      }
    }

- `/src/upload/upload.service.ts` 设置对文件类型大小的限制

<!---->

    import { Injectable, BadRequestException } from '@nestjs/common';

    @Injectable()
    export class UploadService {
      async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
        if (!file) {
          throw new BadRequestException('No file uploaded');
        }

        // 验证文件类型 (可选)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException('Invalid file type');
        }

        // 验证文件大小 (可选)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new BadRequestException('File is too large!');
        }

        return { url: file.path };
      }
    }

### 配置 `docker` 文件上传

> `NestJS` 项目打包到 `Docker` 容器 后，容器内的文件会存在于容器的文件系统中，而不是直接存在宿主机的某个文件夹。容器内无法直接访问宿主机的文件系统，只有通过卷挂载，才会同步到宿主机的指定路径。

为了能够通过 `Docker` 容器将文件上传到宿主机（服务器文件系统），需要做以下操作

- 在 `Dockerfile` 文件中添加挂载卷

<!---->

    # Docker 容器可能无法直接访问宿主机路径，声明挂载点将使宿主机的目录映射到容器中的目录
    VOLUME ["/www/wwwroot/blog.junfeng530.xyz/uploads"]

提交代码后，查看容器内是否有该文件夹，不报错则成功创建了，但是此时并没有跟宿主机的文件系统映射

    docker exec -it <container-name> /bin/bash

- 使用 `-v` 显式挂载宿主机目录

`docker run -v 服务器文件系统地址:容器内文件系统地址 -p 3000:3000 容器镜像`

这里我们直接在 `.github/workflows/deploy.yml` 中执行，如果遇到 `3000` 端口被占用则杀掉，不要使用动态端口，否则防火墙又得加开放端口

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
                # 登录阿里云 Docker registry
                docker login --username ${{ secrets.ALIYUN_DOCKER_USERNAME }} --password ${{ secrets.ALIYUN_DOCKER_PASSWORD }} registry.cn-shenzhen.aliyuncs.com

                # 拉取最新的 Docker 镜像
                docker pull registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest

                # 停止并删除已经存在的名为 jiang-nest-study 的容器（如果有）
                docker ps -q --filter "name=jiang-nest-study" | grep -q . && docker stop jiang-nest-study || echo "Container jiang-nest-study is not running"
                docker ps -a -q --filter "name=jiang-nest-study" | grep -q . && docker rm jiang-nest-study || echo "Container jiang-nest-study does not exist"

                # 检查端口 3000 是否被占用，如果被占用，停止并删除相关容器
                docker ps -q --filter "publish=3000" | grep -q . && \
                  docker ps -q --filter "publish=3000" | xargs -I {} docker stop {} && \
                  docker ps -a -q --filter "publish=3000" | xargs -I {} docker rm {} || echo "Port 3000 is not occupied"

                # 运行新容器并挂载卷
                docker run -d --name jiang-nest-study -p 3000:3000 -v /www/wwwroot/blog.junfeng530.xyz/uploads:/www/wwwroot/blog.junfeng530.xyz/uploads registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study:latest

执行后不报错，查看是否映射成功

    # 如果没有成功重启容器试试
    $ docker restart <your-container-id>

    # 查看容器映射
    $ docker inspect jiang-nest-study

![1731482866817.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a0cde54e1ee845d69701073b36a3d3cb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=9sVEKYzL5j1IAD0%2F3UQdW2T%2FkpQ%3D)

当 `source` 跟 `Destination` 一致时则映射成功

使用 `apiFox` 访问接口试试

![1731495863066.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/661fa9c078974855bec1e5d03d49ae0a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=YvYtxmF%2Bj8OncVBBOCN254O%2F2vw%3D)
在调用本地接口，返回的是前面设置的相对路径，接口已经把文件地址打印出来了，在生成的 `dist/uploads` 目录下也能看到上传的文件

![1731495810377.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f80a5566abbe4268ba0a994c126ff358~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=MdYg8enkJyfeOLRTd5zEir7f1po%3D)

访问生产域名的上传文件

![1731495913541.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/df22288405864fc29b8fbbfd2ba8c542~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=iWSn5jKqqM0O9DHU6RTjbsRWR1I%3D)

![1731495957204.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/269d07e44c3e405c8a10096695776f3d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=GgDRV6PeI%2BxZQHim9J0pQEGOZcw%3D)

![1731495970488.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/cbf7731ea6024ff5a83a63b73d31dd9e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=0as8PNzQyP1QbYGLHQXV40Sip8Q%3D)

也成功写入服务器的文件系统，并且正常访问了。至此文件上传搞定了！

## 使用 winston 保存日志

> `Winston` 是一个功能强大且灵活的日志库，适用于 `Node.js` 环境。它能够记录应用程序的日志，并支持多种输出方式，例如控制台输出、文件、`HTTP`、数据库等。`Winston` 的设计目标是简洁、扩展性强，支持多种日志级别和格式化选项。

安装依赖

    yarn add nest-winston winston winston-daily-rotate-file

### 创建一个日志服务（Logger Service）

    nest generate service logger

创建日志配置器，使用 `winston` 中的 `transports` 格式化日志信息，使用 `winston-daily-rotate-file` 按日期切割日志文件，并且针对不同的日志类型做区分。会自动在项目根目录下新增 `logs/日期.log` 日志文件。

    import { Injectable } from '@nestjs/common';
    import { createLogger, transports, format, Logger } from 'winston';
    import 'winston-daily-rotate-file';

    @Injectable()
    export class LoggerService {
      private logger: Logger;

      constructor() {
        this.logger = createLogger({
          level: 'info', // 默认日志级别
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 设置时间戳格式
            format.printf(({ timestamp, level, message, ...metadata }) => {
              // 确保时间戳在日志的最前面，并且处理 metadata（如 params）
              let logMessage = `${timestamp} [${level}] : ${message}`;

              // 如果有 metadata（附加的对象），将它们格式化为 JSON
              if (Object.keys(metadata).length > 0) {
                if (metadata.message !== 'message') {
                  logMessage += ` | ${JSON.stringify(metadata, null, 2)}`;
                }
              }
              return logMessage;
            }),
          ),
          transports: [
            // 控制台输出
            new transports.Console({
              format: format.combine(
                format.colorize(), // 颜色化输出
                format.simple(), // 简单格式
              ),
            }),
            // 使用 daily-rotate-file 来实现按日期生成不同日志文件
            new transports.DailyRotateFile({
              filename: 'logs/%DATE%.log', // 文件名中包含日期
              datePattern: 'YYYY-MM-DD', // 设置日期格式
              maxFiles: '7d', // 保留最近 7 天的日志文件
              level: 'info', // 日志级别为 info
              format: format.combine(
                format.timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.printf((info) => {
                  const paramsInfo = JSON.parse(JSON.stringify(info));
                  // 避免 message 字段在日志中作为 key 出现
                  delete paramsInfo.message;
                  return `${info.timestamp} [${info.level}] : ${info.message} ${
                    Object.keys(info).length
                      ? JSON.stringify(paramsInfo, null, 2)
                      : ''
                  }`;
                }),
              ),
            }),
          ],
        });
      }

      log(message: string, params: object = {}) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          // 如果 params 对象存在，则将日志以自定义格式输出
          const logMessage = {
            message,
            ...params,
            level: 'info', // 设定日志级别为 info
          };
          this.logger.info(logMessage);
        } else {
          this.logger.info(message);
        }
      }

      error(message: string, params: object = {}, trace: string = '') {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          // 如果 params 对象存在，则将日志以自定义格式输出
          const logMessage = {
            message,
            ...params,
            level: 'error', // 设定日志级别为 error
            trace, // 如果有异常堆栈信息，可以添加到日志中
          };
          this.logger.error(logMessage);
        } else {
          this.logger.error(message);
        }
      }

      warn(message: string, params: object = {}) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          // 如果 params 对象存在，则将日志以自定义格式输出
          const logMessage = {
            message,
            ...params,
            level: 'warn', // 设定日志级别为 warn
          };
          this.logger.warn(logMessage);
        } else {
          this.logger.warn(message);
        }
      }

      debug(message: string, params: object = {}) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          // 如果 params 对象存在，则将日志以自定义格式输出
          const logMessage = {
            message,
            ...params,
            level: 'debug', // 设定日志级别为 debug
          };
          this.logger.debug(logMessage);
        } else {
          this.logger.debug(message);
        }
      }

      info(message: string, params: object = {}) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          // 如果 params 对象存在，则将日志以自定义格式输出
          const logMessage = {
            message,
            ...params,
            level: 'info', // 设定日志级别为 info
          };
          this.logger.info(logMessage);
        } else {
          this.logger.info(message);
        }
      }
    }

### 修改接口过滤器、拦截器，打印日志

在前面创建的接口过滤器、拦截器中，我们新增全局打印接口日志的操作

- 在 main.ts 中注册 `Logger Service`，并将 `loggerService` 传入到接口过滤器、拦截器中

<!---->

    import { LoggerService } from './logger/logger.service';

    // 注册全局 logger 拦截器
    const loggerService = app.get(LoggerService);
    app.useGlobalInterceptors(new TransformInterceptor(loggerService));
    // 注册全局错误的过滤器
    app.useGlobalFilters(new HttpExceptionFilter(loggerService));

- 修改接口过滤器文件内容，打印请求错误日志内容，需要打印的内容可以自行定制

`/src/core/filter/http-exception/http-exception.filter.ts`

    import {
      ArgumentsHost,
      Catch,
      ExceptionFilter,
      HttpException,
    } from '@nestjs/common';
    import { LoggerService } from '../../../logger/logger.service';

    @Catch(HttpException)
    export class HttpExceptionFilter implements ExceptionFilter {
      constructor(private readonly logger: LoggerService) {} // 注入 LoggerService

      catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp(); // 获取请求上下文
        const response = ctx.getResponse(); // 获取请求上下文中的 response对象
        const request = ctx.getRequest(); // 获取请求上下文中的 request 对象
        const status = exception.getStatus(); // 获取异常状态码
        const exceptionResponse: any = exception.getResponse();

        // 获取请求的更多信息
        const { method, url, params, query, body, headers } = request;

        let validMessage = '';

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
          code: -1,
          msg: validMessage || message,
        };

        // 设置返回的状态码， 请求头，发送错误信息
        response.status(status);
        response.header('Content-Type', 'application/json; charset=utf-8');
        response.send(errorResponse);

        // 记录请求信息
        this.logger.log('请求信息:', {
          url,
          method,
          headers,
          body,
          query,
          params,
        });

        // 记录请求的响应时间和状态
        this.logger.log('响应信息:', {
          url,
          method,
          statusCode: status,
          msg: validMessage || message,
          ...errorResponse,
        });
      }
    }

- 修改接口拦截器文件内容，打印请求成功日志内容，需要打印的内容可以自行定制

`/src/core/interceptor/transform/transform.interceptor.ts`

    import {
      CallHandler,
      ExecutionContext,
      Injectable,
      NestInterceptor,
    } from '@nestjs/common';
    import { map, Observable, tap } from 'rxjs';
    import { LoggerService } from '../../../logger/logger.service';

    @Injectable()
    export class TransformInterceptor implements NestInterceptor {
      constructor(private readonly logger: LoggerService) {}

      intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const { method, url, headers, body, query, params } = request;

        // 记录请求的基本信息
        this.logger.log('请求信息:', {
          url,
          method,
          headers,
          body,
          query,
          params,
          message: '请求信息',
        });

        return next.handle().pipe(
          tap((data) => {
            // 记录响应时间
            const responseTime = Date.now() - now;

            // 记录请求的响应时间和状态
            this.logger.log('响应信息:', {
              url,
              method,
              responseTime: `${responseTime}ms`,
              statusCode: data?.statusCode || 200, // 默认 200 状态码
              code: 0,
              msg: 'success',
            });
          }),

          map((data) => {
            return {
              code: 0,
              msg: 'success',
              data,
            };
          }),
        );
      }
    }

- 尝试请求失败的接口，可以看到日志已经成功按照我们想要的格式打印到日志文件中。

![企业微信截图_17331365008842.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1c2378b979af4adab54ce3488ba45a78~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=UESKSDT3eQPdotGC6jjEorSqoWo%3D)

查看本地打印以及日志文件内容

![企业微信截图_1733136636853.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ae695a11aaa548fabec11cd62be7c3a4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=%2BMDO7clKmd52x6wWBcI08bOKx%2FU%3D)

![企业微信截图_17331366661836.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f50ceaa9f2b24f479ee6a22d0176f6d4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=FwyHXFlyjQAe9gzMVQpnPmA3bto%3D)

- 再尝试请求成功的接口

![企业微信截图_17331367812242.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a8518aabe74a4e50a55a9e24b5020158~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=i29Dc9VEFB4W0i1XA%2FLw7K9AD3M%3D)

查看本地打印以及日志文件内容，也是没问题的。

![企业微信截图_17331368324588.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/fb01129fb02b4859928f4c1159cb1a34~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=wJD7YZT7zWVfQhYfNtqfVm1kbKE%3D)

![企业微信截图_17331368601722.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f22073519d5549a890068de1321ebbf0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=lVCQymmVyOXNI123VHOe4zhpHZY%3D)

至此日志也完成啦\~

## 定时器 @nestjs/schedule

我们使用 `@nestjs/schedule` 模块来创建定时任务。该模块提供了许多方便的方法来安排和管理定时任务，比如 `cron` 表达式或延迟任务。

[@nestjs/schedule 官方文档](https://docs.nestjs.com/techniques/task-scheduling)，更多的 `Cron` 表达式 使用方法请参考官方文档

安装依赖

    yarn add @nestjs/schedule

### 封装定时器模块

    nest g resource timer

- 封装一个定时器 `Service`，以便于其它模块更方便的创建、使用、销毁定时器

`src/time/timer.service.ts`

    import { Injectable } from '@nestjs/common';
    import { SchedulerRegistry } from '@nestjs/schedule';
    import { CronJob } from 'cron'; // 从 cron 包导入 CronJob 类

    /**
     * 定时器服务，用于管理定时任务。
     */
    @Injectable()
    export class TimerService {
      constructor(private schedulerRegistry: SchedulerRegistry) {}

      /**
       * 添加自定义 Cron 定时任务。
       *
       * @param name 任务名称，用于标识定时任务
       * @param cronExpression Cron 表达式，定义任务执行的时间和频率
       * @param callback 定时任务触发时调用的回调函数
       */
      addCronJob(name: string, cronExpression: string, callback: () => void) {
        const job = new CronJob(cronExpression, callback); // 使用 CronJob 来创建定时任务
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        return `定时任务 ${name} 已启动`;
      }

      /**
       * 停止指定的 Cron 定时任务。
       *
       * @param name 任务名称
       */
      stopCronJob(name: string) {
        try {
          const job = this.schedulerRegistry.getCronJob(name);
          job.stop();
          return '定时任务已停止';
        } catch (error) {
          return '找不到该定时任务，或者已被停止';
        }
      }

      /**
       * 添加延时任务（Timeout）。
       *
       * @param name 任务名称
       * @param delay 延时的时间，单位为毫秒
       * @param callback 延时结束后调用的回调函数
       */
      addTimeout(name: string, delay: number, callback: () => void) {
        const timeout = setTimeout(callback, delay);
        this.schedulerRegistry.addTimeout(name, timeout);
        return '`延时任务 ${name} 已启动`';
      }

      /**
       * 停止指定的延时任务（Timeout）。
       *
       * @param name 任务名称
       */
      stopTimeout(name: string) {
        try {
          const timeout = this.schedulerRegistry.getTimeout(name);
          if (timeout) {
            clearTimeout(timeout);
            return `延时任务 ${name} 已停止`;
          } else {
            return `延时任务 ${name} 不存在`;
          }
        } catch (error) {
          return '找不到该延时任务，或者已被停止';
        }
      }

      /**
       * 添加间隔任务（Interval）。
       *
       * @param name 任务名称
       * @param interval 间隔时间，单位为毫秒
       * @param callback 间隔时间到达后调用的回调函数
       */
      addInterval(name: string, interval: number, callback: () => void) {
        const intervalId = setInterval(callback, interval);
        this.schedulerRegistry.addInterval(name, intervalId);
        return `间隔任务 ${name} 已启动`;
      }

      /**
       * 停止指定的间隔任务（Interval）。
       *
       * @param name 任务名称
       */
      stopInterval(name: string) {
        try {
          const intervalId = this.schedulerRegistry.getInterval(name);
          if (intervalId) {
            clearInterval(intervalId);
            return `间隔任务 ${name} 已停止`;
          } else {
            return `间隔任务 ${name} 不存在`;
          }
        } catch (error) {
          return '找不到该间隔任务，或者已被停止';
        }
      }
    }

- 配置一下必填项 `src/timer/dto/create-timer.dto.ts`

<!---->

    import { ApiProperty } from '@nestjs/swagger';
    import { IsNotEmpty } from 'class-validator';

    export class CreateTimerDto {
      @ApiProperty({ description: '定时器名称' })
      @IsNotEmpty({ message: '定时器名称必填' })
      name: string;
    }

- 在 `timer.controller.ts` 中写个方法尝试启动定时器与销毁定时器

<!---->

    import { Body, Controller, Get, Param, Post } from '@nestjs/common';
    import { ApiOperation, ApiTags } from '@nestjs/swagger';
    import { TimerService } from './timer.service';
    import { Public } from 'src/common/public.decorator';
    import { CreateTimerDto } from './dto/create-timer.dto';

    @ApiTags('定时器')
    @Controller('timer')
    export class TimerController {
      constructor(private readonly timerService: TimerService) {}

      /**
       * 尝试定时任务
       * @param post
       */
      @Public()
      @ApiOperation({ summary: '开启定时任务' })
      @Post('/start-timer')
      async create(@Body() post: CreateTimerDto) {
        return this.timerService.addCronJob(post.name, '*/5 * * * * *', () => {
          console.log('定时任务已启动，每五秒执行一次');
        });
      }

      /**
       * 手动停止 Cron 定时任务
       * @param post
       */
      @Public()
      @ApiOperation({ summary: '手动停止 Cron 定时任务' })
      @Get('/stop-timer/:name')
      async stopTimer(@Param('name') name: string) {
        return this.timerService.stopCronJob(name);
      }
    }

- 在 `timer.module.ts` 中写入

<!---->

    import { Module } from '@nestjs/common';
    import { TimerController } from './timer.controller';
    import { ScheduleModule } from '@nestjs/schedule'; // 导入调度模块
    import { TimerService } from './timer.service';

    @Module({
      imports: [ScheduleModule.forRoot()],
      controllers: [TimerController],
      providers: [TimerService],
    })
    export class TimerModule {}

- 在 `apifox` 中调用 `/timer/start-timer`，在控制台可以看到每隔 5 秒就会执行一次

![企业微信截图_173322520991.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8766c83ada5946b49cef965f91a94d7f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=tBwc0SmbXFQqbdxPaJVC9LZPI0w%3D)

![企业微信截图_17332252539480.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e72063bf046949e096eb19345982c7e8~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=8bQ%2Bh2bgE80JLGh5TkQj6HEkOxs%3D)

- 销毁定时器，调用后定时器不再执行

![企业微信截图_17332252992784.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/14e115a5356c45eb8e105f8e5820a2a4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1742990783&x-orig-sign=EufbXoLQufaavOYI4q5utRv7yvI%3D)

好了，你已经成功入门 `nestjs` 了，真棒，能够看到这里相信你一定有所收获，觉得不错可以给文章点个赞\~

## 接入消息队列 mq
