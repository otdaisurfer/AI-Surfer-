import { Link } from "react-router-dom";

export default function SiteLogoHeader() {
  return (
    <header
      aria-label="Ocean Tide Drop AI Surfer brand"
      style={styles.header}
    >
      <Link to="/" aria-label="Ocean Tide Drop AI Surfer home" style={styles.link}>
        <img
          src="/images/brand/ai-surfer-wide.webp"
          alt="Ocean Tide Drop AI Surfer"
          data-site-emblem="true"
          style={styles.emblem}
        />
      </Link>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "relative",
    zIndex: 60,
    display: "flex",
    justifyContent: "center",
    width: "100%",
    padding: "10px 16px 8px",
    boxSizing: "border-box",
    background: "#020305",
    borderBottom: "1px solid rgba(103, 232, 249, .22)",
  },
  link: {
    display: "block",
    width: "min(88vw, 360px)",
    lineHeight: 0,
  },
  emblem: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
};
