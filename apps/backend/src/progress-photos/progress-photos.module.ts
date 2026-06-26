import { Module } from '@nestjs/common';
import { ProgressPhotosController } from './progress-photos.controller';
import { ProgressPhotosService } from './progress-photos.service';

@Module({
  controllers: [ProgressPhotosController],
  providers: [ProgressPhotosService],
})
export class ProgressPhotosModule {}
