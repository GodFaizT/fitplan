import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('muscle') muscle?: string,
    @Query('equipment') equipment?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exercises.list({
      search,
      muscle,
      equipment,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('facets')
  facets() {
    return this.exercises.facets();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.exercises.get(id);
  }
}
