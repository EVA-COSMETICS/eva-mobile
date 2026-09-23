import { useEffect, useState } from "react";
import { api } from "./api";

/* ------------------------------ Tipler ------------------------------ */

export type Category = {
    id: number;
    slug: string;
    name: { tr: string; en: string };
    tone: string; // görsel yokken kullanılan renk
    image: string | null; // kare
    banner: string | null; // 3:2
    children: Category[];
};

export type LegalBlock = { heading?: string; paragraphs?: string[]; list?: string[] };
export type LegalPage = { slug: string; title: { tr: string; en: string }; updatedAt: string; intro: string; blocks: LegalBlock[] };

// Hesabım ekranındaki yasal metin listesi (içerik web sitesinden gelir)
export const LEGAL_LINKS = [
    { slug: "gizlilik", title: "Gizlilik Politikası" },
    { slug: "kvkk", title: "KVKK Aydınlatma Metni" },
    { slug: "cerez-politikasi", title: "Çerez Politikası" },
    { slug: "mesafeli-satis-sozlesmesi", title: "Mesafeli Satış Sözleşmesi" },
    { slug: "iade-ve-degisim", title: "İade ve Değişim" },
    { slug: "uyelik-sozlesmesi", title: "Üyelik Sözleşmesi" },
] as const;

/* ------------------------------ İstekler ------------------------------ */

export const fetchCategories = () => api<{ categories: Category[] }>("/api/v1/categories").then((r) => r.categories);
export type IntroSlide = { id: number; url: string; eyebrow: string | null; title: string | null; text: string | null };

export const fetchIntroSlides = () =>
    api<{ slides: IntroSlide[] }>("/api/v1/intro", { timeoutMs: 8000 }).then((r) => r.slides);
export const fetchLegalPage = (slug: string) => api<{ page: LegalPage }>(`/api/v1/legal/${slug}`).then((r) => r.page);

/* ------------------------------ Kategoriler ------------------------------ */

// Uygulama açıkken kategoriler bir kez çekilir, ekranlar arasında paylaşılır
let categoryCache: Category[] | null = null;
let categoryRequest: Promise<Category[]> | null = null;

function loadCategories(force = false) {
    if (force) categoryRequest = null;
    categoryRequest ??= fetchCategories().then((list) => (categoryCache = list));
    return categoryRequest;
}

export function useCategories() {
    const [data, setData] = useState<Category[] | null>(categoryCache);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(!categoryCache);

    const load = (force = false) => {
        setLoading(true);
        setError(false);
        loadCategories(force)
            .then(setData)
            .catch(() => {
                categoryRequest = null;
                setError(true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!categoryCache) load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { categories: data ?? [], loading, error, reload: () => load(true) };
}

// Ağacın herhangi bir seviyesindeki kategoriyi id ile bulur
export function findCategory(list: Category[], id: number): Category | undefined {
    for (const c of list) {
        if (c.id === id) return c;
        const found = findCategory(c.children, id);
        if (found) return found;
    }
    return undefined;
}