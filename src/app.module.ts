import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './modules/file-uploads/controller/file.controller';

@Module({
  imports: [],
  controllers: [AppController, FileController],
  providers: [AppService],
})
export class AppModule {}
