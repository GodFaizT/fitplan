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
import { CardioService } from './cardio.service';
import { CreateCardioDto } from './dto/cardio.dto';

@Controller('cardio')
@UseGuards(JwtAuthGuard)
export class CardioController {
  constructor(private readonly cardio: CardioService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.cardio.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCardioDto) {
    return this.cardio.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cardio.remove(user.id, id);
  }
}
