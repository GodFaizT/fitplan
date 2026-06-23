import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Disponibiliza o PrismaService a toda a aplicação. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
