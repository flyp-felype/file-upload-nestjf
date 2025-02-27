import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { File } from '@nest-lab/fastify-multer';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = path.join(__dirname, 'uploads');

  saveFile(file: File): string {
    if (!file || !file.buffer) {
      throw new Error('Arquivo inválido ou ausente.');
    }

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const filePath = path.join(this.uploadDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }
}
