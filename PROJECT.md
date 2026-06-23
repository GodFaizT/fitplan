# FitPlan — Plataforma de Fitness Pessoal

Especificação para o Claude Code construir a aplicação. Lê este ficheiro inteiro antes de começar.

---

## 1. Visão geral

Uma aplicação web pessoal de fitness com duas funcionalidades principais:

1. **Calculadora de nutrição** — calcula calorias diárias e distribuição de macronutrientes (proteína, hidratos de carbono, gordura) com base nos dados do utilizador e do seu objetivo.
2. **Registo de refeições** — o utilizador adiciona as refeições que come ao longo do dia, e a app soma calorias e macros e compara com os alvos calculados.
3. **Plano de treino** — o utilizador monta o seu treino completo organizado por dias da semana, com vídeo demonstrativo de cada exercício.

A app é **universal e multi-utilizador**: cada pessoa cria a sua conta, introduz os seus dados, escolhe objetivo e nível de atividade, e tudo é calculado dinamicamente. Os dados são guardados numa base de dados no teu servidor (self-hosted) e ficam **disponíveis em qualquer dispositivo** — o utilizador entra com a mesma conta no telemóvel e no computador e vê tudo igual.

Os utilizadores podem **partilhar planos de treino** uns com os outros (ex: um plano base que o grupo segue). Ver secção 4 e 8.

A app é uma **PWA (Progressive Web App) instalável** no iPhone e Android: o utilizador abre o site no telemóvel e adiciona ao ecrã principal, ficando com um ícone e a abrir em ecrã inteiro como uma app nativa. Ver secção 9.

---

## 2. Stack técnico

Arquitetura **self-hosted**: três serviços separados, todos alojados num servidor próprio (VPS) através do **Dokploy**.

### Frontend
- **Next.js 14+** (App Router) com TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Estado:** Zustand (estado de UI) + **TanStack Query** (dados do servidor: cache, sincronização, escritas otimistas)
- **Ícones:** lucide-react · **Animação:** Framer Motion · **Fonte:** Inter ou Geist via `next/font` · **Gráficos:** recharts
- **PWA:** `@serwist/next` (ou `next-pwa`) — service worker + manifest, instalável no iOS/Android
- Comunica com o backend via REST (chamadas HTTP à API)

### Backend
- **NestJS** (Node + TypeScript) — API REST
- **Prisma** como ORM para o PostgreSQL
- **Autenticação própria:** email + password com **JWT** (access token + refresh token). Passwords com hash **bcrypt** (ou argon2). Ver secção 3.
- Validação de input (class-validator / DTOs), CORS configurado para o domínio do frontend
- Serve/gere as imagens dos exercícios (ou aponta para um volume/Storage — ver 6.4)

### Base de dados
- **PostgreSQL** (serviço no Dokploy, com volume persistente para os dados)
- Esquema gerido por **migrações Prisma**

### Infraestrutura (Dokploy)
- Tudo corre no Dokploy num VPS: três aplicações — `frontend` (Next.js), `backend` (NestJS) e a base de dados `postgres`.
- O Dokploy trata de build a partir do Git, domínios, HTTPS (Let's Encrypt via Traefik) e variáveis de ambiente.
- Ver secção 11 (deploy) para o detalhe.

### Conteúdo / dados externos
- **Vídeos:** embeds do YouTube (iframe, opcional por exercício). Guardar apenas o ID/URL.
- **Biblioteca de exercícios:** **Free Exercise DB** (`yuhonas/free-exercise-db`, domínio público) — 800+ exercícios com imagens e instruções, importados por seed para o PostgreSQL. Ver secção 6.4.

Manter a lógica de domínio (cálculos de nutrição) em funções puras, partilháveis entre frontend e backend (ex: um pacote/pasta `shared` ou duplicada de forma controlada).

---

## 3. Contas, autenticação e base de dados

### 3.1 Autenticação (própria, com JWT)

O backend NestJS trata da autenticação — não há serviço externo.

- **Registo:** email + password. A password é guardada com hash **bcrypt** (nunca em texto). Validar formato do email e força mínima da password.
- **Login:** verifica as credenciais e devolve um **access token** (JWT de curta duração, ex: 15 min) e um **refresh token** (longa duração, ex: 30 dias).
  - Guardar o refresh token de forma segura — preferir **cookie httpOnly** (mais seguro contra XSS) ou, em alternativa, no cliente com cuidado. Access token em memória/estado.
  - Endpoint de **refresh** que troca um refresh token válido por um novo access token.
- **Rotas protegidas:** o backend valida o JWT (guard do NestJS) em todos os endpoints de dados; o frontend redireciona para login se não houver sessão válida.
- **Logout:** invalida o refresh token (lista de revogados ou rotação de tokens) e limpa o estado no cliente.
- Endpoints típicos: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.

### 3.2 Esquema da base de dados (PostgreSQL via Prisma)

Modelo relacional. Esboço em estilo Prisma schema:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  sex           String?
  age           Int?
  weightKg      Float?
  heightCm      Float?
  activityLevel String?
  goal          String?
  goalIntensity String?
  units         String   @default("metric")
  accentColor   String?
  theme         String   @default("dark")
  // alvos calculados (cache):
  targetCalories Int?
  targetProtein  Int?
  targetCarbs    Int?
  targetFat      Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  savedFoods    SavedFood[]
  dailyLogs     DailyLog[]
  weightEntries WeightEntry[]
  planMemberships PlanMember[]
  ownedPlans    WorkoutPlan[] @relation("owner")
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String
  expiresAt DateTime
  revoked   Boolean  @default(false)
}

