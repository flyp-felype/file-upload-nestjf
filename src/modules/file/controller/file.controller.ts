import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Uploads a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: File) {
    await this.uploadService.processFile(file);
    return {
      message: 'Arquivo recebido com sucesso',
      name: file.originalname,
    };
  }
}
