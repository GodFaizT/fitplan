import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/** Utilizador sem campos sensíveis, seguro para devolver ao cliente. */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---- API pública --------------------------------------------------------

  async register(dto: RegisterDto): Promise<AuthResult | { pending: true }> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Já existe uma conta com este email');
    }

    const isAdmin = email === this.adminEmail();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name?.trim() || null,
        role: isAdmin ? 'admin' : 'user',
        approved: isAdmin, // só o admin entra logo; restantes ficam pendentes
      },
    });

    if (!user.approved) return { pending: true };
    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // garante que o email admin configurado é sempre admin + aprovado
    if (email === this.adminEmail() && (user.role !== 'admin' || !user.approved)) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin', approved: true },
      });
    }

    if (!user.approved) {
      throw new ForbiddenException(
        'A tua conta está a aguardar aprovação do administrador.',
      );
    }

    return this.buildAuthResult(user);
  }

  /** Troca um refresh token válido por novos tokens (rotação). */
  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) {
      throw new UnauthorizedException('Refresh token em falta');
    }
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    });
    if (!stored) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    // rotação: revoga o token usado e emite um novo
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      throw new UnauthorizedException('Sessão inválida');
    }
    return this.buildAuthResult(user);
  }

  /** Revoga o refresh token (logout). */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    });
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.sanitize(user);
  }

  // ---- Internos -----------------------------------------------------------

  /** Email do administrador (ADMIN_EMAIL), normalizado. */
  private adminEmail(): string | null {
    const email = this.config.get<string>('ADMIN_EMAIL');
    return email ? email.toLowerCase().trim() : null;
  }

  private async buildAuthResult(user: User): Promise<AuthResult> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken, user: this.sanitize(user) };
  }

  private signAccessToken(user: User): string {
    return this.jwt.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL') ?? '15m',
      },
    );
  }

  /** Gera um refresh token opaco, guarda apenas o seu hash, devolve o token cru. */
  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    const days = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? '30');
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(raw), expiresAt },
    });
    return raw;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private sanitize(user: User): SafeUser {
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }
}
