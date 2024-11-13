// upload/upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    console.log('file', file);

    const uploadPath = '/www/wwwroot/blog.junfeng530.xyz/uploads';
    // const uploadPath = path.join(__dirname, '..', 'uploads'); // 检查路径是否正确
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    console.log('uploadPath', uploadPath);

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
