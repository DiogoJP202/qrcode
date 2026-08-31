export interface UserSession {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

export interface OnboardingState {
  step: "store" | "menu" | "category" | "product" | "appearance" | "complete";
  storeId: string | null;
  menuId: string | null;
  categoryId: string | null;
  canPublish: boolean;
}

export interface MeResponse { user: UserSession; onboarding: OnboardingState; }
export interface PagedResult<T> { items: T[]; page: number; pageSize: number; total: number; }

export interface Store {
  id: string;
  publicName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  role: string;
}

export interface Theme {
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  style: "rounded" | "square" | "pill";
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  promotionalPrice: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  products: Product[];
}

export interface MenuDetails {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  currency: string;
  status: "Draft" | "Published" | "Archived";
  publishedAt: string | null;
  theme: Theme;
  categories: Category[];
}

export interface MenuSummary {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  status: string;
  categoryCount: number;
  productCount: number;
  publishedAt: string | null;
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promotionalPrice: number | null;
  isFeatured: boolean;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}

export interface PublicCategory { name: string; description: string | null; products: PublicProduct[]; }

export interface PublicMenu {
  storeName: string;
  menuName: string;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  theme: Theme;
  categories: PublicCategory[];
  updatedAt: string;
}

export interface PublicProductDetail {
  storeName: string;
  menuName: string;
  menuSlug: string;
  logoUrl: string | null;
  theme: Theme;
  categoryName: string;
  product: PublicProduct;
  updatedAt: string;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  code?: string;
  errors?: string[];
  traceId?: string;
}
