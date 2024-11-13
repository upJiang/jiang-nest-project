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
          console.log('当前环境NODE_ENV', configService.get('NODE_ENV'));

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
