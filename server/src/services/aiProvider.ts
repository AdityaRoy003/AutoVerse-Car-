import { z } from 'zod';
import {
  AIAnalysisResult,
  AIDraftReplyResult,
  AIUsedCarPriceContext,
  AIUsedCarPriceResult,
} from '../types/index.js';

// Structured Zod validation schema for Buyer Needs Summary
export const BuyerSummarySchema = z.object({
  summary: z.string().min(1),
  budget: z.string().nullable(),
  preferredModel: z.string().nullable(),
  fuelPreference: z.string().nullable(),
  transmission: z.string().nullable(),
  purchaseTimeline: z.string().nullable(),
  intent: z.enum(['High', 'Medium', 'Low', 'Unknown']),
  confidence: z.number().min(0).max(1),
});

export const UsedCarPriceSchema = z.object({
  suggestedMinPrice: z.number().min(50000),
  suggestedIdealPrice: z.number().min(50000),
  suggestedMaxPrice: z.number().min(50000),
  confidence: z.number().min(0).max(1),
  marketDemandIndex: z.enum(['High', 'Moderate', 'Soft']),
  rationale: z.string().min(10),
});

export interface LeadEnquiryContext {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  interestedModelName?: string;
  interestedVariantName?: string;
  budgetRange?: string;
  message?: string;
  preferredShowroomName?: string;
}

export interface IAIProvider {
  name: string;
  summariseLead(leadContext: LeadEnquiryContext): Promise<AIAnalysisResult>;
  draftReply(leadContext: LeadEnquiryContext, consultantName?: string): Promise<AIDraftReplyResult>;
  suggestUsedCarPrice(context: AIUsedCarPriceContext): Promise<AIUsedCarPriceResult>;
}

/**
 * Deterministic Fallback Provider
 * Activated when API keys are absent, network times out, or quota is exhausted.
 * Transparently marks provider as 'deterministic_fallback'.
 */
export class DeterministicFallbackProvider implements IAIProvider {
  name = 'deterministic_fallback';

  async summariseLead(lead: LeadEnquiryContext): Promise<AIAnalysisResult> {
    const text = (lead.message || '').toLowerCase();
    
    // Extract budget
    let budget: string | null = lead.budgetRange || null;
    const budgetMatch = text.match(/(\d+[\s-]*\d*\s*(?:lakh|lakhs|cr|crore|k|lac))/i);
    if (budgetMatch) {
      budget = budgetMatch[0];
    }

    // Extract fuel
    let fuel: string | null = null;
    if (text.includes('petrol')) fuel = 'Petrol';
    else if (text.includes('diesel')) fuel = 'Diesel';
    else if (text.includes('electric') || text.includes('ev')) fuel = 'Electric';
    else if (text.includes('hybrid')) fuel = 'Hybrid';
    else if (text.includes('cng')) fuel = 'CNG';

    // Extract transmission
    let transmission: string | null = null;
    if (text.includes('automatic') || text.includes('amt') || text.includes('at') || text.includes('cvt') || text.includes('dct')) {
      transmission = 'Automatic';
    } else if (text.includes('manual')) {
      transmission = 'Manual';
    }

    // Extract timeline
    let timeline: string | null = null;
    if (text.includes('immediate') || text.includes('this week') || text.includes('urgent')) {
      timeline = 'Immediate (Within 7 days)';
    } else if (text.includes('month') || text.includes('30 days')) {
      timeline = 'Within 30 days';
    } else if (text.includes('looking') || text.includes('future') || text.includes('planning')) {
      timeline = 'Next 2-3 months';
    }

    // Determine intent
    let intent: 'High' | 'Medium' | 'Low' | 'Unknown' = 'Medium';
    if (text.includes('book') || text.includes('test drive') || text.includes('buy now') || text.includes('finance')) {
      intent = 'High';
    } else if (text.length < 15 && !lead.interestedModelName) {
      intent = 'Low';
    }

    const preferredModel = lead.interestedModelName || (text.includes('model h') ? 'Model H' : text.includes('model c') ? 'Model C' : text.includes('model s') ? 'Model S' : null);

    const summary = `Buyer ${lead.customerName} enquired regarding ${preferredModel || 'passenger vehicles'}${budget ? ` within budget of ${budget}` : ''}.`;

    return {
      summary,
      budget,
      preferredModel,
      fuelPreference: fuel,
      transmission,
      purchaseTimeline: timeline,
      intent,
      confidence: 0.85,
      needsReview: false,
      provider: this.name,
    };
  }

