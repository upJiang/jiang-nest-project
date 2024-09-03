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
