export interface Jacket {
  id: number;
  name: string;
  fill1: string;
  fill2: string;
  fill3: string;
  price: string;
  bg: string;
  tag: string;
  swatch: string;
  desc: string;
  review: string;
  productType: "hoodie" | "tee" | "compression" | "set";
  image: string;
  colorName: string;
}