  async draftReply(lead: LeadEnquiryContext, consultantName = 'Sales Consultant'): Promise<AIDraftReplyResult> {
    const greeting = `Dear ${lead.customerName || 'Valued Customer'},`;
    const modelMention = lead.interestedModelName ? ` the ${lead.interestedModelName}` : ' our premium vehicle lineup';
    const showroomMention = lead.preferredShowroomName ? ` at our ${lead.preferredShowroomName} showroom` : ' at your nearest Autoverse showroom';

    const draft = `${greeting}

Thank you for contacting Autoverse Lucknow regarding${modelMention}.

I am ${consultantName}, your dedicated automotive consultant. Based on your enquiry, I would be delighted to assist you with variant specifications, official on-road price quotations, and finance options.

Would you prefer an executive consultation or a scheduled test drive${showroomMention} this week?

Warm regards,
${consultantName}
Autoverse Authorised Dealership, Lucknow`;

    return {
      draft,
      confidence: 0.90,
      needsReview: false,
      provider: this.name,
      disclaimer: 'Generated via deterministic template fallback. Human review & authorization required before dispatch.',
    };
  }

  async suggestUsedCarPrice(context: AIUsedCarPriceContext): Promise<AIUsedCarPriceResult> {
    const currentYear = 2026;
    const age = Math.max(0, currentYear - context.manufacturingYear);

    // Baseline reference price when new
    let basePrice = 1000000;
    const modelLower = (context.modelName || '').toLowerCase();
    if (modelLower.includes('model h')) basePrice = 1350000;
    else if (modelLower.includes('model c')) basePrice = 920000;
    else if (modelLower.includes('model s')) basePrice = 580000;
    else if (modelLower.includes('model e')) basePrice = 1850000;

    // Depreciation by age: 15% year 1, 9% each subsequent year
    let remainingFraction = 1.0;
    if (age >= 1) remainingFraction -= 0.15;
    if (age > 1) remainingFraction -= (age - 1) * 0.09;
    remainingFraction = Math.max(0.25, remainingFraction); // Residual floor

    let estimatedPrice = basePrice * remainingFraction;

    // Mileage impact: standard 10,000 km/yr
    const expectedKm = Math.max(10000, age * 11000);
    const kmDiff = context.kilometres - expectedKm;
    if (kmDiff > 0) {
      estimatedPrice -= kmDiff * 1.2; // penalty for excess wear
    } else {
      estimatedPrice += Math.min(40000, Math.abs(kmDiff) * 0.5); // bonus for low mileage
    }

    // Ownership penalty
    const owners = context.ownershipCount || 1;
    if (owners === 2) estimatedPrice *= 0.94;
    else if (owners > 2) estimatedPrice *= 0.88;

    // Condition adjustment if 150-point inspection score is provided
    if (context.conditionScore) {
      const conditionMultiplier = 1 + (context.conditionScore - 85) / 300;
      estimatedPrice *= Math.max(0.85, Math.min(1.15, conditionMultiplier));
    }

    // Blend with historical comps if available
    let historicalDataPoints = 0;
    if (context.historicalSales && context.historicalSales.length > 0) {
      historicalDataPoints = context.historicalSales.length;
      const compsAvg = context.historicalSales.reduce((acc, c) => acc + c.price, 0) / historicalDataPoints;
      estimatedPrice = (estimatedPrice * 0.4) + (compsAvg * 0.6);
    }

    // Round to nearest 5,000 INR
    const ideal = Math.max(100000, Math.round(estimatedPrice / 5000) * 5000);
    const minPrice = Math.round((ideal * 0.94) / 5000) * 5000;
    const maxPrice = Math.round((ideal * 1.06) / 5000) * 5000;

    const demand: 'High' | 'Moderate' | 'Soft' =
      age <= 3 && context.kilometres <= 45000 ? 'High' : age <= 6 ? 'Moderate' : 'Soft';

    const rationale = `Valuation calibrated for ${context.manufacturingYear} ${context.modelName} (${context.kilometres.toLocaleString('en-IN')} km, ${owners} owner) using Lucknow market transaction baselines${
      historicalDataPoints > 0 ? ` and ${historicalDataPoints} certified dealership sales records` : ''
    }.`;

    return {
      suggestedMinPrice: minPrice,
      suggestedIdealPrice: ideal,
      suggestedMaxPrice: maxPrice,
      confidence: historicalDataPoints > 2 ? 0.92 : 0.84,
      marketDemandIndex: demand,
      historicalDataPoints,
      rationale,
      provider: this.name,
      disclaimer: 'AI-suggested valuation band is strictly advisory for the Used-Car Manager. Final asking price must be explicitly verified and set by dealership leadership.',
    };
  }
}

