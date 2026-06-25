import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDayDto,
  CreateExerciseDto,
  CreatePlanDto,
  UpdateDayDto,
  UpdateExerciseDto,
  UpdatePlanDto,
} from './dto/workout.dto';
import { WORKOUT_TEMPLATES } from './templates.data';

const fullPlanInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    select: { userId: true, role: true, user: { select: { name: true, email: true } } },
  },
  days: {
    orderBy: { position: 'asc' as const },
    include: { exercises: { orderBy: { position: 'asc' as const } } },
  },
} satisfies Prisma.WorkoutPlanInclude;

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- planos -------------------------------------------------------------

  /** Planos próprios e partilhados (onde é membro). PROJECT.md 7. */
  listPlans(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { days: true } },
      },
    });
  }

  async getPlan(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
      include: fullPlanInclude,
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    const isMember = plan.members.some((m) => m.userId === userId);
    if (plan.ownerId !== userId && !isMember) {
      throw new ForbiddenException('Sem acesso a este plano');
    }
    return plan;
  }

  createPlan(userId: string, dto: CreatePlanDto) {
    return this.prisma.workoutPlan.create({
      data: { ownerId: userId, name: dto.name },
      include: fullPlanInclude,
    });
  }

  // ---- modelos de plano (prontos a usar) ---------------------------------

  /** Lista os modelos disponíveis (resumo para pré-visualização). */
  listTemplates() {
    return WORKOUT_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      daysPerWeek: t.daysPerWeek,
      level: t.level,
      focus: t.focus,
      days: t.days.map((d) => ({
        label: d.label,
        title: d.title,
        exercises: d.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        })),
      })),
    }));
  }

  /**
   * Cria um plano do utilizador a partir de um modelo, resolvendo cada
   * exercício na biblioteca (imagens + instruções) pelo `slug`. Se um slug não
   * existir, o exercício fica na mesma com nome/músculo definidos no modelo.
   */
  async createFromTemplate(userId: string, templateId: string) {
    const tpl = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) throw new NotFoundException('Modelo não encontrado');

    const slugs = [
      ...new Set(tpl.days.flatMap((d) => d.exercises.map((e) => e.slug))),
    ];
    const lib = await this.prisma.exerciseLibrary.findMany({
      where: { slug: { in: slugs } },
    });
    const bySlug = new Map(lib.map((l) => [l.slug, l]));

    return this.prisma.workoutPlan.create({
      data: {
        ownerId: userId,
        name: tpl.name,
        days: {
          create: tpl.days.map((d, di) => ({
            label: d.label,
            title: d.title,
            position: di,
            exercises: {
              create: d.exercises.map((e, ei) => {
                const l = bySlug.get(e.slug);
                const instructions = l
                  ? l.instructionsPt.length
                    ? l.instructionsPt
                    : l.instructions
                  : [];
                return {
                  libraryId: l?.id ?? null,
                  name: e.name,
                  muscleGroup: e.muscle,
                  sets: e.sets,
                  reps: e.reps,
                  restSeconds: e.rest,
                  imageUrls: l?.imageUrls ?? [],
                  instructions,
                  position: ei,
                };
              }),
            },
          })),
        },
      },
      include: fullPlanInclude,
    });
  }

  async updatePlan(userId: string, planId: string, dto: UpdatePlanDto) {
    await this.ensureOwner(userId, planId);
    return this.prisma.workoutPlan.update({
      where: { id: planId },
      data: dto,
      include: fullPlanInclude,
    });
  }

  async deletePlan(userId: string, planId: string) {
    await this.ensureOwner(userId, planId);
    await this.prisma.workoutPlan.delete({ where: { id: planId } });
    return { ok: true };
  }

  // ---- dias ---------------------------------------------------------------

  async addDay(userId: string, planId: string, dto: CreateDayDto) {
    await this.ensureOwner(userId, planId);
    const count = await this.prisma.workoutDay.count({ where: { planId } });
    return this.prisma.workoutDay.create({
      data: { planId, label: dto.label, title: dto.title, position: count },
      include: { exercises: true },
    });
  }

  async updateDay(userId: string, dayId: string, dto: UpdateDayDto) {
    await this.ensureDayOwner(userId, dayId);
    return this.prisma.workoutDay.update({ where: { id: dayId }, data: dto });
  }

  async deleteDay(userId: string, dayId: string) {
    await this.ensureDayOwner(userId, dayId);
    await this.prisma.workoutDay.delete({ where: { id: dayId } });
    return { ok: true };
  }

  /** Reordenar dias dentro de um plano (persistir position). PROJECT.md 6.3. */
  async reorderDays(userId: string, planId: string, ids: string[]) {
    await this.ensureOwner(userId, planId);
    await this.prisma.$transaction(
      ids.map((id, position) =>
        this.prisma.workoutDay.updateMany({
          where: { id, planId },
          data: { position },
        }),
      ),
    );
    return { ok: true };
  }

  // ---- exercícios ---------------------------------------------------------

  async addExercise(userId: string, dayId: string, dto: CreateExerciseDto) {
    await this.ensureDayOwner(userId, dayId);
    const count = await this.prisma.exercise.count({ where: { dayId } });
    return this.prisma.exercise.create({
      data: {
        dayId,
        libraryId: dto.libraryId,
        name: dto.name,
        muscleGroup: dto.muscleGroup,
        sets: dto.sets,
        reps: dto.reps,
        restSeconds: dto.restSeconds,
        weight: dto.weight,
        videoUrl: dto.videoUrl,
        notes: dto.notes,
        imageUrls: dto.imageUrls ?? [],
        instructions: dto.instructions ?? [],
        position: count,
      },
    });
  }

  async updateExercise(userId: string, exerciseId: string, dto: UpdateExerciseDto) {
    await this.ensureExerciseOwner(userId, exerciseId);
    return this.prisma.exercise.update({ where: { id: exerciseId }, data: dto });
  }

  async deleteExercise(userId: string, exerciseId: string) {
    await this.ensureExerciseOwner(userId, exerciseId);
    await this.prisma.exercise.delete({ where: { id: exerciseId } });
    return { ok: true };
  }

  async reorderExercises(userId: string, dayId: string, ids: string[]) {
    await this.ensureDayOwner(userId, dayId);
    await this.prisma.$transaction(
      ids.map((id, position) =>
        this.prisma.exercise.updateMany({
          where: { id, dayId },
          data: { position },
        }),
      ),
    );
    return { ok: true };
  }

  // ---- partilha (6.5a — modo cópia) --------------------------------------

  /** Marca o plano como partilhado e gera/devolve um código de partilha. */
  async share(userId: string, planId: string) {
    await this.ensureOwner(userId, planId);
    const existing = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
    });
    const shareCode = existing?.shareCode ?? (await this.uniqueShareCode());
    const plan = await this.prisma.workoutPlan.update({
      where: { id: planId },
      data: { isShared: true, shareCode },
    });
    return { shareCode: plan.shareCode };
  }

  async unshare(userId: string, planId: string) {
    await this.ensureOwner(userId, planId);
    await this.prisma.workoutPlan.update({
      where: { id: planId },
      data: { isShared: false },
    });
    return { ok: true };
  }

  /**
   * Aderir por código → COPIA o plano para a conta do utilizador (6.5a).
   * Cada um edita a sua cópia sem afetar os outros.
   */
  async joinByCode(userId: string, code: string) {
    const source = await this.prisma.workoutPlan.findFirst({
      where: { shareCode: code, isShared: true },
      include: { days: { include: { exercises: true } } },
    });
    if (!source) throw new NotFoundException('Código de partilha inválido');

    const copy = await this.prisma.workoutPlan.create({
      data: {
        ownerId: userId,
        name: source.name,
        days: {
          create: source.days.map((d) => ({
            label: d.label,
            title: d.title,
            position: d.position,
            exercises: {
              create: d.exercises.map((e) => ({
                libraryId: e.libraryId,
                name: e.name,
                muscleGroup: e.muscleGroup,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                weight: e.weight,
                videoUrl: e.videoUrl,
                notes: e.notes,
                imageUrls: e.imageUrls,
                instructions: e.instructions,
                position: e.position,
              })),
            },
          })),
        },
      },
      include: fullPlanInclude,
    });
    return copy;
  }

  // ---- helpers de autorização --------------------------------------------

  private async ensureOwner(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
      select: { ownerId: true },
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    if (plan.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode editar este plano');
    }
  }

  private async ensureDayOwner(userId: string, dayId: string) {
    const day = await this.prisma.workoutDay.findUnique({
      where: { id: dayId },
      include: { plan: { select: { ownerId: true } } },
    });
    if (!day) throw new NotFoundException('Dia não encontrado');
    if (day.plan.ownerId !== userId) {
      throw new ForbiddenException('Sem acesso');
    }
  }

  private async ensureExerciseOwner(userId: string, exerciseId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { day: { include: { plan: { select: { ownerId: true } } } } },
    });
    if (!exercise) throw new NotFoundException('Exercício não encontrado');
    if (exercise.day.plan.ownerId !== userId) {
      throw new ForbiddenException('Sem acesso');
    }
  }

  private async uniqueShareCode(): Promise<string> {
    // até 5 tentativas para evitar colisão (improvável)
    for (let i = 0; i < 5; i++) {
      const code = randomBytes(5).toString('hex'); // 10 caracteres
      const clash = await this.prisma.workoutPlan.findUnique({
        where: { shareCode: code },
      });
      if (!clash) return code;
    }
    throw new Error('Não foi possível gerar um código de partilha');
  }
}