model SavedFood {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  name     String
  per      Float
  unit     String
  calories Float
  protein  Float
  carbs    Float
  fat      Float
}

model DailyLog {
  id     String   @id @default(cuid())
  userId String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date   DateTime @db.Date
  meals  Meal[]
  @@unique([userId, date])
}

model Meal {
  id         String     @id @default(cuid())
  dailyLogId String
  dailyLog   DailyLog   @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  type       String     // pequeno-almoco | almoco | lanche | jantar | ceia | outro
  label      String?
  consumed   Boolean    @default(false)
  items      FoodItem[]
}

model FoodItem {
  id       String @id @default(cuid())
  mealId   String
  meal     Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)
  name     String
  quantity Float
  unit     String
  calories Float
  protein  Float
  carbs    Float
  fat      Float
}

model WorkoutPlan {
  id        String        @id @default(cuid())
  ownerId   String
  owner     User          @relation("owner", fields: [ownerId], references: [id], onDelete: Cascade)
  name      String
  isShared  Boolean       @default(false)
  shareCode String?       @unique
  days      WorkoutDay[]
  members   PlanMember[]
}

model PlanMember {
  planId String
  plan   WorkoutPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  userId String
  user   User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   String      @default("member") // owner | member
  @@id([planId, userId])
}

model WorkoutDay {
  id        String     @id @default(cuid())
  planId    String
  plan      WorkoutPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  label     String
  title     String?
  position  Int
  exercises Exercise[]
}

model Exercise {
  id          String  @id @default(cuid())
  dayId       String
  day         WorkoutDay @relation(fields: [dayId], references: [id], onDelete: Cascade)
  libraryId   String?    // ref. a ExerciseLibrary, se veio da biblioteca
  name        String
  muscleGroup String?
  sets        Int
  reps        String
  restSeconds Int
  weight      Float?
  videoUrl    String?
  notes       String?
  position    Int
}

model ExerciseLibrary {
  id              String  @id @default(cuid())
  slug            String  @unique
  name            String
  category        String?
  level           String?
  force           String?
  mechanic        String?
  equipment       String?
  primaryMuscles  String[]
  secondaryMuscles String[]
  instructions    String[]
  imageUrls       String[]
}

