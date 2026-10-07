import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyzeFoodDto } from './dto/analyze.dto';

export interface DetectedFood {
  name: string;
  quantity: number;
  unit: string; // g | ml | unidade
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number; // 0..1
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `És um nutricionista que estima macronutrientes a partir de fotografias de comida.
Identifica cada alimento ou prato visível na imagem. Para cada um, estima a PORÇÃO VISÍVEL e os respetivos macros (para essa porção, não por 100 g).
Quantidade em gramas para sólidos, ml para líquidos, ou "unidade" para itens contáveis (ex.: 1 ovo, 1 fatia).
Responde sempre em português nos nomes dos alimentos e APENAS com JSON que respeite o schema. Não inventes alimentos que não estejam na foto. Se não houver comida reconhecível, devolve uma lista de items vazia.`;

const JSON_SCHEMA = {
  name: 'food_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string', enum: ['g', 'ml', 'unidade'] },
            calories: { type: 'number' },
            protein: { type: 'number' },
            carbs: { type: 'number' },
            fat: { type: 'number' },
            confidence: { type: 'number' },
          },
          required: [
            'name',
            'quantity',
            'unit',
            'calories',
            'protein',
            'carbs',
            'fat',
            'confidence',
          ],
        },
      },
    },
    required: ['items'],
  },
};

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

@Injectable()
export class FoodVisionService {
  private readonly logger = new Logger(FoodVisionService.name);

  constructor(private readonly config: ConfigService) {}

  /** A feature só está ativa se houver chave do OpenRouter configurada. */
  isEnabled(): boolean {
    return !!this.config.get<string>('OPENROUTER_API_KEY');
  }

  async analyze(dto: AnalyzeFoodDto): Promise<{ items: DetectedFood[]; model: string }> {
    const key = this.config.get<string>('OPENROUTER_API_KEY');
    if (!key) {
      throw new ServiceUnavailableException('Análise por foto não está configurada');
    }
    const model = this.config.get<string>('FOOD_VISION_MODEL') || DEFAULT_MODEL;

    const userText = dto.hint?.trim()
      ? `Analisa esta refeição. Pista do utilizador: ${dto.hint.trim()}`
      : 'Analisa esta refeição e estima os alimentos e macros visíveis.';

    // HTTP-Referer é opcional (só serve para atribuição no OpenRouter)
    const referer = this.config.get<string>('OPENROUTER_REFERER');

    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          ...(referer ? { 'HTTP-Referer': referer } : {}),
          'X-Title': 'FitPlan',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: 0.2,
          response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: userText },
                { type: 'image_url', image_url: { url: dto.dataUrl } },
              ],
            },
          ],
        }),
      });
    } catch (e) {
      this.logger.error(`OpenRouter inacessível: ${String(e)}`);
      throw new BadGatewayException('Não foi possível contactar o serviço de análise');
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
      throw new BadGatewayException('O serviço de análise devolveu um erro');
    }

    const data = (await res.json().catch(() => null)) as ChatResponse | null;
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new UnprocessableEntityException('Resposta vazia do serviço de análise');
    }

    const parsed = this.parseContent(content);
    if (!parsed) {
      throw new UnprocessableEntityException('Não foi possível interpretar a análise');
    }

    return { items: this.sanitize(parsed), model };
  }

  /** Extrai o objeto JSON do conteúdo (tolera blocos de código / texto à volta). */
  private parseContent(content: string): { items?: unknown[] } | null {
    const tryParse = (s: string): unknown => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };
    let obj = tryParse(content);
    if (!obj || typeof obj !== 'object') {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) obj = tryParse(m[0]);
    }
    return obj && typeof obj === 'object' ? (obj as { items?: unknown[] }) : null;
  }

  private sanitize(parsed: { items?: unknown[] }): DetectedFood[] {
    const arr = Array.isArray(parsed.items) ? parsed.items : [];
    const num = (v: unknown, max = 100_000): number => {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n) || n < 0) return 0;
      return Math.round(Math.min(n, max) * 10) / 10;
    };
    const out: DetectedFood[] = [];
    for (const raw of arr.slice(0, 12)) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Record<string, unknown>;
      const name = typeof r.name === 'string' ? r.name.trim().slice(0, 80) : '';
      if (!name) continue;
      const unit = r.unit === 'ml' ? 'ml' : r.unit === 'unidade' ? 'unidade' : 'g';
      out.push({
        name,
        quantity: num(r.quantity) || 100,
        unit,
        calories: num(r.calories),
        protein: num(r.protein),
        carbs: num(r.carbs),
        fat: num(r.fat),
        confidence: Math.max(0, Math.min(1, num(r.confidence, 1))),
      });
    }
    return out;
  }
}
