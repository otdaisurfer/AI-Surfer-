import { describe, expect, it } from 'vitest';

import { buildAiFinFallbackResponse, createAiFinAgent } from './_agent';

const context = {
  mode: 'public' as const,
  knowledge: [],
  saveLead: async () => ({ id: 'lead-1' }),
  traceId: 'trace-test',
};

describe('AI Fin agent model selection', () => {
  it('uses the current low-cost OpenAI model by default', () => {
    const agent = createAiFinAgent(context);

    expect(agent.model).toBe('gpt-4.1-mini');
  });

  it('replaces legacy internal model aliases from the deployment environment', () => {
    const agent = createAiFinAgent({ ...context, model: 'gpt-5.6-terra' });

    expect(agent.model).toBe('gpt-4.1-mini');
  });

  it('replaces the ChatGPT Sol alias from the deployment environment', () => {
    const agent = createAiFinAgent({ ...context, model: 'gpt-5.6-sol' });

    expect(agent.model).toBe('gpt-4.1-mini');
  });

  it('preserves an explicitly configured public model', () => {
    const agent = createAiFinAgent({ ...context, model: 'gpt-4.1' });

    expect(agent.model).toBe('gpt-4.1');
  });
});

describe('AI Fin safe fallback', () => {
  it('gives public visitors a useful next step when the model runtime fails', () => {
    const response = buildAiFinFallbackResponse(
      { mode: 'public', message: 'What can you help a local business with?' },
      context,
    );

    expect(response.answer).toContain('Free AI Wave Check');
    expect(response.answer).not.toContain('temporary snag');
    expect(response.leadSaved).toBe(false);
    expect(response.recommendedProductId).toBeNull();
  });

  it('routes a clear follow-up problem to Wave Starter without claiming a saved lead', () => {
    const response = buildAiFinFallbackResponse(
      { mode: 'public', message: 'We lose leads because our follow-up is slow.' },
      context,
    );

    expect(response.answer).toContain('Wave Starter');
    expect(response.recommendedProductId).toBe('wave-starter');
    expect(response.leadSaved).toBe(false);
  });

  it('quotes only approved offer prices from the product catalog', () => {
    const response = buildAiFinFallbackResponse(
      { mode: 'public', message: 'What do your packages cost?' },
      context,
    );

    expect(response.answer).toContain('Wave Starter at $497');
    expect(response.answer).toContain('Wave Builder at $1,997');
    expect(response.answer).toContain('Tsunami Growth at $3,997');
  });
});
