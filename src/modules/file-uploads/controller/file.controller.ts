import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('files')
export class FileController {
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
  uploadFile(@UploadedFile() file: File) {
    console.log(file);
    return {
      message: 'Arquivo recebido com sucesso',
      name: file.originalname,
    };
  }
}
