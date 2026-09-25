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
});
