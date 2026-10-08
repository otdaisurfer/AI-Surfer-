import { findProductVisual } from "./productVisuals";

export default function ProductVisual({ slug }: { slug: string }) {
  const product = findProductVisual(slug);
  if (!product) return null;
  return <img
    src={`/images/products/${product.slug}.webp?v=20261008`}
    srcSet={`/images/products/${product.slug}-small.webp?v=20261008 768w, /images/products/${product.slug}.webp?v=20261008 1536w`}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    width={1536} height={1024} loading="lazy" decoding="async"
    alt={`Wave Handler and AI Fin demonstrating ${product.name}: ${product.description}`}
    style={{ display: "block", width: "100%", height: "auto", aspectRatio: "3 / 2", borderRadius: 16 }}
  />;
}
