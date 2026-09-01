import { PublicMenu, PublicProduct } from "../../core/models";

// Fotos hospedadas no CDN do Unsplash, cuja licença permite uso comercial sem
// atribuição. As diretrizes do Unsplash pedem justamente o hotlink ao CDN em vez
// de rehospedar os arquivos. O CSP de produção já libera `img-src https:`.
const photo = (id: string, width: number, height: number) =>
  `https://images.unsplash.com/${id}?w=${width}&h=${height}&q=80&fm=jpg&fit=crop`;

export interface ExampleProduct extends PublicProduct {
  slug: string;
  categoryName: string;
}

const products: ExampleProduct[] = [
  { slug: "torrada-rustica", categoryName: "Entradas", id: "torrada-rustica", name: "Torrada rústica com ovo caipira", description: "Pão de fermentação natural, abacate amassado, ovo caipira e folhas frescas.", price: 32.0, promotionalPrice: null, isFeatured: false, imageUrl: photo("photo-1482049016688-2d3e1b311543", 1200, 900), thumbnailUrl: null },
  { slug: "salada-da-horta", categoryName: "Entradas", id: "salada-da-horta", name: "Salada da horta", description: "Grão-de-bico, abacate, tomatinhos, rabanete e legumes assados.", price: 38.0, promotionalPrice: 33.0, isFeatured: false, imageUrl: photo("photo-1512621776951-a57141f2eefd", 1200, 900), thumbnailUrl: null },
  { slug: "farfalle-ao-pesto", categoryName: "Pratos principais", id: "farfalle-ao-pesto", name: "Farfalle ao pesto", description: "Massa fresca com pesto de manjericão, tomate confitado e parmesão.", price: 54.0, promotionalPrice: null, isFeatured: true, imageUrl: photo("photo-1473093295043-cdd812d0e601", 1200, 900), thumbnailUrl: null },
  { slug: "risoto-de-cogumelos", categoryName: "Pratos principais", id: "risoto-de-cogumelos", name: "Risoto de cogumelos", description: "Arroz arbóreo cremoso, mix de cogumelos frescos e finalização com trufa.", price: 62.0, promotionalPrice: null, isFeatured: false, imageUrl: photo("photo-1476124369491-e7addf5db371", 1200, 900), thumbnailUrl: null },
  { slug: "pizza-da-casa", categoryName: "Pratos principais", id: "pizza-da-casa", name: "Pizza da casa", description: "Massa de longa fermentação assada em forno a lenha, com muçarela de búfala.", price: 58.0, promotionalPrice: null, isFeatured: false, imageUrl: photo("photo-1565299624946-b28f40a0ae38", 1200, 900), thumbnailUrl: null },
  { slug: "file-ao-molho-de-vinho", categoryName: "Pratos principais", id: "file-ao-molho-de-vinho", name: "Filé ao molho de vinho", description: "Medalhão grelhado, redução de vinho tinto e batatas rústicas com alecrim.", price: 78.0, promotionalPrice: 69.0, isFeatured: true, imageUrl: photo("photo-1504674900247-0877df9cc836", 1200, 900), thumbnailUrl: null },
  { slug: "rabanada-da-casa", categoryName: "Sobremesas", id: "rabanada-da-casa", name: "Rabanada com frutas vermelhas", description: "Pão brioche caramelizado, frutas vermelhas e calda de baunilha.", price: 29.0, promotionalPrice: null, isFeatured: false, imageUrl: photo("photo-1484723091739-30a097e8f929", 1200, 900), thumbnailUrl: null },
  { slug: "panqueca-de-banana", categoryName: "Sobremesas", id: "panqueca-de-banana", name: "Panqueca com banana e mel", description: "Pilha de panquecas fofinhas, banana caramelizada e mel de laranjeira.", price: 27.0, promotionalPrice: null, isFeatured: false, imageUrl: photo("photo-1567620905732-2d1ec7ab7445", 1200, 900), thumbnailUrl: null },
];

export const exampleProducts = products;
export const findExampleProduct = (slug: string): ExampleProduct | undefined => products.find((product) => product.slug === slug);

const categoryOrder = ["Entradas", "Pratos principais", "Sobremesas"];
const descriptions: Record<string, string | null> = {
  "Entradas": "Para começar bem, feitas na hora.",
  "Pratos principais": "Massas e assados preparados diariamente na cozinha.",
  "Sobremesas": null,
};

export const exampleMenu: PublicMenu = {
  storeName: "Cantina Bela Vista",
  menuName: "Cardápio da casa",
  description: "Massas frescas, forno a lenha e receitas de família desde 1998.",
  slug: "exemplo",
  logoUrl: photo("photo-1414235077428-338989a2e8c0", 400, 400),
  // Fixo para o build pré-renderizado ser determinístico.
  updatedAt: "2026-01-01T12:00:00.000Z",
  theme: {
    preset: "custom",
    primaryColor: "#B4532A",
    secondaryColor: "#2A211C",
    backgroundColor: "#FBF7F1",
    style: "rounded",
    fontFamily: "serif",
    cardLayout: "grid",
    imageStyle: "cover",
  },
  categories: categoryOrder.map((name) => ({
    name,
    description: descriptions[name],
    products: products.filter((product) => product.categoryName === name),
  })),
};
