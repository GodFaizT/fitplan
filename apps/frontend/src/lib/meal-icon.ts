import {
  Coffee,
  Cookie,
  type LucideIcon,
  Moon,
  Soup,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';

const MEAL_ICONS: Record<string, LucideIcon> = {
  'pequeno-almoco': Coffee,
  almoco: Utensils,
  lanche: Cookie,
  jantar: UtensilsCrossed,
  ceia: Moon,
  outro: Soup,
};

/** Ícone característico de cada tipo de refeição. */
export function mealIcon(type: string): LucideIcon {
  return MEAL_ICONS[type] ?? Utensils;
}
