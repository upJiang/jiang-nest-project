// upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    // - `diskStorage`：控制文件的存储方式，存储到磁盘里，可定义文件的储存路径和文件名
    // - `memoryStorage`：控制文件的储存方式，储存到内存中，适用于临时文件处理
    // - `limits`：定义上传文件的大小限制
    // - `fileFilter`：根据文件类型，过滤文件
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