model WeightEntry {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date     DateTime @db.Date
  weightKg Float
}
```

### 3.3 Autorização (no backend)

A segurança vive no backend (não há regras no cliente):

- Cada endpoint protegido lê o `userId` do JWT e filtra os dados por esse utilizador — um utilizador nunca consegue ler/escrever dados de outro.
- Planos de treino: o acesso é permitido se o utilizador for o `ownerId` **ou** existir um `PlanMember` correspondente. Ver secção 6.5 para partilha.
- `ExerciseLibrary` é leitura para qualquer utilizador autenticado; só o script de seed escreve.
- Validar sempre o input (DTOs) e usar queries parametrizadas do Prisma (sem SQL cru) para evitar injeção.

### 3.4 Sincronização e offline

- Não há sincronização em tempo real automática por push do servidor. O frontend usa **TanStack Query** para ir buscar dados ao backend, fazer cache e revalidar.
- **Entre dispositivos:** como os dados estão no servidor, basta o utilizador abrir a app noutro dispositivo e os dados são os mesmos (carregados via API). A app deve refrescar ao focar/abrir.
- **Offline (ginásio sem rede):** o service worker da PWA faz cache do app shell; o TanStack Query mantém em cache os últimos dados carregados (com persistência em IndexedDB) para a app continuar a mostrar o treino/refeições. Escritas feitas offline podem ser enfileiradas e enviadas ao voltar a rede (mutation queue) — manter simples na v1: permitir leitura offline e avisar que as escritas precisam de ligação, se a fila de mutations ficar complexa.

---

## 4. Funcionalidade 1 — Calculadora de nutrição

### 4.1 Inputs do utilizador (formulário)

| Campo | Tipo | Notas |
|---|---|---|
| Sexo | select | masculino / feminino |
| Idade | number | anos |
| Peso | number | kg (permitir alternar para lb) |
| Altura | number | cm (permitir alternar para ft/in) |
| Nível de atividade | select | ver tabela 4.3 |
| Objetivo | select | perder gordura / manter / ganhar massa |
| Intensidade do objetivo | select | ligeiro / moderado / agressivo (só relevante se perder ou ganhar) |

### 4.2 Cálculo do BMR (Taxa Metabólica Basal)

Usar a fórmula **Mifflin-St Jeor** (mais precisa que Harris-Benedict):

```
Homem:   BMR = (10 × peso_kg) + (6.25 × altura_cm) − (5 × idade) + 5
Mulher:  BMR = (10 × peso_kg) + (6.25 × altura_cm) − (5 × idade) − 161
```

### 4.3 Cálculo do TDEE (Gasto Energético Total Diário)

```
TDEE = BMR × fator_atividade
```

Fatores de atividade:

| Nível | Fator | Descrição |
|---|---|---|
| Sedentário | 1.2 | pouco ou nenhum exercício |
| Levemente ativo | 1.375 | exercício leve 1–3 dias/semana |
| Moderadamente ativo | 1.55 | exercício moderado 3–5 dias/semana |
| Muito ativo | 1.725 | exercício intenso 6–7 dias/semana |
| Extremamente ativo | 1.9 | trabalho físico + treino diário |

### 4.4 Ajuste de calorias por objetivo

Aplicar sobre o TDEE:

| Objetivo | Intensidade | Ajuste |
|---|---|---|
| Perder gordura | ligeiro | −10% |
| Perder gordura | moderado | −20% |
| Perder gordura | agressivo | −25% |
| Manter | — | 0% |
| Ganhar massa | ligeiro | +5% |
| Ganhar massa | moderado | +10% |
| Ganhar massa | agressivo | +15% |

`calorias_alvo = TDEE × (1 + ajuste)`

Arredondar ao inteiro. Mostrar também BMR e TDEE como informação de contexto.

### 4.5 Distribuição de macronutrientes

Calores por grama: **proteína = 4 kcal**, **hidratos = 4 kcal**, **gordura = 9 kcal**.

Método baseado em proteína por peso corporal (mais fiável que percentagens):

```
1. Proteína (g) = peso_kg × fator_proteina
     - perder gordura:  2.2 g/kg
     - manter:          1.8 g/kg
     - ganhar massa:    2.0 g/kg

2. Gordura (g) = (calorias_alvo × 0.25) / 9      // 25% das calorias

3. Calorias restantes = calorias_alvo − (proteina_g × 4) − (gordura_g × 9)

4. Hidratos (g) = calorias_restantes / 4
```

Garantir que nenhum macro fica negativo (clamp a 0 e mostrar aviso se as calorias forem demasiado baixas para a proteína definida).

### 4.6 Output (ecrã de resultados)

- Card grande com **calorias alvo** por dia
- Três cards: proteína (g), hidratos (g), gordura (g) — cada um com gramas + % das calorias totais
- Donut chart (recharts) com a divisão calórica dos 3 macros
- Linha de contexto: "BMR: X kcal · TDEE: Y kcal"
- Botão para recalcular / editar dados

---

## 5. Funcionalidade 2 — Registo de refeições

### 5.1 Objetivo

Permitir ao utilizador registar o que come ao longo do dia e ver, em tempo real, quantas calorias e macros já consumiu face aos alvos da calculadora (secção 4). O dia atual mostra um resumo "consumido / alvo / restante".

### 6.2 Modelo de dados

```ts
type FoodItem = {
  id: string;
  name: string;            // ex: "Peito de frango grelhado"
  quantity: number;        // quantidade consumida
  unit: string;            // ex: "g", "ml", "unidade", "porção"
  calories: number;        // kcal para a quantidade indicada
  protein: number;         // g
  carbs: number;           // g
  fat: number;             // g
};

type Meal = {
  id: string;
  type: "pequeno-almoco" | "almoco" | "lanche" | "jantar" | "ceia" | "outro";
  label?: string;          // nome livre opcional
  items: FoodItem[];
};

