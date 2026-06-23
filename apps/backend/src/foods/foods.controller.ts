import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { FoodsService } from './foods.service';

@Controller('foods')
@UseGuards(JwtAuthGuard)
export class FoodsController {
  constructor(private readonly foods: FoodsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('search') search?: string) {
    return this.foods.list(user.id, search);
  }

  /** Catálogo global de alimentos comuns predefinidos. */
  @Get('library')
  listLibrary(@Query('search') search?: string) {
    return this.foods.listLibrary(search);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFoodDto) {
    return this.foods.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFoodDto,
  ) {
    return this.foods.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.foods.remove(user.id, id);
  }
}
