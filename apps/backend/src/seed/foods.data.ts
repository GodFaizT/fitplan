/** Catálogo de alimentos comuns (valores aproximados por 100 g/ml). PROJECT.md 5.4. */
export interface CommonFood {
  name: string;
  category: string;
  per: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const COMMON_FOODS: CommonFood[] = [
  // Proteínas
  { name: 'Peito de frango grelhado', category: 'Proteínas', per: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Coxa de frango (sem pele)', category: 'Proteínas', per: 100, unit: 'g', calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: 'Peru (peito)', category: 'Proteínas', per: 100, unit: 'g', calories: 135, protein: 30, carbs: 0, fat: 1 },
  { name: 'Carne de vaca magra', category: 'Proteínas', per: 100, unit: 'g', calories: 217, protein: 26, carbs: 0, fat: 12 },
  { name: 'Carne de porco (lombo)', category: 'Proteínas', per: 100, unit: 'g', calories: 242, protein: 27, carbs: 0, fat: 14 },
  { name: 'Atum (lata em água)', category: 'Proteínas', per: 100, unit: 'g', calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Salmão', category: 'Proteínas', per: 100, unit: 'g', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Bacalhau cozido', category: 'Proteínas', per: 100, unit: 'g', calories: 105, protein: 23, carbs: 0, fat: 1 },
  { name: 'Camarão', category: 'Proteínas', per: 100, unit: 'g', calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: 'Ovo inteiro', category: 'Proteínas', per: 100, unit: 'g', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Clara de ovo', category: 'Proteínas', per: 100, unit: 'g', calories: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { name: 'Whey protein (pó)', category: 'Proteínas', per: 100, unit: 'g', calories: 400, protein: 80, carbs: 8, fat: 6 },

  // Hidratos
  { name: 'Arroz branco cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Arroz integral cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9 },
  { name: 'Massa cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: 'Batata cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: 'Batata-doce cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Pão integral', category: 'Hidratos', per: 100, unit: 'g', calories: 247, protein: 13, carbs: 41, fat: 3.4 },
  { name: 'Pão branco', category: 'Hidratos', per: 100, unit: 'g', calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  { name: 'Aveia (flocos)', category: 'Hidratos', per: 100, unit: 'g', calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: 'Quinoa cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Feijão preto cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 132, protein: 8.9, carbs: 24, fat: 0.5 },
  { name: 'Grão-de-bico cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: 'Lentilhas cozidas', category: 'Hidratos', per: 100, unit: 'g', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Milho', category: 'Hidratos', per: 100, unit: 'g', calories: 86, protein: 3.2, carbs: 19, fat: 1.2 },

  // Lacticínios
  { name: 'Leite meio-gordo', category: 'Lacticínios', per: 100, unit: 'ml', calories: 50, protein: 3.4, carbs: 4.8, fat: 1.6 },
  { name: 'Iogurte natural', category: 'Lacticínios', per: 100, unit: 'g', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Iogurte grego', category: 'Lacticínios', per: 100, unit: 'g', calories: 97, protein: 9, carbs: 3.9, fat: 5 },
  { name: 'Queijo flamengo', category: 'Lacticínios', per: 100, unit: 'g', calories: 350, protein: 25, carbs: 2, fat: 27 },
  { name: 'Queijo fresco', category: 'Lacticínios', per: 100, unit: 'g', calories: 113, protein: 11, carbs: 3, fat: 6 },
  { name: 'Requeijão', category: 'Lacticínios', per: 100, unit: 'g', calories: 174, protein: 11, carbs: 3, fat: 13 },

  // Fruta
  { name: 'Banana', category: 'Fruta', per: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Maçã', category: 'Fruta', per: 100, unit: 'g', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Laranja', category: 'Fruta', per: 100, unit: 'g', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Morangos', category: 'Fruta', per: 100, unit: 'g', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: 'Uvas', category: 'Fruta', per: 100, unit: 'g', calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: 'Pera', category: 'Fruta', per: 100, unit: 'g', calories: 57, protein: 0.4, carbs: 15, fat: 0.1 },
  { name: 'Abacate', category: 'Fruta', per: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15 },

  // Vegetais
  { name: 'Brócolos', category: 'Vegetais', per: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Cenoura', category: 'Vegetais', per: 100, unit: 'g', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Tomate', category: 'Vegetais', per: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Alface', category: 'Vegetais', per: 100, unit: 'g', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: 'Espinafres', category: 'Vegetais', per: 100, unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: 'Cebola', category: 'Vegetais', per: 100, unit: 'g', calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  { name: 'Feijão-verde', category: 'Vegetais', per: 100, unit: 'g', calories: 31, protein: 1.8, carbs: 7, fat: 0.1 },
  { name: 'Courgette', category: 'Vegetais', per: 100, unit: 'g', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },

  // Gorduras / frutos secos
  { name: 'Azeite', category: 'Gorduras', per: 100, unit: 'ml', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Manteiga', category: 'Gorduras', per: 100, unit: 'g', calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { name: 'Amêndoas', category: 'Gorduras', per: 100, unit: 'g', calories: 579, protein: 21, carbs: 22, fat: 49 },
  { name: 'Amendoins', category: 'Gorduras', per: 100, unit: 'g', calories: 567, protein: 26, carbs: 16, fat: 49 },
  { name: 'Manteiga de amendoim', category: 'Gorduras', per: 100, unit: 'g', calories: 588, protein: 25, carbs: 20, fat: 50 },
  { name: 'Nozes', category: 'Gorduras', per: 100, unit: 'g', calories: 654, protein: 15, carbs: 14, fat: 65 },

  // Outros
  { name: 'Mel', category: 'Outros', per: 100, unit: 'g', calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  { name: 'Chocolate negro 70%', category: 'Outros', per: 100, unit: 'g', calories: 546, protein: 4.9, carbs: 61, fat: 31 },
];
