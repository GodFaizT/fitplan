import { Module } from '@nestjs/common';
import { CardioController } from './cardio.controller';
import { CardioService } from './cardio.service';

@Module({
  controllers: [CardioController],
  providers: [CardioService],
})
export class CardioModule {}
