import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { ProductSummary } from "./products";

type L = { tr: string; en: string };

// Web API'deki kampanya ile aynı
export type Campaign = {
    id: number;
    slug: string;
    title: L;
    subtitle: L;
    description: L;
    badge: L | null;
    cta: L | null;
    tone: string;
    images: { banner: string | null; mobile: string | null; card: string | null };
    startsAt: string | null;
    endsAt: string | null;
    showOnHome: boolean;
    productCount: number;
};

export const fetchCampaigns = (home = false) =>
    api<{ campaigns: Campaign[] }>(`/api/v1/campaigns${home ? "?home=1" : ""}`).then((r) => r.campaigns);

export const fetchCampaign = (slug: string) =>
    api<{ campaign: Campaign; products: ProductSummary[] }>(`/api/v1/campaigns/${encodeURIComponent(slug)}`);

// Ana sayfa için kampanyalar
export function useCampaigns(home = false) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchCampaigns(home)
            .then((list) => active && setCampaigns(list))
            .catch(() => active && setCampaigns([])) // kampanya yüklenemezse bölüm gizlenir
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [home, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return { campaigns, loading, reload };
}

// "Son 3 gün 4 saat" / "Son 5 sa 20 dk"
export function timeLeft(endsAt: string | null, now = Date.now()) {
    if (!endsAt) return null;
    const left = new Date(endsAt).getTime() - now;
    if (left <= 0) return "Kampanya sona erdi";
    const d = Math.floor(left / 86_400_000);
    const h = Math.floor((left % 86_400_000) / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    return d > 0 ? `Son ${d} gün ${h} saat` : `Son ${h} sa ${m} dk`;
}

export const formatCampaignDate = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });