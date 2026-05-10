export interface LinProduct {
  id: number;
  name: string;
  bg: string;
  tag: string;
  swatch: string;
  desc: string;
  review: string;
  productType: string;
  image: string;
  colorName: string;
}

export const linProducts: LinProduct[] = [
  {
    id: 3,
    name: "Ensemble Lin Premium",
    bg: "#0a0a0a",
    tag: "Noir",
    swatch: "#1f1d1d",
    desc: "Ensemble en lin noir, élégance moderne et intemporelle. Léger, respirant et d'une classe absolue.",
    review: '"Très élégant en noir, le tissu est top." — Karim R.',
    productType: "set",
    image: "/products/ens1.png",
    colorName: "Noir",
  },
  {
    id: 4,
    name: "Ensemble Lin Premium",
    bg: "#0a0a0a",
    tag: "Noir",
    swatch: "#1f1d1d",
    desc: "Ensemble en lin noir, vue détaillée. Finition premium et coupe parfaite.",
    review: '"La coupe est incroyable, je recommande." — Mehdi S.',
    productType: "set",
    image: "/products/ens2.png",
    colorName: "Noir (Vue 2)",
  },
];
