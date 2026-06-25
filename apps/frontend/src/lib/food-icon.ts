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
  [/frango|peru|coxa|asa|pato|codorniz|borrego|coelho|salsicha/, Drumstick],
  [/porco|lombo|fiambre|presunto|bacon|chouri[cç]o|entremeada|enchido/, Ham],
  [/carne|vaca|bife|vitela|costela|hamb[uú]rguer|f[ií]gado/, Beef],
  [/atum|salm|bacalhau|peixe|camar|marisco|sardinha|polvo|lula|mexilh|am[eê]ijoa|pescada|dourada|robalo|cavala|truta|linguado/, Fish],
  [/ovo|clara|gema/, Egg],
  [/whey|prote[ií]na|tofu|tempeh|seitan|soja|edamame/, Milk],
  [/feij[aã]o.?verde/, Salad],
  [/feij|gr[aã]o|lentilh|ervilha/, Bean],
  [/p[aã]o|tosta|wrap|tortilha/, Croissant],
  [/arroz|massa|aveia|quinoa|milho|trigo|cereal|flocos|cuscuz|granola|couscous|batata/, Wheat],
  [/leite|iogurte|queijo|requeij|nata|kefir|skyr/, Milk],
  [/banana/, Banana],
  [/laranja|tangerina|clementina|sumo/, Citrus],
  [/morango|framboesa|amora|mirtilo|cereja/, Cherry],
  [/uva|passas/, Grape],
  [/ma[cç][aã]|pera|abacate|p[eê]ssego|manga|kiwi|ameixa|anan[aá]s|melancia|mel[aã]o|t[aâ]mara/, Apple],
  [/cenoura/, Carrot],
  [/br[oó]colo|tomate|alface|espinafre|cebola|courgette|legume|salada|pepino|pimento|couve|cogumelo|bering|espargo|ab[oó]bora|beterraba/, Salad],
  [/am[eê]ndoa|amendoim|noz|caju|pistac|avel[aã]|semente|azeitona/, Nut],
  [/azeite|[oó]leo|manteiga/, Droplet],
  [/mel\b/, Droplet],
  [/chocolate|a[cç][uú]car|bolacha|biscoito|doce|compota|barra|maionese|ketchup/, Cookie],
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
