import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

const ADMIN = 'admin@fit.pt';

function makeService() {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'u1', role: 'user', approved: false, ...data }),
      ),
      update: vi.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'u1', email: 'a@b.pt', role: 'user', approved: true, ...data }),
      ),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue({ id: 'rt1' }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const jwt = { sign: vi.fn().mockReturnValue('access-token') };
  const config = {
    get: vi.fn(
      (k: string) =>
        ({
          JWT_ACCESS_SECRET: 'a'.repeat(40),
          JWT_ACCESS_TTL: '15m',
          JWT_REFRESH_TTL_DAYS: '30',
          ADMIN_EMAIL: ADMIN,
        })[k],
    ),
  };
  const notifications = {
    sendToUser: vi.fn(),
    isEnabled: vi.fn().mockReturnValue(false),
  };
  const service = new AuthService(
    prisma as never,
    jwt as never,
    config as never,
    notifications as never,
  );
  return { service, prisma, jwt, config, notifications };
}

describe('AuthService', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => {
    ctx = makeService();
  });

  describe('register', () => {
    it('utilizador normal fica pendente', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);
      const res = await ctx.service.register({
        email: 'a@b.pt',
        password: 'password123',
      } as never);
      expect(res).toEqual({ pending: true });
      const arg = ctx.prisma.user.create.mock.calls[0][0] as {
        data: { role: string; approved: boolean };
      };
      expect(arg.data.role).toBe('user');
      expect(arg.data.approved).toBe(false);
    });

    it('email admin fica aprovado e recebe tokens', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);
      ctx.prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: ADMIN,
        role: 'admin',
        approved: true,
      });
      const res = (await ctx.service.register({
        email: ADMIN,
        password: 'password123',
      } as never)) as { accessToken: string; user: { email: string } };
      expect(res.accessToken).toBe('access-token');
      expect(res.user.email).toBe(ADMIN);
    });

    it('email já existente → conflito', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        ctx.service.register({ email: 'a@b.pt', password: 'password123' } as never),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('password errada → não autorizado', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.pt',
        passwordHash: bcrypt.hashSync('correct', 10),
        approved: true,
        role: 'user',
      });
      await expect(
        ctx.service.login({ email: 'a@b.pt', password: 'wrong' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('utilizador inexistente → não autorizado', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        ctx.service.login({ email: 'x@y.pt', password: 'whatever123' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('conta não aprovada → proibido', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.pt',
        passwordHash: bcrypt.hashSync('password123', 10),
        approved: false,
        role: 'user',
      });
      await expect(
        ctx.service.login({ email: 'a@b.pt', password: 'password123' } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('credenciais válidas e aprovadas → tokens', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.pt',
        passwordHash: bcrypt.hashSync('password123', 10),
        approved: true,
        role: 'user',
      });
      const res = (await ctx.service.login({
        email: 'a@b.pt',
        password: 'password123',
      } as never)) as { accessToken: string };
      expect(res.accessToken).toBe('access-token');
    });
  });

  describe('changePassword', () => {
    it('password atual errada → bad request', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: bcrypt.hashSync('current123', 10),
      });
      await expect(
        ctx.service.changePassword('u1', 'wrong', 'newpassword123'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('correta → revoga todas as sessões e devolve tokens', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: bcrypt.hashSync('current123', 10),
      });
      const res = (await ctx.service.changePassword(
        'u1',
        'current123',
        'newpassword123',
      )) as { accessToken: string };
      expect(ctx.prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revoked: true } }),
      );
      expect(res.accessToken).toBe('access-token');
    });
  });
});
