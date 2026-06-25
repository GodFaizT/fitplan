import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateDayDto,
  CreateExerciseDto,
  CreatePlanDto,
  JoinPlanDto,
  ReorderDto,
  UpdateDayDto,
  UpdateExerciseDto,
  UpdatePlanDto,
} from './dto/workout.dto';
import { WorkoutsService } from './workouts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workouts: WorkoutsService) {}

  // modelos de plano (prontos)
  @Get('plan-templates')
  listTemplates() {
    return this.workouts.listTemplates();
  }

  @Post('plan-templates/:id/create')
  createFromTemplate(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.createFromTemplate(u.id, id);
  }

  // agenda semanal
  @Get('workout-week')
  week(@CurrentUser() u: AuthUser) {
    return this.workouts.weekSchedule(u.id);
  }

  // planos
  @Get('plans')
  list(@CurrentUser() u: AuthUser) {
    return this.workouts.listPlans(u.id);
  }

  @Post('plans')
  create(@CurrentUser() u: AuthUser, @Body() dto: CreatePlanDto) {
    return this.workouts.createPlan(u.id, dto);
  }

  @Get('plans/:id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.getPlan(u.id, id);
  }

  @Patch('plans/:id')
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.workouts.updatePlan(u.id, id, dto);
  }

  @Delete('plans/:id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.deletePlan(u.id, id);
  }

  // partilha
  @Post('plans/:id/share')
  share(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.share(u.id, id);
  }

  @Post('plans/:id/unshare')
  unshare(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.unshare(u.id, id);
  }

  @Post('plans/join')
  join(@CurrentUser() u: AuthUser, @Body() dto: JoinPlanDto) {
    return this.workouts.joinByCode(u.id, dto.code);
  }

  @Post('plans/:id/reorder-days')
  reorderDays(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.workouts.reorderDays(u.id, id, dto.ids);
  }

  // dias
  @Post('plans/:id/days')
  addDay(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateDayDto,
  ) {
    return this.workouts.addDay(u.id, id, dto);
  }

  @Patch('days/:id')
  updateDay(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDayDto,
  ) {
    return this.workouts.updateDay(u.id, id, dto);
  }

  @Delete('days/:id')
  deleteDay(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.deleteDay(u.id, id);
  }

  @Post('days/:id/reorder-exercises')
  reorderExercises(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.workouts.reorderExercises(u.id, id, dto.ids);
  }

  // exercícios
  @Post('days/:id/exercises')
  addExercise(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.workouts.addExercise(u.id, id, dto);
  }

  @Patch('exercises/:id')
  updateExercise(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.workouts.updateExercise(u.id, id, dto);
  }

  @Delete('exercises/:id')
  deleteExercise(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.workouts.deleteExercise(u.id, id);
  }
}
