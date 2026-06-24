import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertWeightDto } from './dto/weight.dto';
import { WeightsService } from './weights.service';

@Controller('weights')
@UseGuards(JwtAuthGuard)
export class WeightsController {
  constructor(private readonly weights: WeightsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.weights.list(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertWeightDto) {
    return this.weights.upsert(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.weights.remove(user.id, id);
  }
}
