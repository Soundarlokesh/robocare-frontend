import { ProductBrandsView } from "./product-brands-view";

// Opt out of the dev-only instant-navigation check. This page sits behind the admin sign-in gate and the backend
// authorizes every request, so the check adds nothing here and only flags the client-side gate.
export const instant = false;

export default function ProductBrandsPage() {
  return <ProductBrandsView />;
}
