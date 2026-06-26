import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProgressPhotoDto } from './dto/progress-photo.dto';
import { ProgressPhotosService } from './progress-photos.service';

@Controller('progress-photos')
@UseGuards(JwtAuthGuard)
export class ProgressPhotosController {
  constructor(private readonly photos: ProgressPhotosService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.photos.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProgressPhotoDto) {
    return this.photos.create(user.id, dto);
  }

  @Get(':id/image')
  async image(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const photo = await this.photos.image(user.id, id);
    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.send(Buffer.from(photo.data));
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.photos.remove(user.id, id);
  }
}
