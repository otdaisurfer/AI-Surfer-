import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase, supabaseAnonKey, supabaseUrl } from "../../lib/supabase";
import { buildStoredAuditCheckoutContext } from "../audit/auditCheckoutContext";
import { buildAuthRedirectUrl, safeAuthReturnPath } from "./authReturn";

const AUTH_RETURN_PATH_KEY = "ai-surfer:auth-return-path";
const AEO_CHECKOUT_CONTEXT_KEY = "ai-surfer:aeo-checkout-context";
const LIVE_SITE_ORIGIN = "https://otdaisurfer.surf";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  const stateFrom = (location.state as { from?: unknown } | null)?.from;
  const queryReturn = new URLSearchParams(location.search).get("returnTo");
  const [destination] = useState(() => safeAuthReturnPath(
    stateFrom ?? queryReturn ?? window.sessionStorage.getItem(AUTH_RETURN_PATH_KEY),
    window.location.origin,
  ));

  const restoreAuditCheckoutContext = (sessionEmail?: string | null) => {
    const context = buildStoredAuditCheckoutContext(destination, sessionEmail);
    if (context) window.sessionStorage.setItem(AEO_CHECKOUT_CONTEXT_KEY, context);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        restoreAuditCheckoutContext(data.session.user.email);
        window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
        navigate(destination, { replace: true });
      }
    });
  }, [destination, navigate]);

  useEffect(() => {
    let active = true;
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Auth settings unavailable")))
      .then((settings: { external?: { google?: boolean } }) => {
        if (active) setGoogleAvailable(settings.external?.google === true);
      })
      .catch(() => {
        if (active) setGoogleAvailable(false);
      });
    return () => { active = false; };
  }, []);

  const clearMessages = () => { setMessage(""); setError(""); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const cleanEmail = email.trim();
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: buildAuthRedirectUrl(window.location.origin, destination) },
        });
        if (signUpError) {
          if (/networkerror|failed to fetch|fetch resource/i.test(signUpError.message)) {
            setMessage("Your account request may have reached us—check your email for the confirmation link. If it arrived, confirm your account, then sign in. 🌊");
            setMode("signin");
            return;
          }
          setError(signUpError.message);
          return;
        }
        if (data.session) {
          restoreAuditCheckoutContext(data.session.user.email ?? cleanEmail);
          window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
          navigate(destination, { replace: true });
        } else {
          setMessage("Account created! Check your email to confirm your account, then sign in. 🌊");
          setMode("signin");
        }
        return;
      }

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${LIVE_SITE_ORIGIN}/reset-password` });
        if (resetError) { setError(resetError.message); return; }
        setMessage("Password reset link sent! Check your email. 📬");
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (signInError) { setError(signInError.message); return; }
      restoreAuditCheckoutContext(signInData.session?.user.email ?? cleanEmail);
      window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
      navigate(destination, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    clearMessages();
    window.sessionStorage.setItem(AUTH_RETURN_PATH_KEY, destination);
    const { error: googleError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${LIVE_SITE_ORIGIN}/login` } });
    if (googleError) {
      window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
      setError(googleError.message);
      setLoading(false);
    }
  };

  const title = mode === "signin" ? "Welcome back, Surfer." : mode === "signup" ? "Create your Surfer account." : "Reset your password.";
  const copy = mode === "signin"
    ? "Choose Google or email below. After sign-in, we will return you to the page you were trying to open."
    : mode === "signup"
      ? destination.startsWith('/members/purchases')
        ? "Create your account with your Shopify checkout email, confirm it, then activate eligible purchase access. No new subscription is required."
        : "Create your account, then complete your membership plan to unlock the Members Dashboard."
      : "Enter your email and we’ll send you a secure password reset link.";

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>🌊</div>
        <p style={styles.kicker}>OCEAN TIDE DROP AI SURFER</p>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.copy}>{copy}</p>
        {mode === "signin" && googleAvailable && <button type="button" onClick={signInWithGoogle} disabled={loading} style={styles.googleButton}>{loading ? "Connecting..." : "🌐 Sign in with Google"}</button>}
        {mode === "signin" && googleAvailable === false && <div role="status" style={styles.authNotice}>Google sign-in is temporarily unavailable. Please use email below.</div>}
        {mode === "signin" && googleAvailable && <div style={styles.divider}><span>or continue with email</span></div>}
        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" /></label>
          {mode !== "forgot" && <label style={styles.label}>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="At least 6 characters" /></label>}
          {error && <div role="alert" style={styles.error}>{error}</div>}
          {message && <div role="status" style={styles.success}>{message}</div>}
          <button disabled={loading} style={styles.button}>{loading ? "Working..." : mode === "signin" ? "Sign In & Enter Members Area 🏄‍♀️" : mode === "signup" ? "Create Account 🚀" : "Send Reset Link 📬"}</button>
        </form>
        <div style={styles.actions}>
          {mode === "signin" && <><button type="button" onClick={() => { clearMessages(); setMode("signup"); }} style={styles.link}>Create Account</button><button type="button" onClick={() => { clearMessages(); setMode("forgot"); }} style={styles.link}>Forgot Password?</button></>}
          {mode !== "signin" && <button type="button" onClick={() => { clearMessages(); setMode("signin"); }} style={styles.link}>← Back to Sign In</button>}
        </div>
        <button onClick={() => navigate("/")} style={styles.back}>Back to AI-Surfer</button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top, #123c5a, #050914 65%)", color: "#fff", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: 460, padding: 36, borderRadius: 24, background: "rgba(6,12,24,.94)", border: "1px solid rgba(0,242,254,.45)", boxShadow: "0 20px 80px rgba(0,0,0,.4)" },
  logo: { fontSize: 48, textAlign: "center" }, kicker: { textAlign: "center", color: "#00f2fe", fontSize: 12, fontWeight: 800, letterSpacing: 2 }, title: { textAlign: "center", fontSize: 30, margin: "12px 0" }, copy: { textAlign: "center", color: "#cbd5e1", lineHeight: 1.6 },
  googleButton: { width: "100%", padding: 13, borderRadius: 999, border: "1px solid #64748b", background: "#fff", color: "#111827", fontWeight: 800, cursor: "pointer", marginTop: 18 }, authNotice: { marginTop: 18, padding: 12, borderRadius: 10, background: "rgba(125,211,252,.1)", border: "1px solid rgba(125,211,252,.3)", color: "#bae6fd", fontSize: 14, lineHeight: 1.5, textAlign: "center" }, divider: { display: "flex", alignItems: "center", gap: 12, margin: "22px 0 4px", color: "#64748b", fontSize: 12 }, form: { display: "grid", gap: 18, marginTop: 22 }, label: { display: "grid", gap: 7, fontWeight: 700 }, input: { width: "100%", boxSizing: "border-box", padding: 13, borderRadius: 10, border: "1px solid #31506a", background: "#0b1524", color: "white" }, error: { padding: 12, borderRadius: 10, background: "rgba(248,113,113,.12)", color: "#fca5a5", fontSize: 14 }, success: { padding: 12, borderRadius: 10, background: "rgba(74,222,128,.12)", color: "#86efac", fontSize: 14 }, button: { padding: 14, border: 0, borderRadius: 999, fontWeight: 800, cursor: "pointer", background: "linear-gradient(90deg,#00f2fe,#4facfe)", color: "#001018" }, actions: { display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginTop: 20 }, link: { border: 0, background: "transparent", color: "#7dd3fc", cursor: "pointer", fontWeight: 700 }, back: { display: "block", margin: "22px auto 0", border: 0, background: "transparent", color: "#94a3b8", cursor: "pointer" }
};

