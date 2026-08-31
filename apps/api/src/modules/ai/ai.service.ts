import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

@Injectable()
export class AiService {
  private logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  private hasKey() {
    return !!process.env.OPENAI_OR_LLM_API_KEY;
  }

  private async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_OR_LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(`OpenAI call failed: ${res.status} ${errText}`);
      throw new Error('AI request failed');
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }

  async generateStoreDescription(name: string, category?: string): Promise<string> {
    if (!this.hasKey()) {
      // Safe fallback so the app never crashes just because a key isn't configured yet.
      return `${name} offers quality ${category ?? 'products'} with fast delivery and buyer protection on every order.`;
    }
    try {
      return await this.chat(
        'You write short, friendly e-commerce store descriptions. Keep it to 2 sentences, no hashtags, no emojis.',
        `Store name: ${name}. Category: ${category ?? 'general'}. Write a store description.`,
      );
    } catch {
      return `${name} offers quality ${category ?? 'products'} with fast delivery and buyer protection on every order.`;
    }
  }

  // AI Employee — grounded FAQ-style replies using ONLY this store's real product data.
  // Not a free-roaming agent: if the store data doesn't answer the question, it says so
  // and defers to the human seller, rather than inventing an answer (design.md scope).
  async employeeReply(storeId: string, message: string): Promise<string> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { listings: { include: { product: true }, take: 15 } },
    });
    if (!store) return "I couldn't find your store's data — please try again.";

    const catalogSummary = store.listings
      .map((l) => `- ${l.product.title}: $${Number(l.price)}, stock ${l.stock}${l.isBestDeal ? ', BEST DEAL' : ''}`)
      .join('\n');

    const systemPrompt = `You are a customer-support assistant for the store "${store.name}".
Only answer using the product catalog data below. If the question can't be answered from this
data, politely say you'll connect them with the seller directly — never make up prices, stock,
policies, or shipping details that aren't given here.

Catalog:
${catalogSummary || '(no products listed yet)'}`;

    if (!this.hasKey()) {
      return "AI replies aren't configured yet (missing API key) — for now, please respond to customers directly.";
    }
    try {
      return await this.chat(systemPrompt, message);
    } catch {
      return 'Sorry, the AI assistant is temporarily unavailable — please respond to this customer directly.';
    }
  }

    // Turns a raw speech-to-text transcript ("I do plumbing and pipe fitting, I've
  // been working in Rawalpindi for 5 years, I also fix water heaters...") into
  // structured provider-profile fields. The frontend does speech-to-text via the
  // browser's Web Speech API (free, no extra infra) — this only handles the NLP
  // extraction step, grounded to the real category list so it can't invent
  // categories that don't exist on the platform.
  async extractProviderProfile(
    transcript: string,
    categorySlugs: string[],
  ): Promise<{ bio: string; skills: string[]; matchedCategorySlugs: string[] }> {
    const fallback = {
      bio: transcript.slice(0, 300),
      skills: [] as string[],
      matchedCategorySlugs: [] as string[],
    };

    if (!this.hasKey()) return fallback;

    const systemPrompt = `You extract structured service-provider profile data from a spoken
description. Respond ONLY with strict JSON, no markdown, no explanation, in this exact shape:
{"bio": "2-sentence professional summary", "skills": ["skill1", "skill2"], "matchedCategorySlugs": ["slug1"]}

Only use category slugs from this exact list (omit anything that doesn't clearly match):
${categorySlugs.join(', ')}

Keep skills short (1-3 words each), max 8 skills. Never invent categories outside the list.`;

    try {
      const raw = await this.chat(systemPrompt, transcript);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        bio: typeof parsed.bio === 'string' ? parsed.bio : fallback.bio,
        skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 8) : [],
        matchedCategorySlugs: Array.isArray(parsed.matchedCategorySlugs)
          ? parsed.matchedCategorySlugs.filter((s: string) => categorySlugs.includes(s))
          : [],
      };
    } catch (err) {
      this.logger.error(`extractProviderProfile parse failed: ${err}`);
      return fallback;
    }
  }
}