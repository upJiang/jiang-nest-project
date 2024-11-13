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

- 在 `src/upload/upload.controller.ts`，编写文件上传方法，在不同环境下指定不同的上传目录

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

const isProd = process.env.NODE_ENV === 'production';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/files')
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = isProd
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

- `/src/upload/upload.service.ts` 在这里可定制对文件类型大小的限制

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

- 使用 -v 显式挂载宿主机目录

docker run -v 服务器文件系统地址:容器内文件系统地址 -p 3000:3000 your-docker-image

```
docker run -v /www/wwwroot/blog.junfeng530.xyz/uploads:/www/wwwroot/blog.junfeng530.xyz/uploads -p 3000:3000 registry.cn-shenzhen.aliyuncs.com/jiang-nest/jiang-nest-study
```

执行后不报错，查看是否映射成功

```
# 如果没有成功重启容器试试
$ docker restart <your-container-id>

# 查看容器映射
$ docker inspect jiang-nest-study
```
