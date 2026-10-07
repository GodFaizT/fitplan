import { Module } from '@nestjs/common';
import { FoodVisionController } from './food-vision.controller';
import { FoodVisionService } from './food-vision.service';

@Module({
  controllers: [FoodVisionController],
  providers: [FoodVisionService],
})
export class FoodVisionModule {}
