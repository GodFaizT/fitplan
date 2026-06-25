import { Module } from '@nestjs/common';
import { MealsModule } from '../meals/meals.module';
import { MealTemplatesController } from './meal-templates.controller';
import { MealTemplatesService } from './meal-templates.service';

@Module({
  imports: [MealsModule],
  controllers: [MealTemplatesController],
  providers: [MealTemplatesService],
})
export class MealTemplatesModule {}
