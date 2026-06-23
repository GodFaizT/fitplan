import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_FACTORS,
  calcBmr,
  calcMacros,
  calcTdee,
  calculateNutrition,
  goalAdjustment,
  proteinFactor,
  scaleNutrition,
} from './nutrition';

describe('calcBmr (Mifflin-St Jeor)', () => {
  it('homem: 80kg, 180cm, 30 anos', () => {
    // (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calcBmr({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBe(1780);
  });

  it('mulher: 65kg, 165cm, 28 anos', () => {
    // (10*65) + (6.25*165) - (5*28) - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
    expect(calcBmr({ sex: 'female', weightKg: 65, heightCm: 165, age: 28 })).toBeCloseTo(1380.25);
  });
});

describe('calcTdee', () => {
  it('aplica o fator de atividade', () => {
    expect(calcTdee(1780, 'moderate')).toBeCloseTo(1780 * 1.55);
    expect(ACTIVITY_FACTORS.sedentary).toBe(1.2);
    expect(ACTIVITY_FACTORS.extra).toBe(1.9);
  });
});

describe('goalAdjustment', () => {
  it('manter = 0', () => {
    expect(goalAdjustment('maintain')).toBe(0);
  });

  it('perder gordura por intensidade', () => {
    expect(goalAdjustment('lose', 'light')).toBe(-0.1);
    expect(goalAdjustment('lose', 'moderate')).toBe(-0.2);
    expect(goalAdjustment('lose', 'aggressive')).toBe(-0.25);
  });

  it('ganhar massa por intensidade', () => {
    expect(goalAdjustment('gain', 'light')).toBe(0.05);
    expect(goalAdjustment('gain', 'moderate')).toBe(0.1);
    expect(goalAdjustment('gain', 'aggressive')).toBe(0.15);
  });

  it('sem intensidade assume moderado', () => {
    expect(goalAdjustment('lose')).toBe(-0.2);
    expect(goalAdjustment('gain')).toBe(0.1);
  });
});

describe('proteinFactor', () => {
  it('por objetivo', () => {
    expect(proteinFactor('lose')).toBe(2.2);
    expect(proteinFactor('maintain')).toBe(1.8);
    expect(proteinFactor('gain')).toBe(2.0);
  });
});

describe('calcMacros', () => {
  it('clamp a 0 e aviso quando as calorias são demasiado baixas', () => {
    // 120kg em défice: proteína=264g (1056 kcal) + gordura 25% > 1000 kcal
    const { macros, warning } = calcMacros(1000, 120, 'lose');
    expect(macros.protein).toBe(264);
    expect(macros.carbs).toBe(0);
    expect(warning).toBeDefined();
  });

  it('sem aviso num caso normal', () => {
    const { warning } = calcMacros(2759, 80, 'maintain');
    expect(warning).toBeUndefined();
  });
});

describe('calculateNutrition (end-to-end)', () => {
  it('homem, manter, moderadamente ativo', () => {
    const r = calculateNutrition({
      sex: 'male',
      age: 30,
      weightKg: 80,
      heightCm: 180,
      activityLevel: 'moderate',
      goal: 'maintain',
    });
    expect(r.bmr).toBe(1780);
    expect(r.tdee).toBe(2759); // round(1780 * 1.55)
    expect(r.targetCalories).toBe(2759); // manter = 0%
    expect(r.macros.protein).toBe(144); // 80 * 1.8
    expect(r.macros.fat).toBe(77); // round(2759 * 0.25 / 9)
    expect(r.macros.carbs).toBe(373);
    // percentagens somam ~100
    const sum = r.macroPercents.protein + r.macroPercents.carbs + r.macroPercents.fat;
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });

  it('mulher, perder gordura agressivo, levemente ativa', () => {
    const r = calculateNutrition({
      sex: 'female',
      age: 28,
      weightKg: 65,
      heightCm: 165,
      activityLevel: 'light',
      goal: 'lose',
      goalIntensity: 'aggressive',
    });
    expect(r.bmr).toBe(1380); // round(1380.25)
    expect(r.targetCalories).toBe(1423); // round(1380.25 * 1.375 * 0.75)
    expect(r.macros.protein).toBe(143); // 65 * 2.2
  });
});

describe('scaleNutrition', () => {
  it('escala por quantidade (165 kcal/100g -> 150g)', () => {
    const scaled = scaleNutrition(
      { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      100,
      150,
    );
    expect(scaled.calories).toBeCloseTo(247.5);
    expect(scaled.protein).toBeCloseTo(46.5);
  });

  it('base 0 não rebenta', () => {
    const scaled = scaleNutrition({ calories: 100, protein: 1, carbs: 1, fat: 1 }, 0, 50);
    expect(scaled.calories).toBe(0);
  });
});
