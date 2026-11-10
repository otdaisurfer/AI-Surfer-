import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

type Props = {
  projectId: string;
  agentSlug: string;
  output: string;
};

export default function EmailDraftPanel({ projectId, agentSlug, output }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(output);
  const [replyTo, setReplyTo] = useState(user?.email ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBody(output);
  }, [output]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("business_profiles")
      .select("reply_to_email")
      .eq("auth_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.reply_to_email) setReplyTo(data.reply_to_email);
      });
  }, [user]);

  if (!["sales-rider", "customer-care-cove"].includes(agentSlug)) return null;

  async function saveForApproval() {
    if (!user || !to || !subject || !body || !replyTo) return;
    setSaving(true);
    setError("");

    const { error: saveError } = await supabase
      .from("approval_requests")
      .insert({
        auth_id: user.id,
        project_id: projectId,
        action_type: "send_email",
        status: "pending",
        version: 1,
        draft: {
          to,
          recipientName: recipientName || undefined,
          subject,
          body,
          replyTo,
        },
      });

    if (saveError) {
      setError("We couldn't place this email in the approval queue yet.");
      setSaving(false);
      return;
    }

    navigate("/members/crew/approvals");
  }

  if (!open) {
    return (
      <button className="crew-button" onClick={() => setOpen(true)}>
        Prepare an email for approval →
      </button>
    );
  }

  return (
    <section className="crew-panel" style={{ marginTop: 18 }}>
      <p className="crew-kicker">APPROVAL-GATED EMAIL</p>
      <h3>Prepare the exact message</h3>
      <p className="crew-intro">Saving creates a draft only. Nothing is sent from this screen.</p>
      <div className="crew-profile-form">
        <label>Recipient name<input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} /></label>
        <label>Recipient email<input required type="email" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <label className="crew-wide">Subject<input required value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
        <label className="crew-wide">Message<textarea required value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <label className="crew-wide">Replies go to<input required type="email" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} /></label>
      </div>
      {error && <p className="crew-error" role="alert">{error}</p>}
      <div className="crew-form-actions" style={{ marginTop: 14 }}>
        <button className="crew-button crew-button-secondary" onClick={() => setOpen(false)}>Cancel</button>
        <button className="crew-button" disabled={saving || !to || !subject || !body} onClick={saveForApproval}>
          {saving ? "Saving…" : "Save to Approval Queue"}
        </button>
      </div>
    </section>
  );
}
