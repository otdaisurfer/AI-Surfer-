import "./WaveHandlerVisual.css";

export default function WaveHandlerVisual() {
  return (
    <figure className="wave-handler-visual">
      <picture>
        <source media="(max-width: 600px)" srcSet="/images/wave-handler/business-flow-mobile.webp" />
        <img src="/images/wave-handler/business-flow.webp" width={1536} height={1024}
          alt="Wave Handler and AI Fin working together on a surfboard laptop to find leads, automate follow-ups, and turn opportunities into sales."
          loading="lazy" decoding="async" />
      </picture>
      <figcaption><strong>Meet your Wave Handler &amp; AI Fin</strong><span>Find opportunities. Connect your workflows. Keep business flowing.</span></figcaption>
    </figure>
  );
}
