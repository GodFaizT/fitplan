import { Droplet, Egg, type LucideIcon, Wheat } from 'lucide-react';

export type MacroKey = 'protein' | 'carbs' | 'fat';

export interface MacroMeta {
  key: MacroKey;
  label: string;
  color: string;
  icon: LucideIcon;
}

/** Metadados dos macronutrientes (cor + ícone), partilhados pela UI. */
export const MACROS: MacroMeta[] = [
  { key: 'protein', label: 'Proteína', color: 'var(--protein)', icon: Egg },
  { key: 'carbs', label: 'Hidratos', color: 'var(--carbs)', icon: Wheat },
  { key: 'fat', label: 'Gordura', color: 'var(--fat)', icon: Droplet },
];
