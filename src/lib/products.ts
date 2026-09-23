import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/* ------------------------------ Tipler (web API ile aynı) ------------------------------ */

type L = { tr: string; en: string };

export type ProductSummary = {
  id: number;
  slug: string;
  name: L;
  shortDesc: L;
  price: number; // indirimsiz fiyat
  salePrice: number | null; // indirim varsa indirimli fiyat
  discountPercent: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  size: string | null;
  inStock: boolean;
  isBestseller: boolean;
  isNew: boolean;
  images: string[]; // kart görselleri (ilk ikisi)
  category: { id: number; slug: string; name: L; path: string[] };
  rootCategory: { slug: string; name: L };
  tone: string;
};

export type ProductDetail = ProductSummary & {
  description: { tr: string | null; en: string | null }; // zengin metin (HTML)
  gallery: { thumb: string; detail: string }[];
  breadcrumbs: { slug: string; name: L; path: string[] }[];
  sku: string | null;
  stock: number;
};

export type Review = {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  author: string;
  createdAt: string;
  isMine?: boolean;
};

export type RatingDistribution = { rating: number; count: number }[];

export type Viewer = {
  loggedIn: boolean;
  canReview: boolean; // ürünü satın almış ve teslim almış mı
  myReview: { id: number; rating: number; title: string | null; body: string } | null;
};

export type ProductResponse = { product: ProductDetail; reviews: Review[]; distribution: RatingDistribution; viewer: Viewer };

export type ProductSort = "featured" | "bestsellers" | "newest" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Öne çıkanlar" },
  { value: "bestsellers", label: "Çok satanlar" },
  { value: "newest", label: "En yeniler" },
  { value: "price-asc", label: "Fiyat: artan" },
  { value: "price-desc", label: "Fiyat: azalan" },
  { value: "rating", label: "En yüksek puan" },
];

/* ------------------------------ İstekler ------------------------------ */

type ListParams = { category?: number; q?: string; bestsellers?: boolean; sort?: ProductSort; limit?: number };

export function fetchProducts(params: ListParams = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", String(params.category));
  if (params.q) qs.set("q", params.q);
  if (params.bestsellers) qs.set("bestsellers", "1");
  if (params.sort) qs.set("sort", params.sort);
  if (params.limit) qs.set("limit", String(params.limit));
  return api<{ products: ProductSummary[] }>(`/api/v1/products?${qs}`).then((r) => r.products);
}

export const fetchProduct = (slug: string, token?: string | null) =>
  api<ProductResponse>(`/api/v1/products/${encodeURIComponent(slug)}`, { token });

export const fetchMoreReviews = (slug: string, offset: number) =>
  api<{ reviews: Review[] }>(`/api/v1/products/${encodeURIComponent(slug)}/reviews?offset=${offset}`).then((r) => r.reviews);

export const postReview = (slug: string, token: string, input: { rating: number; title: string; body: string }) =>
  api<{ ok: true }>(`/api/v1/products/${encodeURIComponent(slug)}/reviews`, { method: "POST", token, body: input });

// Sunucudan gelen hata kodlarının Türkçe karşılıkları
export const REVIEW_ERRORS: Record<string, string> = {
  rating: "Lütfen 1 ile 5 arasında bir puan seçin.",
  titleLong: "Başlık en fazla 120 karakter olabilir.",
  bodyShort: "Yorumunuz en az 10 karakter olmalı.",
  bodyLong: "Yorumunuz en fazla 2000 karakter olabilir.",
  notPurchased: "Yalnızca bu ürünü satın alıp teslim alan üyeler yorum yapabilir.",
  unauthorized: "Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.",
  notFound: "Ürün bulunamadı.",
  network: "Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.",
};

/* ------------------------------ Yardımcılar ------------------------------ */

const priceFormatter = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatPrice = (value: number) => `${priceFormatter.format(value)} ₺`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// Liste ekranları için basit veri kancası
export function useProducts(params: ListParams, enabled = true) {
  const key = JSON.stringify(params);
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(enabled);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true; // arama hızlı değişirse eski cevap yenisinin üstüne yazmasın
    setLoading(true);
    setError(false);
    fetchProducts(JSON.parse(key))
      .then((list) => active && setProducts(list))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key, enabled, attempt]);

  const load = useCallback(() => setAttempt((n) => n + 1), []);

  return { products: products ?? [], loaded: products !== null, loading, error, reload: load };
}
