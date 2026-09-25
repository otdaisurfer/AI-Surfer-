import { describe, expect, it } from 'vitest';

import { createAiFinAgent } from './_agent';

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

  it('preserves an explicitly configured public model', () => {
    const agent = createAiFinAgent({ ...context, model: 'gpt-4.1' });

    expect(agent.model).toBe('gpt-4.1');
  });
});
