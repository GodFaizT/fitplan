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
import { UpsertMeasurementDto } from './dto/measurement.dto';
import { MeasurementsService } from './measurements.service';

@Controller('measurements')
@UseGuards(JwtAuthGuard)
export class MeasurementsController {
  constructor(private readonly measurements: MeasurementsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.measurements.list(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertMeasurementDto) {
    return this.measurements.upsert(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.measurements.remove(user.id, id);
  }
}
