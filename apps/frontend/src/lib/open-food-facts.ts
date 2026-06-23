/** Procura um produto por código de barras no Open Food Facts (grátis, sem chave). */

export interface ScannedFood {
  name: string;
  per: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

interface OFFResponse {
  status?: number;
  product?: {
    product_name?: string;
    product_name_pt?: string;
    generic_name?: string;
    brands?: string;
    nutriments?: OFFNutriments;
  };
}

const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;
const round1 = (v: number): number => Math.round(v * 10) / 10;

export async function lookupBarcode(code: string): Promise<ScannedFood | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
        code,
      )}.json?fields=product_name,product_name_pt,generic_name,brands,nutriments`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as OFFResponse;
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments ?? {};
    const name =
      p.product_name_pt ||
      p.product_name ||
      p.generic_name ||
      p.brands ||
      `Produto ${code}`;

    let kcal = n['energy-kcal_100g'];
    if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184; // kJ → kcal

    return {
      name: name.trim(),
      per: 100,
      unit: 'g',
      calories: Math.round(num(kcal)),
      protein: round1(num(n.proteins_100g)),
      carbs: round1(num(n.carbohydrates_100g)),
      fat: round1(num(n.fat_100g)),
    };
  } catch {
    return null;
  }
}
