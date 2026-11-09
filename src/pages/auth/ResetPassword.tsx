import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [checkingLink, setCheckingLink] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let recoveryObserved = false;
    const callbackParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const callbackHasError = callbackParams.has("error") || callbackParams.has("error_code");

    if (callbackHasError) {
      setHasRecoverySession(false);
      setCheckingLink(false);
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryObserved = true;
        setHasRecoverySession(true);
        setCheckingLink(false);
        setError("");
        return;
      }

      if (
        !recoveryObserved &&
        (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT")
      ) {
        setHasRecoverySession(false);
        setCheckingLink(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmation) {
      setError("The two passwords don't match yet.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      navigate("/members", { replace: true });
    } catch {
      setError("We couldn't save your new password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>🌊🔑</div>
        <p style={styles.kicker}>OCEAN TIDE DROP AI SURFER</p>
        <h1 style={styles.title}>Set a New Password</h1>
        <p style={styles.copy}>Choose a secure new password for your AI-Surfer account.</p>

        {checkingLink && <div role="status" style={styles.notice}>Checking your secure reset link...</div>}

        {!checkingLink && !hasRecoverySession && (
          <div>
            <div role="alert" style={styles.error}>
              This reset link is invalid or has expired. Please request a fresh link.
            </div>
            <button type="button" onClick={() => navigate("/login")} style={styles.button}>
              Request a New Reset Link 📬
            </button>
          </div>
        )}

        {!checkingLink && hasRecoverySession && (
          <form onSubmit={submit} style={styles.form}>
            <label style={styles.label}>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.input}
                placeholder="At least 8 characters"
              />
            </label>

            <label style={styles.label}>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                style={styles.input}
                placeholder="Enter it again"
              />
            </label>

            {error && <div role="alert" style={styles.error}>{error}</div>}

            <button disabled={loading} style={styles.button}>
              {loading ? "Saving..." : "Save New Password & Continue 🏄‍♀️"}
            </button>
          </form>
        )}

        <button type="button" onClick={() => navigate("/login")} style={styles.back}>
          Back to Sign In
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top, #123c5a, #050914 65%)", color: "#fff", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: 460, padding: 36, borderRadius: 24, background: "rgba(6,12,24,.94)", border: "1px solid rgba(0,242,254,.45)", boxShadow: "0 20px 80px rgba(0,0,0,.4)" },
  logo: { fontSize: 48, textAlign: "center" },
  kicker: { textAlign: "center", color: "#00f2fe", fontSize: 12, fontWeight: 800, letterSpacing: 2 },
  title: { textAlign: "center", fontSize: 30, margin: "12px 0" },
  copy: { textAlign: "center", color: "#cbd5e1", lineHeight: 1.6 },
  notice: { marginTop: 22, padding: 12, borderRadius: 10, background: "rgba(125,211,252,.1)", border: "1px solid rgba(125,211,252,.3)", color: "#bae6fd", textAlign: "center" },
  form: { display: "grid", gap: 18, marginTop: 22 },
  label: { display: "grid", gap: 7, fontWeight: 700 },
  input: { width: "100%", boxSizing: "border-box", padding: 13, borderRadius: 10, border: "1px solid #31506a", background: "#0b1524", color: "white" },
  error: { marginTop: 18, padding: 12, borderRadius: 10, background: "rgba(248,113,113,.12)", color: "#fca5a5", fontSize: 14 },
  button: { width: "100%", marginTop: 8, padding: 14, border: 0, borderRadius: 999, fontWeight: 800, cursor: "pointer", background: "linear-gradient(90deg,#00f2fe,#4facfe)", color: "#001018" },
  back: { display: "block", margin: "22px auto 0", border: 0, background: "transparent", color: "#94a3b8", cursor: "pointer" },
};
