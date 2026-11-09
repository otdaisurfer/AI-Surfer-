export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "65vh",
        display: "grid",
        placeItems: "center",
        padding: "64px 24px",
        textAlign: "center",
        color: "#f5fbff",
        background: "radial-gradient(circle at 50% 15%, #123f62, #040814 62%)",
      }}
    >
      <div>
        <p style={{ color: "#18eef1", fontWeight: 900, letterSpacing: ".16em" }}>
          404
        </p>
        <h1 style={{ margin: "8px 0 18px", fontSize: "clamp(2.4rem, 7vw, 5rem)" }}>
          That wave drifted out to sea.
        </h1>
        <p style={{ margin: "0 auto 28px", maxWidth: 560, color: "#a7b9cb" }}>
          The page you requested does not exist. Head back to shore and catch the next wave.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            padding: "13px 23px",
            borderRadius: 999,
            color: "#00131b",
            background: "linear-gradient(100deg,#18eef1,#3187ff 52%,#ff3cb9)",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Return home
        </a>
      </div>
    </main>
  );
}
