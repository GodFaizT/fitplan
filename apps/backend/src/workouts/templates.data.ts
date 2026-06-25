/**
 * Modelos de plano de treino prontos a usar (3 e 5 dias).
 * Cada exercício liga-se à biblioteca (Free Exercise DB) pelo `slug`, de onde
 * vêm imagens e instruções; o `name`/`muscle` aqui é o rótulo PT limpo usado
 * no plano criado. Splits comuns e comprovados (Full Body, PPL, etc.).
 */
export interface TemplateExercise {
  slug: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface TemplateDay {
  label: string;
  title: string;
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  level: string; // Iniciante | Intermédio | Avançado
  focus: string;
  days: TemplateDay[];
}

const E = (
  slug: string,
  name: string,
  muscle: string,
  sets: number,
  reps: string,
  rest: number,
): TemplateExercise => ({ slug, name, muscle, sets, reps, rest });

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'full-body-3d',
    name: 'Full Body · 3 dias',
    description:
      'Corpo inteiro 3x por semana. Ideal para começar ou para quem tem pouco tempo — muito trabalho composto e frequência alta por músculo.',
    daysPerWeek: 3,
    level: 'Iniciante',
    focus: 'Corpo inteiro',
    days: [
      {
        label: 'Dia A',
        title: 'Corpo inteiro A',
        exercises: [
          E('Barbell_Squat', 'Agachamento com barra', 'quadriceps', 3, '8-10', 120),
          E('Barbell_Bench_Press_-_Medium_Grip', 'Supino com barra', 'chest', 3, '8-10', 120),
          E('Bent_Over_Barbell_Row', 'Remada curvada com barra', 'back', 3, '8-10', 120),
          E('Dumbbell_Shoulder_Press', 'Press de ombros com halteres', 'shoulders', 3, '10-12', 90),
          E('Plank', 'Prancha', 'abdominals', 3, '40s', 60),
        ],
      },
      {
        label: 'Dia B',
        title: 'Corpo inteiro B',
        exercises: [
          E('Romanian_Deadlift', 'Peso morto romeno', 'hamstrings', 3, '8-10', 120),
          E('Wide-Grip_Lat_Pulldown', 'Puxada no pulley (pega larga)', 'lats', 3, '10-12', 90),
          E('Incline_Dumbbell_Press', 'Supino inclinado com halteres', 'chest', 3, '10-12', 90),
          E('Leg_Press', 'Leg press', 'quadriceps', 3, '12', 90),
          E('Hanging_Leg_Raise', 'Elevação de pernas suspenso', 'abdominals', 3, '12', 60),
        ],
      },
      {
        label: 'Dia C',
        title: 'Corpo inteiro C',
        exercises: [
          E('Barbell_Deadlift', 'Peso morto com barra', 'back', 3, '5', 150),
          E('Pullups', 'Elevações (pull-up)', 'lats', 3, '6-8', 120),
          E('Dips_-_Chest_Version', 'Dips (peito)', 'chest', 3, '10-12', 90),
          E('Side_Lateral_Raise', 'Elevação lateral', 'shoulders', 3, '15', 45),
          E('Barbell_Curl', 'Curl com barra', 'biceps', 3, '12', 60),
          E('Triceps_Pushdown', 'Extensão de tríceps no pulley', 'triceps', 3, '12', 60),
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    id: 'ppl-3d',
    name: 'Push Pull Legs · 3 dias',
    description:
      'Empurrar, puxar e pernas — uma vez por semana cada. Clássico para intermédios que treinam 3 dias com um foco claro por sessão.',
    daysPerWeek: 3,
    level: 'Intermédio',
    focus: 'Hipertrofia',
    days: [
      {
        label: 'Push',
        title: 'Empurrar (peito · ombros · tríceps)',
        exercises: [
          E('Barbell_Bench_Press_-_Medium_Grip', 'Supino com barra', 'chest', 4, '6-8', 150),
          E('Dumbbell_Shoulder_Press', 'Press de ombros com halteres', 'shoulders', 3, '8-10', 120),
          E('Incline_Dumbbell_Press', 'Supino inclinado com halteres', 'chest', 3, '10-12', 90),
          E('Side_Lateral_Raise', 'Elevação lateral', 'shoulders', 3, '15', 45),
          E('Triceps_Pushdown', 'Extensão de tríceps no pulley', 'triceps', 3, '12', 60),
          E('Dips_-_Triceps_Version', 'Dips (tríceps)', 'triceps', 3, '10', 90),
        ],
      },
      {
        label: 'Pull',
        title: 'Puxar (costas · bíceps)',
        exercises: [
          E('Barbell_Deadlift', 'Peso morto com barra', 'back', 3, '5', 180),
          E('Pullups', 'Elevações (pull-up)', 'lats', 4, '8', 120),
          E('Seated_Cable_Rows', 'Remada sentada no cabo', 'back', 3, '10-12', 90),
          E('Face_Pull', 'Face pull', 'shoulders', 3, '15', 60),
          E('Barbell_Curl', 'Curl com barra', 'biceps', 3, '10', 60),
          E('Hammer_Curls', 'Curl martelo', 'biceps', 3, '12', 60),
        ],
      },
      {
        label: 'Legs',
        title: 'Pernas',
        exercises: [
          E('Barbell_Squat', 'Agachamento com barra', 'quadriceps', 4, '6-8', 150),
          E('Romanian_Deadlift', 'Peso morto romeno', 'hamstrings', 3, '8-10', 120),
          E('Leg_Press', 'Leg press', 'quadriceps', 3, '12', 90),
          E('Lying_Leg_Curls', 'Flexão de pernas deitado', 'hamstrings', 3, '12', 75),
          E('Standing_Calf_Raises', 'Elevação de gémeos em pé', 'calves', 4, '15', 45),
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    id: 'bro-split-5d',
    name: 'Split por grupo · 5 dias',
    description:
      'Um grupo muscular por dia (peito · costas · pernas · ombros · braços). Muito volume por músculo — para quem treina 5 dias e já tem experiência.',
    daysPerWeek: 5,
    level: 'Intermédio',
    focus: 'Hipertrofia',
    days: [
      {
        label: 'Peito',
        title: 'Peito',
        exercises: [
          E('Barbell_Bench_Press_-_Medium_Grip', 'Supino com barra', 'chest', 4, '6-8', 150),
          E('Incline_Dumbbell_Press', 'Supino inclinado com halteres', 'chest', 4, '8-10', 120),
          E('Dumbbell_Flyes', 'Aberturas com halteres', 'chest', 3, '12', 75),
          E('Dips_-_Chest_Version', 'Dips (peito)', 'chest', 3, '10', 90),
        ],
      },
      {
        label: 'Costas',
        title: 'Costas',
        exercises: [
          E('Barbell_Deadlift', 'Peso morto com barra', 'back', 4, '5', 180),
          E('Pullups', 'Elevações (pull-up)', 'lats', 4, '8', 120),
          E('Bent_Over_Barbell_Row', 'Remada curvada com barra', 'back', 4, '8-10', 120),
          E('Seated_Cable_Rows', 'Remada sentada no cabo', 'back', 3, '12', 90),
          E('Face_Pull', 'Face pull', 'shoulders', 3, '15', 60),
        ],
      },
      {
        label: 'Pernas',
        title: 'Pernas',
        exercises: [
          E('Barbell_Squat', 'Agachamento com barra', 'quadriceps', 4, '6-8', 150),
          E('Romanian_Deadlift', 'Peso morto romeno', 'hamstrings', 3, '8-10', 120),
          E('Leg_Press', 'Leg press', 'quadriceps', 3, '12', 90),
          E('Lying_Leg_Curls', 'Flexão de pernas deitado', 'hamstrings', 3, '12', 75),
          E('Standing_Calf_Raises', 'Elevação de gémeos em pé', 'calves', 4, '15', 45),
        ],
      },
      {
        label: 'Ombros',
        title: 'Ombros',
        exercises: [
          E('Standing_Military_Press', 'Press militar em pé', 'shoulders', 4, '6-8', 150),
          E('Dumbbell_Shoulder_Press', 'Press de ombros com halteres', 'shoulders', 3, '10', 90),
          E('Side_Lateral_Raise', 'Elevação lateral', 'shoulders', 4, '15', 45),
          E('Reverse_Flyes', 'Aberturas invertidas (posterior)', 'shoulders', 3, '15', 60),
          E('Front_Dumbbell_Raise', 'Elevação frontal', 'shoulders', 3, '12', 60),
        ],
      },
      {
        label: 'Braços',
        title: 'Braços (bíceps · tríceps)',
        exercises: [
          E('Barbell_Curl', 'Curl com barra', 'biceps', 4, '8-10', 90),
          E('Close-Grip_Barbell_Bench_Press', 'Supino fechado', 'triceps', 4, '8-10', 90),
          E('Hammer_Curls', 'Curl martelo', 'biceps', 3, '12', 60),
          E('Triceps_Pushdown', 'Extensão de tríceps no pulley', 'triceps', 3, '12', 60),
          E('Preacher_Curl', 'Curl Scott (preacher)', 'biceps', 3, '12', 60),
          E('Cable_Rope_Overhead_Triceps_Extension', 'Extensão de tríceps acima da cabeça', 'triceps', 3, '12', 60),
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    id: 'ppl-ul-5d',
    name: 'PPL + Upper/Lower · 5 dias',
    description:
      'Híbrido forte para 5 dias: Empurrar, Puxar, Pernas, Superior e Inferior. Frequência alta e bom equilíbrio entre força e volume.',
    daysPerWeek: 5,
    level: 'Avançado',
    focus: 'Força e hipertrofia',
    days: [
      {
        label: 'Push',
        title: 'Empurrar',
        exercises: [
          E('Barbell_Bench_Press_-_Medium_Grip', 'Supino com barra', 'chest', 4, '6-8', 150),
          E('Dumbbell_Shoulder_Press', 'Press de ombros com halteres', 'shoulders', 3, '10', 90),
          E('Incline_Dumbbell_Press', 'Supino inclinado com halteres', 'chest', 3, '10', 90),
          E('Side_Lateral_Raise', 'Elevação lateral', 'shoulders', 3, '15', 45),
          E('Triceps_Pushdown', 'Extensão de tríceps no pulley', 'triceps', 3, '12', 60),
          E('Dips_-_Triceps_Version', 'Dips (tríceps)', 'triceps', 3, '10', 90),
        ],
      },
      {
        label: 'Pull',
        title: 'Puxar',
        exercises: [
          E('Pullups', 'Elevações (pull-up)', 'lats', 4, '8', 120),
          E('Bent_Over_Barbell_Row', 'Remada curvada com barra', 'back', 4, '8', 120),
          E('Seated_Cable_Rows', 'Remada sentada no cabo', 'back', 3, '12', 90),
          E('Face_Pull', 'Face pull', 'shoulders', 3, '15', 60),
          E('Barbell_Curl', 'Curl com barra', 'biceps', 3, '10', 60),
          E('Hammer_Curls', 'Curl martelo', 'biceps', 3, '12', 60),
        ],
      },
      {
        label: 'Legs',
        title: 'Pernas',
        exercises: [
          E('Barbell_Squat', 'Agachamento com barra', 'quadriceps', 4, '6-8', 150),
          E('Romanian_Deadlift', 'Peso morto romeno', 'hamstrings', 3, '8', 120),
          E('Leg_Press', 'Leg press', 'quadriceps', 3, '12', 90),
          E('Lying_Leg_Curls', 'Flexão de pernas deitado', 'hamstrings', 3, '12', 75),
          E('Standing_Calf_Raises', 'Elevação de gémeos em pé', 'calves', 4, '15', 45),
        ],
      },
      {
        label: 'Superior',
        title: 'Superior (Upper)',
        exercises: [
          E('Incline_Dumbbell_Press', 'Supino inclinado com halteres', 'chest', 4, '8', 120),
          E('Wide-Grip_Lat_Pulldown', 'Puxada no pulley (pega larga)', 'lats', 4, '10', 90),
          E('Dumbbell_Shoulder_Press', 'Press de ombros com halteres', 'shoulders', 3, '10', 90),
          E('Seated_Cable_Rows', 'Remada sentada no cabo', 'back', 3, '12', 90),
          E('Side_Lateral_Raise', 'Elevação lateral', 'shoulders', 3, '15', 45),
          E('Dumbbell_Bicep_Curl', 'Curl com halteres', 'biceps', 3, '12', 60),
          E('Triceps_Pushdown', 'Extensão de tríceps no pulley', 'triceps', 3, '12', 60),
        ],
      },
      {
        label: 'Inferior',
        title: 'Inferior (Lower)',
        exercises: [
          E('Barbell_Squat', 'Agachamento com barra', 'quadriceps', 4, '6', 150),
          E('Romanian_Deadlift', 'Peso morto romeno', 'hamstrings', 3, '8', 120),
          E('Leg_Press', 'Leg press', 'quadriceps', 3, '12', 90),
          E('Seated_Leg_Curl', 'Flexão de pernas sentado', 'hamstrings', 3, '12', 75),
          E('Standing_Calf_Raises', 'Elevação de gémeos em pé', 'calves', 4, '15', 45),
          E('Hanging_Leg_Raise', 'Elevação de pernas suspenso', 'abdominals', 3, '12', 60),
        ],
      },
    ],
  },
];
