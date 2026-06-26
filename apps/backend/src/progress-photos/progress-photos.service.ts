import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressPhotoDto } from './dto/progress-photo.dto';

/** Apenas os metadados (sem os bytes da imagem) — para listagens leves. */
const META_SELECT = {
  id: true,
  date: true,
  note: true,
  width: true,
  height: true,
  createdAt: true,
} as const;

/** Extrai mime + bytes de um data URL de imagem (jpeg/png/webp). */
function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return null;
  try {
    // Uint8Array com ArrayBuffer próprio (Prisma Bytes = Uint8Array em Prisma 6).
    const decoded = Buffer.from(m[2], 'base64');
    if (decoded.length === 0 || decoded.length > 6_000_000) return null;
    const bytes = new Uint8Array(decoded.length);
    bytes.set(decoded);
    return { mime: m[1], bytes };
  } catch {
    return null;
  }
}

@Injectable()
export class ProgressPhotosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Metadados de todas as fotos do utilizador (recentes primeiro). */
  list(userId: string) {
    return this.prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: META_SELECT,
    });
  }

  async create(userId: string, dto: CreateProgressPhotoDto) {
    const parsed = parseDataUrl(dto.dataUrl);
    if (!parsed) throw new BadRequestException('Imagem inválida');
    return this.prisma.progressPhoto.create({
      data: {
        userId,
        date: new Date(`${dto.date}T00:00:00.000Z`),
        note: dto.note?.trim() || null,
        mimeType: parsed.mime,
        data: parsed.bytes,
        width: dto.width ?? null,
        height: dto.height ?? null,
      },
      select: META_SELECT,
    });
  }

  /** Bytes + mime de uma foto (para servir a imagem). */
  async image(userId: string, id: string) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id },
      select: { userId: true, mimeType: true, data: true },
    });
    if (!photo || photo.userId !== userId) {
      throw new NotFoundException('Foto não encontrada');
    }
    return { mimeType: photo.mimeType, data: photo.data };
  }

  async remove(userId: string, id: string) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!photo || photo.userId !== userId) {
      throw new NotFoundException('Foto não encontrada');
    }
    await this.prisma.progressPhoto.delete({ where: { id } });
    return { ok: true };
  }
}
