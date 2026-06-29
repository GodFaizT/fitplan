import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.users.getProfile(user.id);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Get('me/nutrition')
  nutrition(@CurrentUser() user: AuthUser) {
    return this.users.getNutrition(user.id);
  }

  @Get('me/export')
  exportData(@CurrentUser() user: AuthUser) {
    return this.users.exportData(user.id);
  }

  @Delete('me/data')
  reset(@CurrentUser() user: AuthUser) {
    return this.users.resetData(user.id);
  }
}
