import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthResult, AuthService } from './auth.service';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    if ('pending' in result) return { pending: true };
    return this.respond(result, res);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    return this.respond(result, res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = this.readRefreshToken(req);
    const result = await this.auth.refresh(raw);
    return this.respond(result, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = this.readRefreshToken(req);
    await this.auth.logout(raw);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  // ---- helpers ------------------------------------------------------------

  /** Devolve access token + user no corpo e poisa o refresh token em cookie httpOnly. */
  private respond(result: AuthResult, res: Response) {
    if (this.useCookie()) {
      this.setRefreshCookie(res, result.refreshToken);
      return { accessToken: result.accessToken, user: result.user };
    }
    // alternativa: devolver o refresh token no corpo (cliente guarda com cuidado)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  private useCookie(): boolean {
    return (this.config.get<string>('USE_REFRESH_COOKIE') ?? 'true') === 'true';
  }

  private readRefreshToken(req: Request): string | undefined {
    const fromCookie = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    const fromBody = (req.body as { refreshToken?: string } | undefined)
      ?.refreshToken;
    return fromCookie ?? fromBody;
  }

  private setRefreshCookie(res: Response, token: string): void {
    const days = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? '30');
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.cookieSecure(),
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Cookie `Secure` exige HTTPS. Em produção com domínio/HTTPS deixar a true.
   * Para correr sobre http://IP (sem domínio) define COOKIE_SECURE=false.
   */
  private cookieSecure(): boolean {
    const explicit = this.config.get<string>('COOKIE_SECURE');
    if (explicit != null) return explicit === 'true';
    return process.env.NODE_ENV === 'production';
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }
}