type DailyLog = {
  date: string;            // ISO "YYYY-MM-DD"
  meals: Meal[];
};
```

O registo é guardado por dia (`DailyLog`) na base de dados, indexado por utilizador e data, e sincroniza entre dispositivos.

### 5.3 Funcionalidades

- Selecionar a data (default: hoje), com botões anterior/seguinte para navegar entre dias
- Adicionar refeições agrupadas por tipo (pequeno-almoço, almoço, lanche, jantar, ceia, outro)
- Dentro de cada refeição, adicionar / editar / remover alimentos
- Por cada alimento: nome, quantidade, unidade, calorias, proteína, hidratos, gordura
- **Cálculo por quantidade:** permitir guardar valores nutricionais "por 100 g / por porção" e a app escala automaticamente para a quantidade introduzida. Ex: alimento definido como 165 kcal / 31 g proteína por 100 g → utilizador come 150 g → app calcula 248 kcal / 46.5 g proteína.
- Marcar uma refeição como "consumida" (checkbox) — opcional, para planeamento vs. registo
- Duplicar uma refeição/alimento de outro dia (para repetir refeições frequentes)

### 5.4 Alimentos guardados (biblioteca pessoal)

- Quando o utilizador adiciona um alimento, oferecer guardá-lo numa biblioteca pessoal (`SavedFood`) com os seus valores nutricionais por 100 g / por porção.
- Ao adicionar um novo alimento, pesquisar primeiro na biblioteca pessoal por nome (autocomplete) para reutilizar rapidamente.
- Seed inicial opcional com alguns alimentos comuns (frango, arroz, ovos, aveia, atum, batata-doce, etc.) com valores nutricionais aproximados por 100 g. Indicar que são valores de referência e editáveis.

```ts
type SavedFood = {
  id: string;
  name: string;
  per: number;             // base de referência, ex: 100
  unit: string;            // ex: "g"
  calories: number;        // por `per` `unit`
  protein: number;
  carbs: number;
  fat: number;
};
```

### 5.5 Resumo diário (output)

- Barra/anel de progresso de **calorias**: consumido vs. alvo, com valor restante
- Três barras de progresso para **proteína / hidratos / gordura**: gramas consumidas vs. alvo
- Estado por cores: dentro do alvo (verde), perto (amarelo), excedido (vermelho)
- Total do dia bem visível no topo
- Se os alvos ainda não foram calculados na secção de nutrição, mostrar aviso com link para a calculadora

### 5.6 Integração

- Os alvos (calorias e macros) vêm diretamente do resultado da calculadora de nutrição (secção 4). Manter uma única fonte de verdade no store.
- O dashboard (secção 6) mostra um mini-resumo do dia: calorias consumidas / restantes.

---

## 6. Funcionalidade 3 — Plano de treino

### 6.1 Estrutura

O utilizador cria o seu plano semanal. Organização por **dias** (segunda a domingo, ou dias livres "Dia 1, Dia 2..."). Cada dia tem um nome opcional (ex: "Peito e Tríceps", "Pernas", "Push") e uma lista ordenada de exercícios.

### 6.2 Modelo de dados

```ts
type Exercise = {
  id: string;
  libraryId?: string;      // ref. ao exercício da biblioteca (Free Exercise DB), se veio de lá
  name: string;            // ex: "Supino reto com barra"
  muscleGroup: string;     // ex: "Peito"
  imageUrls?: string[];    // imagens de demonstração (da biblioteca)
  instructions?: string[]; // passos de execução (da biblioteca)
  sets: number;            // nº de séries (pessoal)
  reps: string;            // ex: "8-12" (string para permitir intervalos)
  restSeconds: number;     // descanso entre séries
  weight?: number;         // carga opcional (kg) — pessoal
  videoUrl?: string;       // URL ou ID do YouTube (opcional)
  notes?: string;          // notas de execução
};

type WorkoutDay = {
  id: string;
  label: string;           // ex: "Segunda" ou "Dia 1"
  title?: string;          // ex: "Push - Peito/Ombro/Tríceps"
  exercises: Exercise[];
};

