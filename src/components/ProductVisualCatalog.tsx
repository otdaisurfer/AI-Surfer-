import ProductVisual from "./ProductVisual";
import { PRODUCT_VISUALS } from "./productVisuals";
import "./ProductVisualCatalog.css";

export default function ProductVisualCatalog() {
  return <div className="product-visual-catalog">
    {PRODUCT_VISUALS.map(product => <a key={product.slug} href={product.href} className="product-visual-card">
      <ProductVisual slug={product.slug} />
      <div className="product-visual-card-copy">
        <h3>{product.name}</h3><p>{product.description}</p><span>Explore product →</span>
      </div>
    </a>)}
  </div>;
}
