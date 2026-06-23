import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  ActivityLevel,
  calculateNutrition,
  Goal,
  GoalIntensity,
  NutritionResult,
  Sex,
} from '@fitplan/shared';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'passwordHash'>;

interface NutritionTargetsCache {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    return this.sanitize(user);
  }

  async updateProfile(userId: string, dto: Partial<User>): Promise<SafeUser> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    // recalcular e cachear os alvos sempre que o perfil muda (PROJECT.md 5.6)
    const targets = this.computeTargets(updated);
    if (targets) {
      const saved = await this.prisma.user.update({
        where: { id: userId },
        data: targets,
      });
      return this.sanitize(saved);
    }
    return this.sanitize(updated);
  }

  /**
   * Resultado completo da calculadora (BMR, TDEE, macros, %) para o ecrã de
   * resultados. Devolve null se o perfil ainda não tiver dados suficientes.
   */
  async getNutrition(userId: string): Promise<NutritionResult | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    return this.computeResult(user);
  }

  /** Repor dados pessoais e alvos (mantém a conta). PROJECT.md secção 7 (definições). */
  async resetData(userId: string): Promise<SafeUser> {
    const saved = await this.prisma.user.update({
      where: { id: userId },
      data: {
        sex: null,
        age: null,
        weightKg: null,
        heightCm: null,
        activityLevel: null,
        goal: null,
        goalIntensity: null,
        targetCalories: null,
        targetProtein: null,
        targetCarbs: null,
        targetFat: null,
      },
    });
    return this.sanitize(saved);
  }

  // ---- internos -----------------------------------------------------------

  private computeResult(user: User): NutritionResult | null {
    if (
      user.sex &&
      user.age != null &&
      user.weightKg != null &&
      user.heightCm != null &&
      user.activityLevel &&
      user.goal
    ) {
      return calculateNutrition({
        sex: user.sex as Sex,
        age: user.age,
        weightKg: user.weightKg,
        heightCm: user.heightCm,
        activityLevel: user.activityLevel as ActivityLevel,
        goal: user.goal as Goal,
        goalIntensity: (user.goalIntensity as GoalIntensity | null) ?? undefined,
      });
    }
    return null;
  }

  private computeTargets(user: User): NutritionTargetsCache | null {
    const result = this.computeResult(user);
    if (!result) return null;
    return {
      targetCalories: result.targetCalories,
      targetProtein: result.macros.protein,
      targetCarbs: result.macros.carbs,
      targetFat: result.macros.fat,
    };
  }

  private sanitize(user: User): SafeUser {
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }
}