type WorkoutPlan = {
  id: string;
  ownerId: string;         // dono do plano
  name: string;            // ex: "Plano Hipertrofia 5 dias"
  isShared: boolean;       // se está partilhado com amigos
  shareCode?: string;      // código/link para outros aderirem
  days: WorkoutDay[];
};
```

> Nota: as ordens (`position`) de dias e exercícios são guardadas na base de dados para a reordenação persistir.

### 6.3 Funcionalidades do construtor de treino

- Adicionar / editar / remover dias
- Adicionar / editar / remover / **reordenar** exercícios (drag-and-drop com dnd-kit, ou setas cima/baixo se mais simples)
- Por cada exercício: nome, grupo muscular, séries, reps, descanso, carga, vídeo, notas
- Colar um URL do YouTube no campo de vídeo → extrair o ID e mostrar miniatura/embed
- Vista de "treino do dia": abre um dia e mostra os exercícios em sequência, cada um com o vídeo embebido, séries/reps/descanso bem visíveis
- Adicionar exercícios a partir da **biblioteca Free Exercise DB** (pesquisa por nome/músculo/equipamento) com nome, músculos, instruções e imagens já preenchidos. Ver secção 6.4.

### 6.4 Biblioteca de exercícios — Free Exercise DB

A biblioteca de exercícios da app é alimentada pela **Free Exercise DB** (`yuhonas/free-exercise-db` no GitHub): mais de 800 exercícios em domínio público (sem chave de API, sem custos, sem quotas, sem obrigação de atribuição), cada um com nome, músculos, equipamento, nível, instruções passo a passo e imagens de demonstração.

#### Fonte dos dados

- **JSON completo (um só ficheiro):** `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`
- **Imagens:** `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{id}/{n}.jpg` (os caminhos relativos vêm no campo `images` de cada exercício; normalmente há 2 imagens que, alternadas, mostram o movimento).

#### Estrutura de cada exercício

```json
{
  "id": "Alternate_Incline_Dumbbell_Curl",
  "name": "Alternate Incline Dumbbell Curl",
  "force": "pull",                 // pode ser null
  "level": "beginner",             // beginner | intermediate | expert
  "mechanic": "isolation",         // compound | isolation | null
  "equipment": "dumbbell",         // pode ser null
  "primaryMuscles": ["biceps"],
  "secondaryMuscles": ["forearms"],
  "instructions": ["...", "..."],
  "category": "strength",
  "images": ["Alternate_Incline_Dumbbell_Curl/0.jpg", "Alternate_Incline_Dumbbell_Curl/1.jpg"]
}
```

Nota: `force`, `mechanic` e `equipment` podem vir `null` nalguns exercícios — tratar isso no código (permitir nulo).

#### Estratégia: seed único na base de dados

- Correr **uma vez** um script de seed (`scripts/seed-exercises.ts`, no backend, via Prisma) que descarrega o `exercises.json`, mapeia os campos e insere as linhas na tabela `ExerciseLibrary`. Não chamar o GitHub em runtime a cada utilização — a biblioteca é estática. Integrar com o `prisma db seed` se ajudar.
- Como os dados são domínio público, **podes também copiar as imagens** durante o seed para um **volume do backend no Dokploy** (ou um bucket S3/MinIO self-hosted) e servi-las pela tua API, ou simplesmente guardar os URLs raw do GitHub e apontar para eles. Copiar é mais robusto (não depende do GitHub); apontar para os URLs raw é mais rápido de montar. Escolher uma; copiar é o recomendado.

```
ExerciseLibrary (tabela)       // biblioteca global, leitura para autenticados
  id, slug, name, category, level, force, mechanic, equipment,
  primaryMuscles[], secondaryMuscles[], instructions[], imageUrls[]
```

Endpoint de leitura (ex: `GET /exercises?search=&muscle=&equipment=`) protegido por JWT; nenhuma escrita exposta na API (só o seed escreve). Ver secção 3.3.

#### Como é usada no construtor de treino

- Ao adicionar um exercício a um dia, o utilizador **pesquisa na biblioteca** (por nome, grupo muscular ou equipamento) e seleciona — nome, grupo muscular, instruções e imagens vêm preenchidos automaticamente.
- O utilizador define então séries, reps, descanso e carga (que são pessoais, vivem na tabela `exercises` do plano, não na biblioteca).
- O campo de vídeo do YouTube continua disponível e **opcional**: a Free Exercise DB traz imagens, não vídeos; quem quiser um vídeo cola o link ou usa o botão "Procurar no YouTube". As imagens da biblioteca servem como demonstração por defeito.
- Mapear os nomes de músculos da Free Exercise DB (em inglês: chest, back, shoulders, biceps, triceps, quadriceps, hamstrings, glutes, calves, abdominals, etc.) para os rótulos da app (em português, se quiseres) numa tabela de tradução simples.

#### Mapeamento de campos (Free Exercise DB → app)

- `name` → nome do exercício
- `primaryMuscles[0]` → grupo muscular principal (para agrupar/filtrar)
- `instructions` → notas/execução (mostrar como passos)
- `images` → demonstração visual (carrossel ou alternância das 2 imagens)
- `equipment`, `level`, `category` → filtros opcionais na pesquisa

### 6.5 Partilha de planos entre amigos

O objetivo é o grupo poder seguir um plano de treino base comum.

- O dono de um plano pode marcá-lo como **partilhado**, gerando um **código/link de partilha** único.
- Outro utilizador introduz o código (ou abre o link) e o plano fica disponível na conta dele.
- Dois modos a suportar (escolher 6.5a como base; 6.5b é opcional):
  - **6.5a — Cópia (recomendado para começar):** ao aderir, o plano é **copiado** para a conta do utilizador. A partir daí cada um edita a sua cópia (cargas, notas) sem afetar os outros. Simples e sem conflitos. Ideal para "um plano base que cada um adapta".
  - **6.5b — Plano partilhado vivo (opcional):** o plano fica ligado ao original; quando o dono edita a estrutura (exercícios/dias), todos os membros veem a atualização. As **cargas e notas pessoais** de cada membro ficam guardadas por utilizador, não no plano partilhado. Mais complexo — deixar para uma v1.1.
- Gerir o acesso pela tabela `PlanMember` (ligação plano↔utilizador). Permitir sair de um plano partilhado (remove a linha de `PlanMember`).
- Mostrar quem é o dono e, no caso 6.5b, um indicador de "plano partilhado".

### 6.6 Player do vídeo

- Embed responsivo do YouTube (rácio 16:9)
- Se o utilizador só colou o nome do exercício e não um URL, mostrar um botão "Procurar no YouTube" que abre a pesquisa numa nova aba

---

## 7. Navegação e ecrãs

0. **Login / Registo** — entrada na app; sem sessão redireciona para aqui
1. **Dashboard / Início** — resumo: calorias alvo, macros, calorias já consumidas hoje, e o treino de hoje (com base no dia da semana)
2. **Nutrição** — formulário + resultados da calculadora
3. **Refeições** — registo diário de refeições com resumo consumido vs. alvo
4. **Treino** — lista de planos (próprios e partilhados), construtor, vista de treino do dia, e aderir a plano por código
5. **Progresso** (opcional v1.1) — registar peso ao longo do tempo, gráfico de linha (recharts)
6. **Definições / Perfil** — dados pessoais, unidades (kg/lb, cm/ft), cor de destaque, tema, logout, repor dados

Layout: sidebar (desktop) / bottom-nav (mobile). Mobile-first, totalmente responsivo.

---

## 8. Design — moderno e intuitivo

O design é uma prioridade, não um detalhe. Deve sentir-se como uma app premium (referências: Whoop, Oura, Apple Fitness, Linear). Limpo, escuro, com hierarquia forte e micro-interações. Evitar o aspeto "Bootstrap genérico".

### 8.1 Princípios

- **Dark-first:** dark mode por defeito, com toggle para light. Ambos cuidados.
- **Hierarquia por tamanho, não por ruído:** números grandes para o que importa (calorias, cargas), texto secundário discreto. Pouca cor, usada com intenção.
- **Respirar:** espaçamento generoso, cards bem separados, nada apertado.
- **Glance-able:** o utilizador percebe o estado num segundo — barras de progresso, anéis, cores de estado.
- **Mobile-first:** desenhado primeiro para telemóvel (é onde se usa no ginásio), depois expandido para desktop.

### 8.2 Cores

Tema escuro (valores de referência, ajustáveis):

```
--bg:            #1A1C1E   /* fundo da app */
--surface:       #24262A   /* cards */
--surface-2:     #2C2F33   /* tracks, inputs, hover */
--border:        rgba(255,255,255,0.08)
--text:          #FFFFFF
--text-muted:    #9A9C9E
--accent:        #C5F82A   /* lima — números-chave, CTAs, play */
--accent-text:   #1A1C1E   /* texto sobre o lima */
```

Cores por macro / estado (consistentes em toda a app):

```
proteína:  #378ADD  (azul)
hidratos:  #EF9F27  (âmbar)
gordura:   #1D9E75  (verde-teal)
sucesso / dentro do alvo:  #1D9E75
aviso / perto do limite:   #EF9F27
excedido / erro:           #E24B4A
```

Tema claro: fundo `#F7F7F5`, cards `#FFFFFF`, texto `#1A1C1E`, manter o lima e as cores de macro. A cor de destaque deve ser configurável nas definições.

