import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [],
  controllers: [AppController, UploadController],
  providers: [AppService, UploadService],
})
export class AppModule {}
