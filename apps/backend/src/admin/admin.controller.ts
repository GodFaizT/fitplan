import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  list(@Query('pending') pending?: string) {
    return this.admin.listUsers(pending === 'true');
  }

  @Post('users/:id/approve')
  approve(@Param('id') id: string) {
    return this.admin.approve(id);
  }

  @Post('users/:id/reject')
  reject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.admin.reject(user.id, id);
  }
}
