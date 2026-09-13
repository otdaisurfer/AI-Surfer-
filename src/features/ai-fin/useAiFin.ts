import { useCallback, useRef, useState } from 'react';
import type {
  AccessMode,
  ChatResponse,
  ConversationMessage,
  LeadDraft,
} from './contracts';

export interface AiFinUiMessage extends ConversationMessage {
  id: string;
}

interface SendOptions {
  accessToken?: string;
  lead?: LeadDraft;
  preview?: boolean;
}

const REQUEST_TIMEOUT_MS = 30_000;

export function useAiFin(mode: AccessMode) {
  const [messages, setMessages] = useState<AiFinUiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const lastRequest = useRef<{ text: string; options: SendOptions } | null>(null);
  const activeController = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    activeController.current?.abort();
    activeController.current = null;
    setLoading(false);
  }, []);

  const send = useCallback(
    async (text: string, options: SendOptions = {}) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return null;

      const userMessage: AiFinUiMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      };

      const conversation = messages.slice(-20).map(({ role, content }) => ({ role, content }));
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      activeController.current = controller;
      lastRequest.current = { text: trimmed, options };

      setMessages((current) => [...current, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai-fin/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(mode === 'owner' && options.accessToken
              ? { Authorization: `Bearer ${options.accessToken}` }
              : {}),
          },
          body: JSON.stringify({
            mode,
            message: trimmed,
            conversation,
            ...(options.lead ? { lead: options.lead } : {}),
            ...(mode === 'owner' && options.preview ? { preview: true } : {}),
          }),
          signal: controller.signal,
        });

        const body = (await response.json()) as Partial<ChatResponse> & { error?: string };
        if (!response.ok || typeof body.answer !== 'string') {
          throw new Error(body.error || 'AI Fin could not complete that request.');
        }

        const parsed: ChatResponse = {
          answer: body.answer,
          recommendedProductId: body.recommendedProductId ?? null,
          knowledgeVersion: body.knowledgeVersion ?? null,
          leadSaved: body.leadSaved === true,
          escalationRequired: body.escalationRequired === true,
          traceId: body.traceId,
        };

        setLastResponse(parsed);
        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: 'assistant', content: parsed.answer },
        ]);
        return parsed;
      } catch (requestError) {
        const timedOut = requestError instanceof DOMException && requestError.name === 'AbortError';
        setError(
          timedOut
            ? 'AI Fin took too long to answer. You can retry safely.'
            : requestError instanceof Error
              ? requestError.message
              : 'AI Fin could not complete that request.',
        );
        return null;
      } finally {
        window.clearTimeout(timeout);
        activeController.current = null;
        setLoading(false);
      }
    },
    [loading, messages, mode],
  );

  const retry = useCallback(async () => {
    if (!lastRequest.current) return null;
    return send(lastRequest.current.text, lastRequest.current.options);
  }, [send]);

  const reset = useCallback(() => {
    abort();
    setMessages([]);
    setError(null);
    setLastResponse(null);
    lastRequest.current = null;
  }, [abort]);

  return {
    messages,
    loading,
    error,
    lastResponse,
    send,
    retry,
    abort,
    reset,
  };
}
