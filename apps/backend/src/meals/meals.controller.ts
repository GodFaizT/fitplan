import {
  BadRequestException,
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
import {
  AddItemDto,
  AddMealDto,
  UpdateItemDto,
  UpdateMealDto,
} from './dto/meal.dto';
import { MealsService } from './meals.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly meals: MealsService) {}

  /** GET /logs?date=YYYY-MM-DD — registo do dia. */
  @Get('logs')
  getLog(@CurrentUser() user: AuthUser, @Query('date') date?: string) {
    if (!date) throw new BadRequestException('Parâmetro "date" obrigatório');
    return this.meals.getLog(user.id, date);
  }

  /** GET /recent-foods — alimentos recentes para re-adicionar rápido. */
  @Get('recent-foods')
  recentFoods(@CurrentUser() user: AuthUser) {
    return this.meals.recentFoods(user.id);
  }

  /** POST /logs/:date/copy — copia as refeições de outro dia (body: { from }). */
  @Post('logs/:date/copy')
  copyDay(
    @CurrentUser() user: AuthUser,
    @Param('date') date: string,
    @Body('from') from: string,
  ) {
    if (!from) throw new BadRequestException('Campo "from" obrigatório');
    return this.meals.copyDay(user.id, date, from);
  }

  @Post('logs/:date/meals')
  addMeal(
    @CurrentUser() user: AuthUser,
    @Param('date') date: string,
    @Body() dto: AddMealDto,
  ) {
    return this.meals.addMeal(user.id, date, dto);
  }

  @Patch('meals/:id')
  updateMeal(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.meals.updateMeal(user.id, id, dto);
  }

  @Delete('meals/:id')
  deleteMeal(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.meals.deleteMeal(user.id, id);
  }

  @Post('meals/:id/duplicate')
  duplicate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('date') date: string,
  ) {
    if (!date) throw new BadRequestException('Campo "date" obrigatório');
    return this.meals.duplicateMeal(user.id, id, date);
  }

  @Post('meals/:id/items')
  addItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddItemDto,
  ) {
    return this.meals.addItem(user.id, id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.meals.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  deleteItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.meals.deleteItem(user.id, id);
  }
}
