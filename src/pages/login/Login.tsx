import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(
    "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * If MembersLayout sent the user here, preserve that
   * destination. Otherwise send authenticated users to Members.
   */
  const locationState = location.state as
    | { from?: { pathname?: string } }
    | undefined;

  const redirectPath =
    locationState?.from?.pathname || "/members";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);

        navigate(redirectPath, {
          replace: true,
        });

        return;
      }

      const data = await signupWithEmail(
        email,
        password,
        name
      );

      /*
       * If Supabase email confirmation is enabled,
       * session will be null until the user confirms
       * their email.
       */
      if (!data.session) {
        setMessage(
          "Account created! Check your email to confirm your account, then come back and sign in. 🌊"
        );

        setMode("login");
        return;
      }

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error: unknown) {
      console.error(
        "Authentication failed:",
        error
      );

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        setError(
          String(
            (error as { message: string }).message
          )
        );
      } else {
        setError(
          "We couldn't complete authentication. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (error: unknown) {
      console.error(
        "Google authentication failed:",
        error
      );

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        setError(
          String(
            (error as { message: string }).message
          )
        );
      } else {
        setError(
          "Google sign-in failed. Please try again."
        );
      }

      setGoogleLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        items-center
        justify-center
        px-4
        py-12
      "
    >
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%)]
          pointer-events-none
        "
      />

      <div
        className="
          relative
          w-full
          max-w-md
          rounded-3xl
          border
          border-cyan-300/20
          bg-white/10
          backdrop-blur-xl
          p-8
          shadow-2xl
        "
      >
        <div className="text-center mb-8">
          <Link
            to="/"
            className="
              inline-block
              text-xs
              uppercase
              tracking-[0.3em]
              text-cyan-300
              hover:text-cyan-200
              transition
            "
          >
            Ocean Tide Drop
          </Link>

          <h1
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
            "
          >
            AI SURFER 🌊
          </h1>

          <p className="mt-3 text-white/60">
            {mode === "login"
              ? "Welcome back. Your command deck is waiting."
              : "Create your AI SURFER account and catch the wave."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="
              mb-5
              rounded-xl
              border
              border-red-400/30
              bg-red-400/10
              px-4
              py-3
              text-sm
              text-red-200
            "
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="
              mb-5
              rounded-xl
              border
              border-cyan-300/30
              bg-cyan-300/10
              px-4
              py-3
              text-sm
              text-cyan-100
            "
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="
            w-full
            rounded-xl
            border
            border-white/20
            bg-white
            px-4
            py-3
            font-bold
            text-slate-900
            transition
            hover:bg-cyan-50
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs uppercase tracking-widest text-white/40">
            or
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-white/80
                "
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-slate-900/80
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-300
                  focus:ring-2
                  focus:ring-cyan-300/20
                "
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="surfer@example.com"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-slate-900/80
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-cyan-300
                focus:ring-2
                focus:ring-cyan-300/20
              "
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-slate-900/80
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-cyan-300
                focus:ring-2
                focus:ring-cyan-300/20
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="
              w-full
              rounded-xl
              bg-gradient-to-r
              from-cyan-300
              to-blue-400
              px-4
              py-3
              font-black
              text-slate-950
              shadow-[0_0_25px_rgba(34,211,238,0.25)]
              transition
              hover:scale-[1.02]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Catching the wave..."
              : mode === "login"
              ? "Sign In 🌊"
              : "Create My Account 🏄"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          {mode === "login" ? (
            <>
              New to AI SURFER?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className="
                  font-bold
                  text-cyan-300
                  hover:text-cyan-200
                "
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className="
                  font-bold
                  text-cyan-300
                  hover:text-cyan-200
                "
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/members/pricing""
            className="
              text-sm
              text-white/40
              hover:text-white/80
              transition
            "
          >
            ← Back to AI SURFER
          </Link>
        </div>
      </div>
    </main>
  );
}