### 8.3 Tipografia

- Fonte: **Inter** ou **Geist** (sans, via next/font). Mono (Geist Mono ou JetBrains Mono) só para números grandes de destaque, opcional.
- Escala: número hero 32–40px / 500 · título de secção 18px / 500 · corpo 15–16px / 400 · label 12–13px / 400 muted, por vezes uppercase com letter-spacing leve (0.04em).
- Apenas dois pesos: 400 e 500. Nada de 700.
- **Sentence case** em todo o lado. Nunca Title Case nem CAPS (exceto labels curtas opcionais).

### 8.4 Componentes e formas

- **Cards:** `border-radius` 16px, fundo `--surface`, borda 0.5px subtil, padding 16–20px. Sem sombras pesadas; no máximo uma sombra muito suave.
- **Barras de progresso:** cantos totalmente arredondados (pill), track `--surface-2`, preenchimento na cor do macro/estado. Animar o preenchimento ao montar.
- **Anel de progresso** (calorias): donut/anel circular para o resumo diário de calorias, com o número no centro.
- **Botões:** primário = fundo lima, texto escuro, radius médio; secundário = transparente com borda. Estado active com `scale(0.98)`.
- **Inputs:** fundo `--surface-2`, borda subtil, focus ring na cor de destaque. Altura confortável para toque (44px no mobile).
- **Botão de play** nos exercícios: círculo lima sólido com ícone play, bem visível.
- **Bottom navigation** no mobile (4–5 ícones), **sidebar** no desktop. Ícone do separador ativo na cor de destaque.

### 8.5 Ícones e ilustração

- Biblioteca: **lucide-react** (linha, consistente). Tamanhos 18–24px.
- Cada grupo muscular / tipo de refeição pode ter o seu ícone para reconhecimento rápido.
- Estados vazios ("ainda não registaste refeições hoje") com ícone + frase curta + botão de ação, nunca um ecrã em branco.

### 8.6 Movimento e micro-interações

