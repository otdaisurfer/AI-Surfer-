import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, Loader2, LockKeyhole, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AccessMode, LeadDraft } from './contracts';
import { useAiFin } from './useAiFin';

const OWNER_TIMEOUT_MS = 15 * 60 * 1000;

interface AiFinChatProps {
  mode: AccessMode;
  embedded?: boolean;
}

interface LeadFormState {
  name: string;
  email: string;
  company: string;
  website: string;
  problem: string;
  budgetRange: string;
  preferredContactMethod: string;
  consent: boolean;
}

const EMPTY_LEAD: LeadFormState = {
  name: '',
  email: '',
  company: '',
  website: '',
  problem: '',
  budgetRange: '',
  preferredContactMethod: 'Email',
  consent: false,
};

function formatProductId(value: string | null | undefined) {
  if (!value) return null;
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AiFinChat({ mode, embedded = false }: AiFinChatProps) {
  const isOwner = mode === 'owner';
  const { session, signOut } = useAuth();
  const { messages, loading, error, lastResponse, send, retry, abort, reset } = useAiFin(mode);
  const [open, setOpen] = useState(isOwner || embedded);
  const [input, setInput] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [lead, setLead] = useState<LeadFormState>(EMPTY_LEAD);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, loading, error]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => composerRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!isOwner || !session || locked) return;

    let timer = window.setTimeout(async () => {
      setLocked(true);
      abort();
      try {
        await signOut();
      } catch {
        // Server-side owner verification still prevents access even if sign-out has a provider hiccup.
      }
    }, OWNER_TIMEOUT_MS);

    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        setLocked(true);
        abort();
        try {
          await signOut();
        } catch {
          // See note above.
        }
      }, OWNER_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'focus'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [abort, isOwner, locked, session, signOut]);

  const accessToken = isOwner ? session?.access_token : undefined;
  const recommendation = formatProductId(lastResponse?.recommendedProductId);

  const welcome = useMemo(
    () =>
      isOwner
        ? "Owner Mode is on. Ask me about products, pricing, leads, proposals, or what we should sell next."
        : "Hi, I’m AI Fin 🐬. Tell me what kind of business you run and the biggest thing you want AI to help you solve.",
    [isOwner],
  );

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    await send(text, { accessToken });
  }

  async function submitLead(event: FormEvent) {
    event.preventDefault();
    setLeadStatus(null);

    if (!lead.consent) {
      setLeadStatus('Please check the consent box before submitting your information.');
      return;
    }

    if (!lead.name.trim() || !lead.email.trim() || !lead.problem.trim()) {
      setLeadStatus('Name, email, and the problem you want help with are required.');
      return;
    }

    const consentAt = new Date().toISOString();
    const draft: LeadDraft = {
      name: lead.name.trim(),
      email: lead.email.trim(),
      company: lead.company.trim() || undefined,
      website: lead.website.trim() || undefined,
      problem: lead.problem.trim(),
      budgetRange: lead.budgetRange.trim() || undefined,
      preferredContactMethod: lead.preferredContactMethod || undefined,
      consent: true,
      consentAt,
    };

    const result = await send('Please save my contact request so the AI SURFER team can follow up.', {
      accessToken,
      lead: draft,
    });

    if (result?.leadSaved) {
      setLeadStatus('You’re in the wave queue 🌊. Your contact request was saved.');
      setLead(EMPTY_LEAD);
      setShowLeadForm(false);
    } else if (result) {
      setLeadStatus('Your chat is safe, but the contact request did not save. Please try again.');
    }
  }

  if (!open && !embedded) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI Fin"
        style={styles.launcher}
      >
        <Sparkles size={18} />
        <span>Ask AI Fin</span>
        <span style={styles.launcherDot} />
      </button>
    );
  }

  if (locked) {
    return (
      <section style={isOwner ? styles.ownerShell : styles.panel} aria-live="polite">
        <div style={styles.lockedCard}>
          <LockKeyhole size={34} />
          <h2 style={{ margin: 0 }}>Owner Mode locked</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>
            The 15-minute inactivity window ended. Sign in again to reopen private AI Fin access.
          </p>
          <a href="/login" style={styles.primaryButton}>Sign in again</a>
        </div>
      </section>
    );
  }

  return (
    <section
      style={isOwner || embedded ? styles.ownerShell : styles.panel}
      aria-label={isOwner ? 'AI Fin Owner Mode' : 'AI Fin business assistant'}
    >
      <header style={styles.header}>
        <div style={styles.identity}>
          <div style={styles.avatar}><Bot size={22} /></div>
          <div>
            <div style={styles.titleRow}>
              <strong>AI Fin</strong>
              <span style={styles.onlineBadge}>● ONLINE</span>
            </div>
            <small style={styles.subtitle}>
              {isOwner ? 'Protected Owner Mode' : 'AI SURFER Business Guide'}
            </small>
          </div>
        </div>
        {!isOwner && !embedded && (
          <button type="button" onClick={() => setOpen(false)} aria-label="Close AI Fin" style={styles.iconButton}>
            <X size={19} />
          </button>
        )}
      </header>

      <div ref={transcriptRef} style={styles.transcript} role="log" aria-live="polite" aria-relevant="additions">
        <div style={styles.assistantMessage}>{welcome}</div>
        {messages.map((message) => (
          <div
            key={message.id}
            style={message.role === 'user' ? styles.userMessage : styles.assistantMessage}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.assistantMessage, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            AI Fin is checking the wave...
          </div>
        )}
        {error && (
          <div style={styles.errorCard} role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void retry()} style={styles.textButton}>Retry</button>
          </div>
        )}
      </div>

      {lastResponse && (recommendation || lastResponse.escalationRequired) && (
        <div style={styles.signalBar}>
          {recommendation && <span>Best fit: <strong>{recommendation}</strong></span>}
          {lastResponse.escalationRequired && <span>Owner review needed</span>}
        </div>
      )}

      {!isOwner && showLeadForm && (
        <form onSubmit={submitLead} style={styles.leadForm}>
          <div style={styles.leadHeader}>
            <strong>Have the AI SURFER team follow up</strong>
            <button type="button" onClick={() => setShowLeadForm(false)} style={styles.iconButton} aria-label="Close contact form">
              <ChevronDown size={18} />
            </button>
          </div>
          <div style={styles.fieldGrid}>
            <input aria-label="Name" placeholder="Name *" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} style={styles.field} />
            <input aria-label="Email" placeholder="Email *" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} style={styles.field} />
            <input aria-label="Company" placeholder="Company" value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} style={styles.field} />
            <input aria-label="Website" placeholder="https://yourwebsite.com" type="url" value={lead.website} onChange={(e) => setLead({ ...lead, website: e.target.value })} style={styles.field} />
          </div>
          <textarea aria-label="Business problem" placeholder="What do you want help solving? *" value={lead.problem} onChange={(e) => setLead({ ...lead, problem: e.target.value })} style={{ ...styles.field, minHeight: 72, resize: 'vertical' }} />
          <div style={styles.fieldGrid}>
            <input aria-label="Budget range" placeholder="Approx. budget" value={lead.budgetRange} onChange={(e) => setLead({ ...lead, budgetRange: e.target.value })} style={styles.field} />
            <select aria-label="Preferred contact method" value={lead.preferredContactMethod} onChange={(e) => setLead({ ...lead, preferredContactMethod: e.target.value })} style={styles.field}>
              <option>Email</option>
              <option>Phone</option>
              <option>Text</option>
            </select>
          </div>
          <label style={styles.consentRow}>
            <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
            <span>I agree to let Ocean Tide Drop AI SURFER save these details and contact me about my request.</span>
          </label>
          <button type="submit" disabled={loading || !lead.consent} style={{ ...styles.primaryButton, opacity: loading || !lead.consent ? 0.55 : 1 }}>
            Send my request
          </button>
          {leadStatus && <small style={{ color: '#d9eaff' }}>{leadStatus}</small>}
        </form>
      )}

      <form onSubmit={handleSend} style={styles.composer}>
        <input
          ref={composerRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={isOwner ? 'Ask AI Fin anything about the business...' : 'Tell AI Fin what you need help with...'}
          aria-label="Message AI Fin"
          style={styles.composerInput}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" style={styles.sendButton}>
          <Send size={18} />
        </button>
      </form>

      <footer style={styles.footer}>
        {!isOwner && (
          <button type="button" onClick={() => setShowLeadForm((value) => !value)} style={styles.textButton}>
            <MessageCircle size={14} /> Have the team contact me
          </button>
        )}
        {isOwner && <span>Auto-locks after 15 minutes of inactivity</span>}
        <button type="button" onClick={reset} style={styles.textButton}>Clear chat</button>
      </footer>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  launcher: {
    position: 'fixed',
    right: 18,
    bottom: 18,
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid rgba(255,255,255,.35)',
    borderRadius: 999,
    padding: '13px 17px',
    background: 'linear-gradient(135deg,#ff4fb8,#6b5cff 52%,#14d9ff)',
    color: 'white',
    fontWeight: 900,
    boxShadow: '0 20px 55px rgba(22,13,82,.48),0 0 28px rgba(20,217,255,.22)',
    cursor: 'pointer',
  },
  launcherDot: { width: 7, height: 7, borderRadius: 99, background: '#64ffb7', boxShadow: '0 0 10px #64ffb7' },
  panel: {
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 95,
    width: 'min(410px, calc(100vw - 24px))',
    height: 'min(680px, calc(100vh - 32px))',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 24,
    background: 'linear-gradient(180deg,rgba(6,12,38,.98),rgba(9,18,55,.98))',
    color: 'white',
    boxShadow: '0 30px 90px rgba(0,0,0,.5),0 0 55px rgba(20,217,255,.12)',
    backdropFilter: 'blur(18px)',
    fontFamily: 'Inter,system-ui,sans-serif',
  },
  ownerShell: {
    width: 'min(980px, calc(100% - 32px))',
    minHeight: '70vh',
    maxHeight: 'calc(100vh - 160px)',
    margin: '24px auto 48px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: 28,
    background: 'linear-gradient(180deg,#07102b,#0a1740)',
    color: 'white',
    boxShadow: '0 30px 90px rgba(0,0,0,.32),0 0 45px rgba(255,79,184,.09)',
    fontFamily: 'Inter,system-ui,sans-serif',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.025)' },
  identity: { display: 'flex', alignItems: 'center', gap: 11 },
  avatar: { width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 16, background: 'linear-gradient(135deg,#ff4fb8,#25d9ff)', boxShadow: '0 0 25px rgba(37,217,255,.2)' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  onlineBadge: { fontSize: 9, letterSpacing: '.08em', color: '#70ffb8', border: '1px solid rgba(112,255,184,.35)', borderRadius: 999, padding: '3px 6px' },
  subtitle: { opacity: 0.7 },
  iconButton: { border: 0, background: 'transparent', color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 7, borderRadius: 9 },
  transcript: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, scrollBehavior: 'smooth' },
  assistantMessage: { alignSelf: 'flex-start', maxWidth: '88%', padding: '11px 13px', borderRadius: '15px 15px 15px 4px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)', lineHeight: 1.48, whiteSpace: 'pre-wrap' },
  userMessage: { alignSelf: 'flex-end', maxWidth: '88%', padding: '11px 13px', borderRadius: '15px 15px 4px 15px', background: 'linear-gradient(135deg,rgba(255,79,184,.9),rgba(104,82,255,.92))', lineHeight: 1.48, whiteSpace: 'pre-wrap' },
  errorCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid rgba(255,120,145,.35)', background: 'rgba(255,70,100,.1)', borderRadius: 12, padding: 10, color: '#ffdce5' },
  signalBar: { display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '9px 16px', fontSize: 12, background: 'rgba(20,217,255,.07)', borderTop: '1px solid rgba(20,217,255,.13)', borderBottom: '1px solid rgba(20,217,255,.13)' },
  leadForm: { display: 'grid', gap: 9, padding: 14, background: 'rgba(255,79,184,.06)', borderTop: '1px solid rgba(255,79,184,.16)' },
  leadHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 },
  field: { boxSizing: 'border-box', width: '100%', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '9px 10px', background: 'rgba(3,8,26,.72)', color: 'white', outline: 'none' },
  consentRow: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, lineHeight: 1.35, color: '#cbd8f3' },
  primaryButton: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', border: 0, borderRadius: 10, padding: '10px 13px', background: 'linear-gradient(135deg,#ff4fb8,#6a5cff)', color: 'white', fontWeight: 800, textDecoration: 'none', cursor: 'pointer' },
  composer: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,.1)', background: 'rgba(2,6,22,.72)' },
  composerInput: { flex: 1, minWidth: 0, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '11px 12px', background: 'rgba(255,255,255,.06)', color: 'white', outline: 'none' },
  sendButton: { width: 42, height: 42, display: 'grid', placeItems: 'center', border: 0, borderRadius: 12, background: 'linear-gradient(135deg,#ff4fb8,#12d9ff)', color: 'white', cursor: 'pointer' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 12px 11px', fontSize: 10.5, color: '#9fb0ce', background: 'rgba(2,6,22,.72)' },
  textButton: { display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', color: '#99e9ff', cursor: 'pointer', padding: 0, font: 'inherit' },
  lockedCard: { margin: 'auto', maxWidth: 460, display: 'grid', justifyItems: 'center', gap: 14, padding: 28, textAlign: 'center' },
};