import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Utilizador autenticado extraído do JWT (preenchido pela JwtStrategy). */
export interface AuthUser {
  id: string;
  email: string;
}

/** Injeta o utilizador autenticado num handler: `@CurrentUser() user: AuthUser`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);