- Transições de página e de estado suaves (150–250ms, ease-out). Usar **Framer Motion**.
- Barras e anéis animam do 0 ao valor ao carregar.
- Feedback de toque em botões e cards (scale/opacity subtil).
- Skeletons em vez de spinners quando há carregamento.
- Nada exagerado — o movimento serve a clareza, não a decoração.

### 8.7 Layout

- Largura máxima de conteúdo confortável em desktop (centrado, ~1100px); largura total no mobile.
- Grid responsivo para os cards de macro (3 colunas → 1 coluna no mobile pequeno).
- Espaçamento consistente baseado numa escala de 4px (8 / 12 / 16 / 24 / 32).

### 8.8 Acessibilidade

- Contraste suficiente em ambos os temas (texto muted ≥ 4.5:1 sobre o fundo).
- Áreas de toque ≥ 44px no mobile.
- Estados de foco visíveis. Respeitar `prefers-reduced-motion` (reduzir/desligar animações).

---

## 9. PWA — instalável no telemóvel

A app deve ser instalável no ecrã principal do iPhone e Android e comportar-se como uma app nativa (ecrã inteiro, sem barra de browser).

### 9.1 Requisitos

- **Web App Manifest** (`manifest.json` / `manifest.webmanifest`) com:
  - `name` e `short_name` (ex: "FitPlan")
  - `start_url`: "/"
  - `display`: "standalone" (sem barra do browser)
  - `background_color` e `theme_color` (a cor escura do tema, ex: `#1A1C1E`)
  - `orientation`: "portrait"
  - `icons`: pelo menos 192×192 e 512×512 PNG, mais um ícone **maskable** 512×512 (para Android adaptar a forma). Incluir também `apple-touch-icon` 180×180 para iOS.
- **Service worker** para cache e funcionamento offline. Usar **`next-pwa`** ou **`@serwist/next`** (recomendado para Next.js App Router) para gerar e registar o service worker automaticamente.
  - Estratégia: cache do app shell (precache) + runtime caching das páginas/assets já visitados.
  - Com a cache local dos dados já carregados, a app continua a mostrar nutrição, refeições e treino offline, sincronizando quando a rede voltar.
- **Meta tags no `<head>`** (em `app/layout.tsx`, via metadata do Next.js):
  - `theme-color`
  - `apple-mobile-web-app-capable` = "yes"
  - `apple-mobile-web-app-status-bar-style` = "black-translucent"
  - `apple-mobile-web-app-title`
  - link para `apple-touch-icon`
- **Viewport** já configurado para mobile (`viewport-fit=cover` para usar a área toda incluindo o notch). Respeitar `env(safe-area-inset-*)` no padding da navegação para não ficar por baixo do notch / barra inferior do iPhone.

### 9.2 Instalação (experiência do utilizador)

- **Android (Chrome):** o browser oferece automaticamente "Adicionar ao ecrã principal" / prompt de instalação. Captar o evento `beforeinstallprompt` e mostrar um botão próprio "Instalar app" dentro da app.
- **iOS (Safari):** o iOS não tem prompt automático. Mostrar uma vez uma dica discreta a explicar: tocar no botão Partilhar → "Adicionar ao ecrã principal". Mostrar só em Safari/iOS e só quando ainda não está instalada (detetar `navigator.standalone`).
- Não voltar a mostrar a dica depois de instalada ou dispensada (guardar flag em `localStorage`).

### 9.3 Notas

