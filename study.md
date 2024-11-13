## 文件上传

> 使用 `multer` 中间件实现文件上传，通过解析请求的 `multipart/form-data` 数据，从中提取文件并将其保存到指定位置或存储系统中。它支持多种存储方式，例如本地磁盘、云存储服务等。

> multipart/form-data是一种HTTP请求的编码类型，适合传输包含文件的表单数据，允许将表单信息分为多个部分，每个部分都可以有自己的内容类型。这使得其可以同时发送文本字段和文件数据，非常适合文件上传的场景。

- 安装相关依赖

```
yarn add multer
yarn add @types/multer -D
```

## 创建 Upload 模块

```
nest g resource upload
```

### 配置 Multer

Multer 有四个基本设置：

- `diskStorage`：控制文件的存储方式，存储到磁盘里，可定义文件的储存路径和文件名
- `memoryStorage`：控制文件的储存方式，储存到内存中，适用于临时文件处理
- `limits`：定义上传文件的大小限制
- `fileFilter`：根据文件类型，过滤文件

- 在 `src/upload/upload.controller.ts`，编写文件上传方法，使用 `@nestjs/config` 获取当前环境，在不同环境下指定不同的上传目录，设置文件名

```
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

```

- `/src/upload/upload.service.ts` 设置对文件类型大小的限制

```
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
```

为了能够通过 `Docker` 容器将文件上传到宿主机（服务器文件系统），需要做以下操作

> `NestJS` 项目打包到 `Docker` 容器 后，容器内的文件会存在于容器的文件系统中，而不是直接存在宿主机的某个文件夹。容器内无法直接访问宿主机的文件系统，只有通过卷挂载，才会同步到宿主机的指定路径。

- 在 `Dockerfile` 文件中添加挂载卷

```
# Docker 容器可能无法直接访问宿主机路径，声明挂载点将使宿主机的目录映射到容器中的目录
VOLUME ["/www/wwwroot/blog.junfeng530.xyz/uploads"]
```

提交代码后，查看容器内是否有该文件夹，不报错则成功创建了，但是此时并没有跟宿主机的文件系统映射

```
docker exec -it <container-name> /bin/bash
```

- 使用 `-v` 显式挂载宿主机目录

`docker run -v 服务器文件系统地址:容器内文件系统地址 -p 3000:3000 容器镜像`

这里我们直接在 `.github/workflows/deploy.yml` 中执行，如果遇到 `3000` 端口被占用则杀掉，不要使用动态端口，否则防火墙又得加开放端口

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
```

执行后不报错，查看是否映射成功

```
# 如果没有成功重启容器试试
$ docker restart <your-container-id>

# 查看容器映射
$ docker inspect jiang-nest-study
```

![1731482866817.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a0cde54e1ee845d69701073b36a3d3cb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1731569274&x-orig-sign=QP3ALGQ8Kscn2hX4iSDWiiSeDw4%3D)

当 `source` 跟 `Destination` 一致时则映射成功

使用 `apiFox` 访问接口试试

![1731483249432.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6549e7405f3c4d8b8133da0470e32e04~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgX2ppYW5n:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiODYyNDg3NTIyMzE0MzY2In0%3D&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1731569655&x-orig-sign=7xF92hIMA5UvZhmcUBlvUziILtY%3D)
