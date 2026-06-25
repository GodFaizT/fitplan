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
  // ── Proteínas: aves ──────────────────────────────────────────────
  { name: 'Peito de frango grelhado', category: 'Proteínas', per: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Peito de frango cru', category: 'Proteínas', per: 100, unit: 'g', calories: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  { name: 'Coxa de frango (sem pele)', category: 'Proteínas', per: 100, unit: 'g', calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: 'Coxa de frango (com pele)', category: 'Proteínas', per: 100, unit: 'g', calories: 229, protein: 24, carbs: 0, fat: 14 },
  { name: 'Asa de frango', category: 'Proteínas', per: 100, unit: 'g', calories: 266, protein: 27, carbs: 0, fat: 17 },
  { name: 'Frango assado (médio)', category: 'Proteínas', per: 100, unit: 'g', calories: 190, protein: 28, carbs: 0, fat: 8 },
  { name: 'Peru (peito)', category: 'Proteínas', per: 100, unit: 'g', calories: 135, protein: 30, carbs: 0, fat: 1 },
  { name: 'Peru (coxa)', category: 'Proteínas', per: 100, unit: 'g', calories: 144, protein: 28, carbs: 0, fat: 3.5 },
  { name: 'Pato (peito sem pele)', category: 'Proteínas', per: 100, unit: 'g', calories: 201, protein: 23, carbs: 0, fat: 11 },
  { name: 'Codorniz', category: 'Proteínas', per: 100, unit: 'g', calories: 227, protein: 25, carbs: 0, fat: 14 },

  // ── Proteínas: carne de vaca / vitela ────────────────────────────
  { name: 'Carne de vaca magra', category: 'Proteínas', per: 100, unit: 'g', calories: 217, protein: 26, carbs: 0, fat: 12 },
  { name: 'Bife do lombo de vaca', category: 'Proteínas', per: 100, unit: 'g', calories: 271, protein: 25, carbs: 0, fat: 19 },
  { name: 'Bife da alcatra', category: 'Proteínas', per: 100, unit: 'g', calories: 205, protein: 27, carbs: 0, fat: 10 },
  { name: 'Carne de vaca picada (5% gordura)', category: 'Proteínas', per: 100, unit: 'g', calories: 137, protein: 21, carbs: 0, fat: 5 },
  { name: 'Carne de vaca picada (15% gordura)', category: 'Proteínas', per: 100, unit: 'g', calories: 215, protein: 18, carbs: 0, fat: 15 },
  { name: 'Costela de vaca', category: 'Proteínas', per: 100, unit: 'g', calories: 291, protein: 19, carbs: 0, fat: 24 },
  { name: 'Hambúrguer de vaca', category: 'Proteínas', per: 100, unit: 'g', calories: 250, protein: 17, carbs: 1, fat: 20 },
  { name: 'Vitela', category: 'Proteínas', per: 100, unit: 'g', calories: 172, protein: 24, carbs: 0, fat: 8 },
  { name: 'Fígado de vaca', category: 'Proteínas', per: 100, unit: 'g', calories: 135, protein: 20, carbs: 3.9, fat: 3.6 },

  // ── Proteínas: porco e enchidos ──────────────────────────────────
  { name: 'Carne de porco (lombo)', category: 'Proteínas', per: 100, unit: 'g', calories: 242, protein: 27, carbs: 0, fat: 14 },
  { name: 'Bife de porco', category: 'Proteínas', per: 100, unit: 'g', calories: 198, protein: 26, carbs: 0, fat: 10 },
  { name: 'Costela de porco', category: 'Proteínas', per: 100, unit: 'g', calories: 277, protein: 20, carbs: 0, fat: 22 },
  { name: 'Entremeada (barriga de porco)', category: 'Proteínas', per: 100, unit: 'g', calories: 518, protein: 9, carbs: 0, fat: 53 },
  { name: 'Bacon', category: 'Proteínas', per: 100, unit: 'g', calories: 541, protein: 37, carbs: 1.4, fat: 42 },
  { name: 'Presunto', category: 'Proteínas', per: 100, unit: 'g', calories: 195, protein: 23, carbs: 1, fat: 11 },
  { name: 'Fiambre de porco', category: 'Proteínas', per: 100, unit: 'g', calories: 107, protein: 18, carbs: 1.5, fat: 3.5 },
  { name: 'Chouriço', category: 'Proteínas', per: 100, unit: 'g', calories: 455, protein: 24, carbs: 2, fat: 38 },
  { name: 'Salsicha fresca', category: 'Proteínas', per: 100, unit: 'g', calories: 300, protein: 13, carbs: 2, fat: 27 },
  { name: 'Salsicha de aves (cocktail)', category: 'Proteínas', per: 100, unit: 'g', calories: 215, protein: 13, carbs: 3, fat: 16 },

  // ── Proteínas: borrego e caça ────────────────────────────────────
  { name: 'Borrego (perna)', category: 'Proteínas', per: 100, unit: 'g', calories: 258, protein: 25, carbs: 0, fat: 17 },
  { name: 'Coelho', category: 'Proteínas', per: 100, unit: 'g', calories: 173, protein: 33, carbs: 0, fat: 3.5 },

  // ── Proteínas: peixe e marisco ───────────────────────────────────
  { name: 'Atum (lata em água)', category: 'Proteínas', per: 100, unit: 'g', calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Atum (lata em azeite)', category: 'Proteínas', per: 100, unit: 'g', calories: 198, protein: 25, carbs: 0, fat: 10 },
  { name: 'Atum fresco', category: 'Proteínas', per: 100, unit: 'g', calories: 144, protein: 23, carbs: 0, fat: 5 },
  { name: 'Salmão', category: 'Proteínas', per: 100, unit: 'g', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Salmão fumado', category: 'Proteínas', per: 100, unit: 'g', calories: 117, protein: 18, carbs: 0, fat: 4.3 },
  { name: 'Bacalhau cozido', category: 'Proteínas', per: 100, unit: 'g', calories: 105, protein: 23, carbs: 0, fat: 1 },
  { name: 'Pescada', category: 'Proteínas', per: 100, unit: 'g', calories: 90, protein: 18, carbs: 0, fat: 2 },
  { name: 'Dourada', category: 'Proteínas', per: 100, unit: 'g', calories: 96, protein: 20, carbs: 0, fat: 2 },
  { name: 'Robalo', category: 'Proteínas', per: 100, unit: 'g', calories: 97, protein: 18, carbs: 0, fat: 2 },
  { name: 'Sardinha', category: 'Proteínas', per: 100, unit: 'g', calories: 208, protein: 25, carbs: 0, fat: 11 },
  { name: 'Cavala', category: 'Proteínas', per: 100, unit: 'g', calories: 205, protein: 19, carbs: 0, fat: 14 },
  { name: 'Truta', category: 'Proteínas', per: 100, unit: 'g', calories: 119, protein: 20, carbs: 0, fat: 3.5 },
  { name: 'Linguado', category: 'Proteínas', per: 100, unit: 'g', calories: 91, protein: 19, carbs: 0, fat: 1.5 },
  { name: 'Polvo', category: 'Proteínas', per: 100, unit: 'g', calories: 82, protein: 15, carbs: 2.2, fat: 1 },
  { name: 'Lulas', category: 'Proteínas', per: 100, unit: 'g', calories: 92, protein: 15.6, carbs: 3, fat: 1.4 },
  { name: 'Camarão', category: 'Proteínas', per: 100, unit: 'g', calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: 'Mexilhão', category: 'Proteínas', per: 100, unit: 'g', calories: 86, protein: 12, carbs: 3.7, fat: 2.2 },
  { name: 'Amêijoas', category: 'Proteínas', per: 100, unit: 'g', calories: 86, protein: 12, carbs: 3, fat: 1 },

  // ── Proteínas: ovos e suplementos ────────────────────────────────
  { name: 'Ovo inteiro', category: 'Proteínas', per: 100, unit: 'g', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Clara de ovo', category: 'Proteínas', per: 100, unit: 'g', calories: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { name: 'Gema de ovo', category: 'Proteínas', per: 100, unit: 'g', calories: 322, protein: 16, carbs: 3.6, fat: 27 },
  { name: 'Whey protein (pó)', category: 'Proteínas', per: 100, unit: 'g', calories: 400, protein: 80, carbs: 8, fat: 6 },
  { name: 'Proteína vegetal (pó)', category: 'Proteínas', per: 100, unit: 'g', calories: 375, protein: 75, carbs: 7, fat: 4 },

  // ── Proteínas: vegetariano ───────────────────────────────────────
  { name: 'Tofu', category: 'Proteínas', per: 100, unit: 'g', calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: 'Tempeh', category: 'Proteínas', per: 100, unit: 'g', calories: 193, protein: 19, carbs: 9, fat: 11 },
  { name: 'Seitan', category: 'Proteínas', per: 100, unit: 'g', calories: 121, protein: 21, carbs: 4, fat: 2 },
  { name: 'Edamame', category: 'Proteínas', per: 100, unit: 'g', calories: 121, protein: 12, carbs: 9, fat: 5 },
  { name: 'Soja texturizada (seca)', category: 'Proteínas', per: 100, unit: 'g', calories: 330, protein: 52, carbs: 30, fat: 1 },

  // ── Hidratos ─────────────────────────────────────────────────────
  { name: 'Arroz branco cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Arroz integral cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9 },
  { name: 'Massa cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: 'Massa integral cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 124, protein: 5, carbs: 27, fat: 0.5 },
  { name: 'Batata cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: 'Batata-doce cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Batata frita', category: 'Hidratos', per: 100, unit: 'g', calories: 312, protein: 3.4, carbs: 41, fat: 15 },
  { name: 'Puré de batata', category: 'Hidratos', per: 100, unit: 'g', calories: 83, protein: 2, carbs: 12, fat: 3.5 },
  { name: 'Pão integral', category: 'Hidratos', per: 100, unit: 'g', calories: 247, protein: 13, carbs: 41, fat: 3.4 },
  { name: 'Pão branco', category: 'Hidratos', per: 100, unit: 'g', calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  { name: 'Pão de centeio', category: 'Hidratos', per: 100, unit: 'g', calories: 259, protein: 9, carbs: 48, fat: 3.3 },
  { name: 'Tortilha / wrap', category: 'Hidratos', per: 100, unit: 'g', calories: 310, protein: 8, carbs: 50, fat: 8 },
  { name: 'Aveia (flocos)', category: 'Hidratos', per: 100, unit: 'g', calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: 'Granola', category: 'Hidratos', per: 100, unit: 'g', calories: 471, protein: 10, carbs: 64, fat: 20 },
  { name: 'Cereais de pequeno-almoço', category: 'Hidratos', per: 100, unit: 'g', calories: 379, protein: 7, carbs: 84, fat: 2.5 },
  { name: 'Quinoa cozida', category: 'Hidratos', per: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Couscous cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 112, protein: 3.8, carbs: 23, fat: 0.2 },
  { name: 'Feijão preto cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 132, protein: 8.9, carbs: 24, fat: 0.5 },
  { name: 'Feijão encarnado cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5 },
  { name: 'Grão-de-bico cozido', category: 'Hidratos', per: 100, unit: 'g', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: 'Lentilhas cozidas', category: 'Hidratos', per: 100, unit: 'g', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Ervilhas', category: 'Hidratos', per: 100, unit: 'g', calories: 81, protein: 5.4, carbs: 14, fat: 0.4 },
  { name: 'Milho', category: 'Hidratos', per: 100, unit: 'g', calories: 86, protein: 3.2, carbs: 19, fat: 1.2 },

  // ── Lacticínios ──────────────────────────────────────────────────
  { name: 'Leite meio-gordo', category: 'Lacticínios', per: 100, unit: 'ml', calories: 50, protein: 3.4, carbs: 4.8, fat: 1.6 },
  { name: 'Leite magro', category: 'Lacticínios', per: 100, unit: 'ml', calories: 35, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: 'Leite gordo', category: 'Lacticínios', per: 100, unit: 'ml', calories: 64, protein: 3.2, carbs: 4.7, fat: 3.6 },
  { name: 'Iogurte natural', category: 'Lacticínios', per: 100, unit: 'g', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Iogurte grego', category: 'Lacticínios', per: 100, unit: 'g', calories: 97, protein: 9, carbs: 3.9, fat: 5 },
  { name: 'Iogurte proteico (skyr)', category: 'Lacticínios', per: 100, unit: 'g', calories: 63, protein: 11, carbs: 4, fat: 0.2 },
  { name: 'Kefir', category: 'Lacticínios', per: 100, unit: 'ml', calories: 41, protein: 3.3, carbs: 4.5, fat: 1 },
  { name: 'Queijo flamengo', category: 'Lacticínios', per: 100, unit: 'g', calories: 350, protein: 25, carbs: 2, fat: 27 },
  { name: 'Queijo mozzarella', category: 'Lacticínios', per: 100, unit: 'g', calories: 280, protein: 22, carbs: 2.2, fat: 22 },
  { name: 'Queijo parmesão', category: 'Lacticínios', per: 100, unit: 'g', calories: 431, protein: 38, carbs: 4, fat: 29 },
  { name: 'Queijo fresco', category: 'Lacticínios', per: 100, unit: 'g', calories: 113, protein: 11, carbs: 3, fat: 6 },
  { name: 'Queijo cottage', category: 'Lacticínios', per: 100, unit: 'g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: 'Queijo creme', category: 'Lacticínios', per: 100, unit: 'g', calories: 342, protein: 6, carbs: 4, fat: 34 },
  { name: 'Requeijão', category: 'Lacticínios', per: 100, unit: 'g', calories: 174, protein: 11, carbs: 3, fat: 13 },
  { name: 'Natas (creme de leite)', category: 'Lacticínios', per: 100, unit: 'ml', calories: 292, protein: 2.5, carbs: 3, fat: 30 },

  // ── Fruta ────────────────────────────────────────────────────────
  { name: 'Banana', category: 'Fruta', per: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Maçã', category: 'Fruta', per: 100, unit: 'g', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Laranja', category: 'Fruta', per: 100, unit: 'g', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Tangerina', category: 'Fruta', per: 100, unit: 'g', calories: 53, protein: 0.8, carbs: 13, fat: 0.3 },
  { name: 'Morangos', category: 'Fruta', per: 100, unit: 'g', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: 'Mirtilos', category: 'Fruta', per: 100, unit: 'g', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: 'Framboesas', category: 'Fruta', per: 100, unit: 'g', calories: 52, protein: 1.2, carbs: 12, fat: 0.7 },
  { name: 'Uvas', category: 'Fruta', per: 100, unit: 'g', calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: 'Pera', category: 'Fruta', per: 100, unit: 'g', calories: 57, protein: 0.4, carbs: 15, fat: 0.1 },
  { name: 'Pêssego', category: 'Fruta', per: 100, unit: 'g', calories: 39, protein: 0.9, carbs: 10, fat: 0.3 },
  { name: 'Ameixa', category: 'Fruta', per: 100, unit: 'g', calories: 46, protein: 0.7, carbs: 11, fat: 0.3 },
  { name: 'Kiwi', category: 'Fruta', per: 100, unit: 'g', calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
  { name: 'Manga', category: 'Fruta', per: 100, unit: 'g', calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  { name: 'Ananás', category: 'Fruta', per: 100, unit: 'g', calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { name: 'Melancia', category: 'Fruta', per: 100, unit: 'g', calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { name: 'Melão', category: 'Fruta', per: 100, unit: 'g', calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
  { name: 'Abacate', category: 'Fruta', per: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Tâmaras', category: 'Fruta', per: 100, unit: 'g', calories: 282, protein: 2.5, carbs: 75, fat: 0.4 },
  { name: 'Passas', category: 'Fruta', per: 100, unit: 'g', calories: 299, protein: 3.1, carbs: 79, fat: 0.5 },

  // ── Vegetais ─────────────────────────────────────────────────────
  { name: 'Brócolos', category: 'Vegetais', per: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Couve-flor', category: 'Vegetais', per: 100, unit: 'g', calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  { name: 'Couve', category: 'Vegetais', per: 100, unit: 'g', calories: 49, protein: 4.3, carbs: 9, fat: 0.9 },
  { name: 'Cenoura', category: 'Vegetais', per: 100, unit: 'g', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Tomate', category: 'Vegetais', per: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Alface', category: 'Vegetais', per: 100, unit: 'g', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: 'Espinafres', category: 'Vegetais', per: 100, unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: 'Cebola', category: 'Vegetais', per: 100, unit: 'g', calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  { name: 'Pimento', category: 'Vegetais', per: 100, unit: 'g', calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  { name: 'Pepino', category: 'Vegetais', per: 100, unit: 'g', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'Cogumelos', category: 'Vegetais', per: 100, unit: 'g', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { name: 'Beringela', category: 'Vegetais', per: 100, unit: 'g', calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  { name: 'Courgette', category: 'Vegetais', per: 100, unit: 'g', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: 'Feijão-verde', category: 'Vegetais', per: 100, unit: 'g', calories: 31, protein: 1.8, carbs: 7, fat: 0.1 },
  { name: 'Espargos', category: 'Vegetais', per: 100, unit: 'g', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
  { name: 'Abóbora', category: 'Vegetais', per: 100, unit: 'g', calories: 26, protein: 1, carbs: 6.5, fat: 0.1 },
  { name: 'Beterraba', category: 'Vegetais', per: 100, unit: 'g', calories: 43, protein: 1.6, carbs: 10, fat: 0.2 },

  // ── Gorduras / frutos secos ──────────────────────────────────────
  { name: 'Azeite', category: 'Gorduras', per: 100, unit: 'ml', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Óleo de coco', category: 'Gorduras', per: 100, unit: 'ml', calories: 862, protein: 0, carbs: 0, fat: 100 },
  { name: 'Manteiga', category: 'Gorduras', per: 100, unit: 'g', calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { name: 'Azeitonas', category: 'Gorduras', per: 100, unit: 'g', calories: 115, protein: 0.8, carbs: 6, fat: 11 },
  { name: 'Amêndoas', category: 'Gorduras', per: 100, unit: 'g', calories: 579, protein: 21, carbs: 22, fat: 49 },
  { name: 'Amendoins', category: 'Gorduras', per: 100, unit: 'g', calories: 567, protein: 26, carbs: 16, fat: 49 },
  { name: 'Manteiga de amendoim', category: 'Gorduras', per: 100, unit: 'g', calories: 588, protein: 25, carbs: 20, fat: 50 },
  { name: 'Nozes', category: 'Gorduras', per: 100, unit: 'g', calories: 654, protein: 15, carbs: 14, fat: 65 },
  { name: 'Caju', category: 'Gorduras', per: 100, unit: 'g', calories: 553, protein: 18, carbs: 30, fat: 44 },
  { name: 'Avelãs', category: 'Gorduras', per: 100, unit: 'g', calories: 628, protein: 15, carbs: 17, fat: 61 },
  { name: 'Pistácios', category: 'Gorduras', per: 100, unit: 'g', calories: 562, protein: 20, carbs: 28, fat: 45 },
  { name: 'Sementes de chia', category: 'Gorduras', per: 100, unit: 'g', calories: 486, protein: 17, carbs: 42, fat: 31 },
  { name: 'Sementes de girassol', category: 'Gorduras', per: 100, unit: 'g', calories: 584, protein: 21, carbs: 20, fat: 51 },
  { name: 'Sementes de abóbora', category: 'Gorduras', per: 100, unit: 'g', calories: 559, protein: 30, carbs: 11, fat: 49 },

  // ── Outros ───────────────────────────────────────────────────────
  { name: 'Mel', category: 'Outros', per: 100, unit: 'g', calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  { name: 'Açúcar', category: 'Outros', per: 100, unit: 'g', calories: 387, protein: 0, carbs: 100, fat: 0 },
  { name: 'Compota / doce', category: 'Outros', per: 100, unit: 'g', calories: 278, protein: 0.4, carbs: 69, fat: 0.1 },
  { name: 'Chocolate negro 70%', category: 'Outros', per: 100, unit: 'g', calories: 546, protein: 4.9, carbs: 61, fat: 31 },
  { name: 'Chocolate de leite', category: 'Outros', per: 100, unit: 'g', calories: 535, protein: 7.6, carbs: 59, fat: 30 },
  { name: 'Bolacha Maria', category: 'Outros', per: 100, unit: 'g', calories: 440, protein: 7, carbs: 76, fat: 12 },
  { name: 'Barra de cereais', category: 'Outros', per: 100, unit: 'g', calories: 450, protein: 7, carbs: 65, fat: 18 },
  { name: 'Barra proteica', category: 'Outros', per: 100, unit: 'g', calories: 350, protein: 30, carbs: 35, fat: 9 },
  { name: 'Maionese', category: 'Outros', per: 100, unit: 'g', calories: 680, protein: 1, carbs: 0.6, fat: 75 },
  { name: 'Ketchup', category: 'Outros', per: 100, unit: 'g', calories: 112, protein: 1.7, carbs: 26, fat: 0.1 },
  { name: 'Sumo de laranja', category: 'Outros', per: 100, unit: 'ml', calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },
];
