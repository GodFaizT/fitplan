import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeFoodDto } from './dto/analyze.dto';
import { FoodVisionService } from './food-vision.service';

@Controller('food-vision')
@UseGuards(JwtAuthGuard)
export class FoodVisionController {
  constructor(private readonly vision: FoodVisionService) {}

  /** Indica ao frontend se deve mostrar o botão de análise por foto. */
  @Get('status')
  status() {
    return { enabled: this.vision.isEnabled() };
  }

  /** Cada análise tem custo — limite apertado (20/min por IP). */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('analyze')
  analyze(@Body() dto: AnalyzeFoodDto) {
    return this.vision.analyze(dto);
  }
}
