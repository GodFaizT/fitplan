import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protege rotas: exige um access token JWT válido no header Authorization. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
