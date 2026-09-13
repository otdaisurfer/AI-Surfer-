import { setDefaultOpenAIKey, setTracingDisabled } from '@openai/agents';
import { z } from 'zod';
import { createServerSupabase, resolveAccessMode, type AiFinEnv, AiFinAuthError } from './_auth';
import { loadKnowledge } from './_knowledge';
import { saveLead } from './_lead';
import { runAiFin } from './_agent';
import type { ChatRequest } from '../../../src/features/ai-fin/contracts';

interface AiFinPagesEnv extends AiFinEnv {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  AI_FIN_ALLOWED_ORIGINS?: string;
}

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const LeadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  company: z.string().max(160).optional(),
  website: z.string().url().max(500).optional(),
  problem: z.string().min(1).max(1200),
  budgetRange: z.string().max(120).optional(),
  preferredContactMethod: z.string().max(120).optional(),
  consent: z.literal(true),
  consentAt: z.string().datetime(),
});

const PublicChatSchema = z.object({
  mode: z.literal('public'),
  message: z.string().min(1).max(6000),
  conversation: z.array(MessageSchema).max(24).optional(),
  lead: LeadSchema.optional(),
}).strict();

const OwnerChatSchema = z.object({
  mode: z.literal('owner'),
  message: z.string().min(1).max(6000),
  conversation: z.array(MessageSchema).max(24).optional(),
  lead: LeadSchema.optional(),
  preview: z.boolean().optional(),
}).strict();

const ChatSchema = z.discriminatedUnion('mode', [PublicChatSchema, OwnerChatSchema]);
const MAX_BODY_BYTES = 32 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

function allowedOrigins(env: AiFinPagesEnv): Set<string> {
  const configured = (env.AI_FIN_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    'https://otdaisurfer.surf',
    'https://www.otdaisurfer.surf',
    ...configured,
  ]);
}

function corsHeaders(request: Request, env: AiFinPagesEnv): HeadersInit {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  };

  if (origin && allowedOrigins(env).has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }

  return headers;
}

function jsonResponse(
  request: Request,
  env: AiFinPagesEnv,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request, env),
  });
}

function isOriginAllowed(request: Request, env: AiFinPagesEnv): boolean {
  const origin = request.headers.get('origin');
  return !origin || allowedOrigins(env).has(origin);
}

function rateKey(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function consumeRateLimit(request: Request, now = Date.now()): boolean {
  const key = rateKey(request);
  const existing = rateBuckets.get(key);

  if (!existing || now >= existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT) return false;
  existing.count += 1;
  return true;
}

async function parseRequest(request: Request): Promise<ChatRequest> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Error('PAYLOAD_TOO_LARGE');
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw new Error('PAYLOAD_TOO_LARGE');
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }

  return ChatSchema.parse(json) as ChatRequest;
}

export async function handleAiFinChat(
  request: Request,
  env: AiFinPagesEnv,
): Promise<Response> {
  const traceId = crypto.randomUUID();

  if (!isOriginAllowed(request, env)) {
    return jsonResponse(request, env, { error: 'Origin not allowed', traceId }, 403);
  }

  if (!consumeRateLimit(request)) {
    return jsonResponse(request, env, { error: 'Too many requests', traceId }, 429);
  }

  if (!env.OPENAI_API_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      request,
      env,
      { error: 'AI Fin is temporarily unavailable', traceId },
      503,
    );
  }

  let input: ChatRequest;
  try {
    input = await parseRequest(request);
  } catch (error) {
    if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
      return jsonResponse(request, env, { error: 'Request too large', traceId }, 413);
    }
    return jsonResponse(request, env, { error: 'Invalid request', traceId }, 400);
  }

  try {
    const supabase = createServerSupabase(env);
    const access = await resolveAccessMode(request, env, supabase);

    if (input.mode === 'owner' && access.mode !== 'owner') {
      return jsonResponse(request, env, { error: 'Owner authentication required', traceId }, 403);
    }

    const effectiveMode = input.mode === 'owner' ? 'owner' : 'public';
    const preview = effectiveMode === 'owner' && input.preview === true;
    const knowledge = await loadKnowledge(supabase, effectiveMode, { preview, limit: 120 });

    let leadSaved = false;
    if (input.lead) {
      try {
        await saveLead(supabase, input.lead);
        leadSaved = true;
      } catch {
        return jsonResponse(
          request,
          env,
          {
            answer:
              'Your chat is safe, but I could not save your contact request. Please try submitting it again.',
            recommendedProductId: null,
            knowledgeVersion: null,
            leadSaved: false,
            escalationRequired: false,
            traceId,
          },
          503,
        );
      }
    }

    setDefaultOpenAIKey(env.OPENAI_API_KEY);
    // AI Fin conversations can contain lead details and owner-only context. Disable
    // SDK trace export by default so raw chat/tool payloads are not copied into traces.
    setTracingDisabled(true);

    const response = await runAiFin(input, {
      mode: effectiveMode,
      knowledge,
      model: env.OPENAI_MODEL,
      traceId,
      leadSaved,
      saveLead: (lead) => saveLead(supabase, lead),
    });

    return jsonResponse(request, env, response, 200);
  } catch (error) {
    if (error instanceof AiFinAuthError) {
      return jsonResponse(request, env, { error: 'Authentication failed', traceId }, 401);
    }

    return jsonResponse(
      request,
      env,
      {
        answer:
          'AI Fin hit a temporary snag. Nothing was submitted or saved. Please try again.',
        recommendedProductId: null,
        knowledgeVersion: null,
        leadSaved: false,
        escalationRequired: false,
        traceId,
      },
      503,
    );
  }
}

export const onRequestOptions: PagesFunction<AiFinPagesEnv> = async (context) => {
  if (!isOriginAllowed(context.request, context.env)) {
    return jsonResponse(context.request, context.env, { error: 'Origin not allowed' }, 403);
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(context.request, context.env),
  });
};

export const onRequestPost: PagesFunction<AiFinPagesEnv> = async (context) =>
  handleAiFinChat(context.request, context.env);
