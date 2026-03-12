import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as OSS from 'ali-oss';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private client: any;

  constructor() {
    this.client = new OSS({
      region: process.env.OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET || 'mold-management',
    });
  }

  async upload(file: Express.Multer.File, folder = 'reports') {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    try {
      const result = await this.client.put(key, file.buffer);
      return { url: result.url, key };
    } catch (e) {
      throw new InternalServerErrorException('文件上传失败');
    }
  }
}