/**
 * Google Gemini Provider
 * Uses Google Gemini API (gemini-1.5-flash / gemini-2.0-flash / gemini-pro)
 */
export class GeminiAIProvider implements IAIProvider {
  name = 'google_gemini';
  private apiKey: string;
  private fallback: DeterministicFallbackProvider;
  private timeoutMs: number;

  constructor(apiKey: string, timeoutMs = 8000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.fallback = new DeterministicFallbackProvider();
  }

  async summariseLead(lead: LeadEnquiryContext): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      return this.fallback.summariseLead(lead);
    }

    const prompt = `You are an AI Automotive CRM Lead Intelligence specialist for Autoverse, an authorized luxury car dealership in Lucknow, India.
Analyze the following customer enquiry and extract structured intelligence.

Customer Details:
Name: ${lead.customerName}
Interested Model: ${lead.interestedModelName || 'Not specified'}
Variant: ${lead.interestedVariantName || 'Not specified'}
Stated Budget: ${lead.budgetRange || 'Not specified'}
Customer Message: "${lead.message || 'Customer requested vehicle information and test drive.'}"
Preferred Showroom: ${lead.preferredShowroomName || 'Lucknow'}

Rules:
1. Return strictly a raw valid JSON object (no markdown tags, no backticks).
2. Fields must exactly match:
{
  "summary": "1-2 sentence executive summary of buyer interest",
  "budget": "Extracted budget e.g. '12-15 lakh' or null if unknown",
  "preferredModel": "Car model name or null",
  "fuelPreference": "Petrol | Diesel | Electric | Hybrid | CNG or null",
  "transmission": "Manual | Automatic or null",
  "purchaseTimeline": "Estimated purchase timeline or null",
  "intent": "High" | "Medium" | "Low" | "Unknown",
  "confidence": number between 0.0 and 1.0 based on factual clarity in customer text
}
3. Do NOT invent specifications or discounts absent from customer statement. Use null for unknown fields.`;

    try {
      const responseText = await this.callGeminiAPI(prompt);
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const validated = BuyerSummarySchema.parse(parsed);

      return {
        summary: validated.summary,
        budget: validated.budget,
        preferredModel: validated.preferredModel,
        fuelPreference: validated.fuelPreference,
        transmission: validated.transmission,
        purchaseTimeline: validated.purchaseTimeline,
        intent: validated.intent,
        confidence: validated.confidence,
        needsReview: validated.confidence < 0.70,
        provider: this.name,
      };
    } catch (err) {
      console.warn('[Gemini AI Provider] Error or validation failure, using graceful fallback:', err);
      const fallbackResult = await this.fallback.summariseLead(lead);
      fallbackResult.needsReview = true;
      return fallbackResult;
    }
  }

  async draftReply(lead: LeadEnquiryContext, consultantName = 'Sales Consultant'): Promise<AIDraftReplyResult> {
    if (!this.apiKey) {
      return this.fallback.draftReply(lead, consultantName);
    }

    const prompt = `You are drafting a professional, courteous first response email/message on behalf of sales consultant "${consultantName}" from Autoverse Dealership Lucknow.
Customer Name: ${lead.customerName}
Interested Model: ${lead.interestedModelName || 'our vehicles'}
Customer Enquiry: "${lead.message || 'I am interested in exploring options and taking a test drive.'}"
Showroom: ${lead.preferredShowroomName || 'Lucknow Central'}

CRITICAL COMPLIANCE RULES:
- Never fabricate discounts, unapproved cash offers, or delivery deadlines.
- Never guarantee unavailable inventory or make up vehicle specifications.
- Tone must be polite, premium, respectful, and helpful.
- Invite the customer for an executive showroom consultation or test drive.
- Keep the reply between 80 to 140 words.
- Return ONLY the text of the message draft.`;

    try {
      const reply = await this.callGeminiAPI(prompt);
      const cleaned = reply.replace(/```/g, '').trim();

      return {
        draft: cleaned,
        confidence: 0.92,
        needsReview: false,
        provider: this.name,
        disclaimer: 'AI-generated draft using Google Gemini. Requires consultant review & approval before dispatch.',
      };
    } catch (err) {
      console.warn('[Gemini AI Provider] Draft reply error, falling back to deterministic template:', err);
      return this.fallback.draftReply(lead, consultantName);
    }
  }

  async suggestUsedCarPrice(context: AIUsedCarPriceContext): Promise<AIUsedCarPriceResult> {
    if (!this.apiKey) {
      return this.fallback.suggestUsedCarPrice(context);
    }

    const compsText = context.historicalSales && context.historicalSales.length > 0
      ? `Historical Certified Sales Records:\n${context.historicalSales
          .map((s) => `- Year ${s.year}, ${s.kilometres.toLocaleString('en-IN')} km: Sold at ₹${s.price.toLocaleString('en-IN')}`)
          .join('\n')}`
      : 'No prior identical model transaction records in database.';

    const prompt = `You are a certified automotive valuation AI specialist for Autoverse Dealership in Lucknow, India.
Analyze the following certified used car specifications and recent market comps to recommend a statistically sound retail price band in INR (₹).

Target Vehicle:
Model: ${context.modelName}
Manufacturing Year: ${context.manufacturingYear}
Odometer: ${context.kilometres.toLocaleString('en-IN')} km
Fuel Type: ${context.fuelType || 'Petrol'}
Transmission: ${context.transmission || 'Manual'}
Ownership Count: ${context.ownershipCount || 1} Owner(s)
${compsText}

RULES:
1. Return strictly a raw valid JSON object (no markdown, no backticks).
2. The JSON must match:
{
  "suggestedMinPrice": number (in INR, e.g. 810000),
  "suggestedIdealPrice": number (in INR, e.g. 845000),
  "suggestedMaxPrice": number (in INR, e.g. 880000),
  "confidence": number between 0.0 and 1.0,
  "marketDemandIndex": "High" | "Moderate" | "Soft",
  "rationale": "2-3 sentences explaining market valuation logic, depreciation curve, and Lucknow demand."
}
3. Price figures must be reasonable and realistic for Indian passenger car market.`;

    try {
      const responseText = await this.callGeminiAPI(prompt);
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const validated = UsedCarPriceSchema.parse(parsed);

      return {
        suggestedMinPrice: Math.round(validated.suggestedMinPrice / 5000) * 5000,
        suggestedIdealPrice: Math.round(validated.suggestedIdealPrice / 5000) * 5000,
        suggestedMaxPrice: Math.round(validated.suggestedMaxPrice / 5000) * 5000,
        confidence: validated.confidence,
        marketDemandIndex: validated.marketDemandIndex,
        historicalDataPoints: context.historicalSales?.length || 0,
        rationale: validated.rationale,
        provider: this.name,
        disclaimer: 'AI-suggested valuation band is strictly advisory for the Used-Car Manager. Final asking price must be explicitly verified and set by dealership leadership.',
      };
    } catch (err) {
      console.warn('[Gemini AI Provider] Price band suggestion error, falling back to deterministic calculation:', err);
      return this.fallback.suggestUsedCarPrice(context);
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}: ${res.statusText}`);
      }

      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * AI Provider Factory based on environment configuration
 */
export class AIService {
  private static provider: IAIProvider;

  static getProvider(): IAIProvider {
    if (!this.provider) {
      const providerType = process.env.AI_PROVIDER || 'gemini';
      const geminiKey = process.env.GEMINI_API_KEY || '';

      if (providerType === 'gemini' && geminiKey) {
        this.provider = new GeminiAIProvider(geminiKey);
      } else {
        // Safe deterministic fallback when key is not set
        this.provider = new DeterministicFallbackProvider();
      }
    }
    return this.provider;
  }
}

