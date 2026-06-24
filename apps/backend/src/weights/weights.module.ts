import { Module } from '@nestjs/common';
import { WeightsController } from './weights.controller';
import { WeightsService } from './weights.service';

@Module({
  controllers: [WeightsController],
  providers: [WeightsService],
})
export class WeightsModule {}