- Servir sempre por **HTTPS** (obrigatório para service workers). No Dokploy, o HTTPS é tratado automaticamente (Traefik + Let's Encrypt) ao associar um domínio.
- Testar a instalação real em iPhone (Safari) e Android (Chrome) antes de dar como concluído.
- Os ícones podem ser gerados a partir de um único logótipo; deixar os ficheiros em `/public`.

---

## 10. Critérios de aceitação

- [ ] Um utilizador consegue criar conta e fazer login
- [ ] A calculadora produz calorias e macros corretos para qualquer combinação de inputs
- [ ] Mudar de objetivo/atividade recalcula tudo instantaneamente
- [ ] O utilizador consegue registar refeições e ver calorias/macros consumidos vs. alvo
- [ ] Os valores nutricionais escalam corretamente com a quantidade consumida
- [ ] O histórico de refeições é navegável por data
- [ ] O utilizador consegue criar um plano com vários dias e exercícios
- [ ] Cada exercício mostra imagens de demonstração da biblioteca, e pode ter um vídeo do YouTube opcional embebido
- [ ] Reordenar exercícios funciona
- [ ] Um utilizador consegue partilhar um plano e outro aderir por código/link
- [ ] Cada utilizador só vê os seus dados (autorização no backend via JWT), exceto planos partilhados
- [ ] Os dados ficam no servidor e estão disponíveis em qualquer dispositivo após login
- [ ] Totalmente responsivo (mobile + desktop)
- [ ] Suporta unidades métricas e imperiais
- [ ] Instalável no ecrã principal do iPhone e Android (PWA) e abre em ecrã inteiro
- [ ] Mostra a dica de instalação no iOS e o botão de instalar no Android
- [ ] Funciona offline para o conteúdo já carregado

---

## 11. Ordem de implementação sugerida

Estrutura sugerida: **monorepo** com `apps/frontend` (Next.js), `apps/backend` (NestJS) e `packages/shared` (tipos + lógica de nutrição). Alternativamente, dois repositórios separados.

1. Setup do monorepo (frontend Next.js + backend NestJS + pasta shared)
2. Base de dados: schema Prisma (secção 3.2), Postgres local (Docker) para desenvolvimento, primeira migração
3. Backend: autenticação JWT (registo, login, refresh, logout, guard de rotas) — secção 3.1
4. Backend: endpoints CRUD (perfil, refeições, alimentos, planos, exercícios) com autorização por utilizador
5. Lógica de domínio da nutrição (funções puras em `packages/shared`) — `nutrition.ts`
6. Frontend: setup, cliente de API, TanStack Query, fluxo de auth (login/registo, guardar tokens, rotas protegidas)
7. Sistema de design: tokens, tipografia, tema escuro/claro, componentes base (card, botão, barra, anel) — secção 8
8. Layout + navegação (bottom-nav mobile / sidebar desktop) + toggle de tema
9. Perfil + ecrã de resultados da nutrição (ligado à API)
10. Refeições: registo diário + resumo consumido vs. alvo (ligado à API)
11. Biblioteca pessoal de alimentos + seed de alimentos comuns
12. Treino: construtor (dias + exercícios CRUD, reordenar) ligado à API
13. Seed da biblioteca de exercícios (Free Exercise DB → tabela `ExerciseLibrary` + imagens) + pesquisa/seleção no construtor
14. Embed de vídeo (opcional) + vista de treino do dia com imagens de demonstração
15. Partilha de planos: código/link + aderir (modo cópia, secção 6.5a)
16. Dashboard que junta nutrição + refeições do dia + treino de hoje
17. PWA: manifest, ícones, service worker, cache offline, dica de instalação iOS / botão Android, safe-area
18. Deploy no Dokploy (secção 12): Postgres + backend + frontend, domínios e HTTPS
19. Polish, responsividade, progresso (opcional)

---

## 12. Deploy no Dokploy

Tudo corre num VPS com o Dokploy instalado. Três serviços:

### 12.1 Base de dados (PostgreSQL)
- Criar uma base de dados **PostgreSQL** no Dokploy (tem template próprio). Garantir **volume persistente** para os dados não se perderem em redeploys.
- Guardar a connection string; é o `DATABASE_URL` do backend.
- Configurar backups (o Dokploy suporta backups agendados para um destino S3/local).

### 12.2 Backend (NestJS)
- Aplicação a partir do repositório Git (Dokploy faz build via Nixpacks ou Dockerfile próprio).
- Variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (domínio do frontend), porta.
- Correr as **migrações Prisma** no arranque/deploy (`prisma migrate deploy`) e o **seed** dos exercícios uma vez.
- Associar um domínio/subdomínio (ex: `api.oteudominio.com`) — o Dokploy trata do HTTPS.

### 12.3 Frontend (Next.js)
- Aplicação a partir do Git, build de Next.js.
- Variável de ambiente: `NEXT_PUBLIC_API_URL` a apontar para o domínio do backend.
- Associar o domínio principal (ex: `oteudominio.com`) com HTTPS.

### 12.4 Notas
- Definir o `CORS_ORIGIN` do backend para o domínio do frontend (não usar `*` com cookies de auth).
- Se usares cookie httpOnly para o refresh token, os dois serviços devem partilhar um domínio-pai (ex: `app.` e `api.` do mesmo domínio) para o cookie funcionar.
- HTTPS é obrigatório para a PWA — garantido pelo Dokploy ao associar domínios.

---

## 13. Notas finais

- Manter a lógica de cálculo da nutrição em funções puras em `packages/shared`, reutilizadas pelo frontend e backend.
- Comentar as fórmulas no código a referenciar este documento.
- Não inventar IDs de vídeos do YouTube; deixar o utilizador colar ou gerar links de pesquisa.
- **Segredos** (`JWT_SECRET`, `DATABASE_URL`, etc.) só em variáveis de ambiente, nunca no Git. No frontend, só variáveis `NEXT_PUBLIC_` chegam ao cliente — nunca pôr segredos aí.
- Para a partilha de planos, começar pelo modo cópia (6.5a) — resolve o caso "plano base do grupo" sem complexidade.
- A Free Exercise DB é domínio público (sem atribuição obrigatória), mas é simpático creditar a fonte algures nas definições/sobre. O seed corre uma vez; manter o script em `scripts/`.
- Priorizar funcionalidade sobre features extra; o progresso/registo de peso é opcional na primeira versão.
