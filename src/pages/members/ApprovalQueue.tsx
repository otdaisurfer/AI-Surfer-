import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./crew-deck.css";

type EmailDraft = {
  to: string;
  recipientName?: string;
  subject: string;
  body: string;
  replyTo: string;
};

type Approval = {
  id: string;
  status: "pending" | "approved" | "sending" | "sent" | "failed" | "cancelled";
  version: number;
  draft: EmailDraft;
  approved_snapshot?: EmailDraft | null;
  created_at: string;
  last_error_code?: string | null;
};

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const sendKeys = useMemo(() => new Map<string, string>(), []);

  async function load() {
    const { data, error: loadError } = await supabase
      .from("approval_requests")
      .select("id,status,version,draft,approved_snapshot,created_at,last_error_code")
      .order("created_at", { ascending: false });

    if (loadError) setError("We couldn't load the approval queue yet.");
    else setApprovals((data as Approval[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(item: Approval) {
    if (!session?.access_token) return;
    setBusyId(item.id);
    setError("");

    const response = await fetch(`/api/crew/approvals/${item.id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expectedVersion: item.version }),
    });

    if (!response.ok) {
      setError("This draft changed. Review it again before approving.");
    }
    await load();
    setBusyId("");
  }

  async function send(item: Approval) {
    if (!session?.access_token) return;
    const snapshot = item.approved_snapshot || item.draft;
    const confirmed = window.confirm(
      `Send this exact email to ${snapshot.to}? This is the external action.`,
    );
    if (!confirmed) return;

    setBusyId(item.id);
    setError("");
    const key = sendKeys.get(item.id) || crypto.randomUUID();
    sendKeys.set(item.id, key);

    const response = await fetch(`/api/crew/approvals/${item.id}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Idempotency-Key": key,
      },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.message || "The email was not delivered. Review it and try again.");
    }
    await load();
    setBusyId("");
  }

  if (loading) {
    return <main className="crew-page"><p className="crew-loading">🌊 Loading your approval queue…</p></main>;
  }

  return (
    <main className="crew-page">
      <header className="crew-hero">
        <div>
          <button className="crew-button crew-button-secondary" onClick={() => navigate("/members/crew")}>← Crew Deck</button>
          <p className="crew-kicker" style={{ marginTop: 22 }}>HUMAN APPROVAL CHECKPOINT</p>
          <h1>Review every message before it leaves shore.</h1>
          <p className="crew-intro">Drafting and approving are separate. Sending always requires your final confirmation.</p>
        </div>
      </header>

      {error && <p className="crew-error" role="alert">{error}</p>}

      <section style={{ display: "grid", gap: 18 }}>
        {approvals.length === 0 && (
          <div className="crew-panel">
            <h2>No email drafts are waiting.</h2>
            <p className="crew-intro">Sales Rider and Customer Care Cove can prepare messages for this queue.</p>
          </div>
        )}

        {approvals.map((item) => {
          const message = item.approved_snapshot || item.draft;
          return (
            <article className="crew-panel" key={item.id}>
              <div className="crew-card-top">
                <span className="crew-access">{item.status.toUpperCase()}</span>
                <small>{new Date(item.created_at).toLocaleString()}</small>
              </div>
              <dl style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "9px 14px", margin: "22px 0" }}>
                <dt>Recipient</dt><dd style={{ margin: 0 }}>{message.recipientName ? `${message.recipientName} · ` : ""}{message.to}</dd>
                <dt>Subject</dt><dd style={{ margin: 0 }}>{message.subject}</dd>
                <dt>From</dt><dd style={{ margin: 0 }}>Ocean Tide Drop AI SURFER</dd>
                <dt>Replies to</dt><dd style={{ margin: 0 }}>{message.replyTo}</dd>
              </dl>
              <div className="crew-output" style={{ minHeight: 0, padding: 18, borderRadius: 14, background: "rgba(2,10,22,.7)" }}>{message.body}</div>
              <div className="crew-form-actions" style={{ marginTop: 18 }}>
                {item.status === "pending" && (
                  <button className="crew-button" disabled={busyId === item.id} onClick={() => approve(item)}>
                    {busyId === item.id ? "Approving…" : "Approve exact draft"}
                  </button>
                )}
                {["approved", "failed"].includes(item.status) && (
                  <button className="crew-button" disabled={busyId === item.id} onClick={() => send(item)}>
                    {busyId === item.id ? "Sending…" : item.status === "failed" ? "Review & Retry Send" : "Approve & Send"}
                  </button>
                )}
                {item.status === "sent" && <strong style={{ color: "#86efac" }}>✓ Sent successfully</strong>}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
