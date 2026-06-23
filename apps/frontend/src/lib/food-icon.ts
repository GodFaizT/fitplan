import {
  Apple,
  Banana,
  Bean,
  Beef,
  Carrot,
  Cherry,
  Citrus,
  Cookie,
  Croissant,
  Droplet,
  Drumstick,
  Egg,
  Fish,
  Grape,
  Ham,
  type LucideIcon,
  Milk,
  Nut,
  Salad,
  Utensils,
  Wheat,
} from 'lucide-react';

/** Ícone por nome de alimento (primeira regra que casa). Ordem importa. */
const NAME_RULES: Array<[RegExp, LucideIcon]> = [
  [/frango|peru|coxa/, Drumstick],
  [/porco|lombo|fiambre|presunto/, Ham],
  [/carne|vaca|bife/, Beef],
  [/atum|salm|bacalhau|peixe|camar|marisco|sardinha/, Fish],
  [/ovo|clara/, Egg],
  [/whey/, Milk],
  [/feij[aã]o.?verde/, Salad],
  [/feij|gr[aã]o|lentilh/, Bean],
  [/p[aã]o|tosta|wrap/, Croissant],
  [/arroz|massa|aveia|quinoa|milho|trigo|cereal|flocos|cuscuz/, Wheat],
  [/leite|iogurte|queijo|requeij|nata/, Milk],
  [/banana/, Banana],
  [/laranja|tangerina|clementina/, Citrus],
  [/morango|framboesa|amora/, Cherry],
  [/uva/, Grape],
  [/ma[cç][aã]|pera|abacate|p[eê]ssego|manga|kiwi|ameixa/, Apple],
  [/cenoura/, Carrot],
  [/br[oó]colo|tomate|alface|espinafre|cebola|courgette|legume|salada|pepino|pimento|couve/, Salad],
  [/am[eê]ndoa|amendoim|noz|caju|pistac|avel[aã]/, Nut],
  [/azeite|[oó]leo|manteiga/, Droplet],
  [/mel/, Droplet],
  [/chocolate|a[cç][uú]car|bolacha|biscoito|doce/, Cookie],
];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Proteínas: Beef,
  Hidratos: Wheat,
  Lacticínios: Milk,
  Fruta: Apple,
  Vegetais: Carrot,
  Gorduras: Nut,
  Outros: Cookie,
};

/** Devolve o componente de ícone lucide adequado a um alimento. */
export function foodIcon(name: string, category?: string | null): LucideIcon {
  const n = name.toLowerCase();
  for (const [re, icon] of NAME_RULES) {
    if (re.test(n)) return icon;
  }
  if (category && CATEGORY_ICON[category]) return CATEGORY_ICON[category];
  return Utensils;
}
