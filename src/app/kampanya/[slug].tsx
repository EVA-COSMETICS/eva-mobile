import BackHeader from "@/components/BackHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import ProductGrid from "@/components/product/ProductGrid";
import { ApiError } from "@/lib/api";
import { fetchCampaign, formatCampaignDate, type Campaign } from "@/lib/campaigns";
import type { ProductSummary } from "@/lib/products";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { BadgePercent, CalendarClock, WifiOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Data = { campaign: Campaign; products: ProductSummary[] };

// Kampanya detayı: dikey görsel, geri sayım, koşullar ve kampanyalı ürünler
export default function CampaignScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [data, setData] = useState<Data | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");

    const load = useCallback(() => {
        setState("loading");
        fetchCampaign(slug)
            .then((d) => {
                setData(d);
                setState("ready");
            })
            .catch((e) => setState(e instanceof ApiError && e.status === 404 ? "notFound" : "error"));
    }, [slug]);

    useEffect(load, [load]);

    const c = data?.campaign;
    const image = c ? (c.images.mobile ?? c.images.card ?? c.images.banner) : null;
    const paragraphs = c ? c.description.tr.split(/\r?\n/).map((p) => p.trim()).filter(Boolean) : [];

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <BackHeader title="Kampanya" />

            {state === "loading" ? (
                <ActivityIndicator color={colors.gold} style={{ marginTop: space.xxl }} />
            ) : state === "notFound" ? (
                <EmptyState icon={BadgePercent} title="Kampanya sona erdi" text="Bu kampanya artık geçerli değil. Diğer fırsatlar için ana sayfaya göz atın." />
            ) : state === "error" || !c ? (
                <EmptyState icon={WifiOff} title="Kampanya yüklenemedi" text="İnternet bağlantınızı kontrol edip tekrar deneyin.">
                    <Button label="Tekrar Dene" onPress={load} />
                </EmptyState>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Görsel ve başlık */}
                    <View style={[styles.hero, { backgroundColor: c.tone }]}>
                        {image && <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />}
                        {image && <LinearGradient colors={["transparent", "rgba(28,25,23,0.8)"]} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />}
                        <View style={styles.heroText}>
                            {c.badge && (
                                <View style={[styles.badge, !image && { backgroundColor: colors.ink }]}>
                                    <Text style={styles.badgeText}>{c.badge.tr.toLocaleUpperCase("tr")}</Text>
                                </View>
                            )}
                            <Text style={[styles.title, !image && { color: colors.ink }]}>{c.title.tr}</Text>
                            {!!c.subtitle.tr && <Text style={[styles.subtitle, !image && { color: colors.muted }]}>{c.subtitle.tr}</Text>}
                        </View>
                    </View>

                    <View style={styles.body}>
                        {c.endsAt && <Countdown endsAt={c.endsAt} />}

                        {paragraphs.length > 0 && (
                            <View style={styles.block}>
                                <Text style={styles.eyebrow}>KAMPANYA DETAYLARI</Text>
                                {paragraphs.map((p, i) => (
                                    <Text key={i} style={styles.paragraph}>
                                        {p}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {(c.startsAt || c.endsAt) && (
                            <View style={styles.dates}>
                                <View style={styles.datesHead}>
                                    <CalendarClock size={15} color={colors.gold} strokeWidth={1.5} />
                                    <Text style={styles.datesTitle}>KAMPANYA TARİHLERİ</Text>
                                </View>
                                {c.startsAt && <DateRow label="Başlangıç" value={formatCampaignDate(c.startsAt)} />}
                                {c.endsAt && <DateRow label="Bitiş" value={formatCampaignDate(c.endsAt)} />}
                            </View>
                        )}

                        {data!.products.length > 0 && (
                            <View style={styles.block}>
                                <Text style={styles.eyebrow}>{data!.products.length} ÜRÜN</Text>
                                <Text style={styles.sectionTitle}>Kampanyalı Ürünler</Text>
                                <View style={{ marginTop: space.lg }}>
                                    <ProductGrid products={data!.products} />
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

function DateRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>{label}</Text>
            <Text style={styles.dateValue}>{value}</Text>
        </View>
    );
}

// Gün / saat / dakika / saniye kutuları
function Countdown({ endsAt }: { endsAt: string }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const left = Math.max(0, new Date(endsAt).getTime() - now);
    if (left === 0) return <Text style={styles.ended}>Kampanya sona erdi</Text>;
    const parts = [
        { v: Math.floor(left / 86_400_000), l: "GÜN" },
        { v: Math.floor((left % 86_400_000) / 3_600_000), l: "SAAT" },
        { v: Math.floor((left % 3_600_000) / 60_000), l: "DAKİKA" },
        { v: Math.floor((left % 60_000) / 1000), l: "SANİYE" },
    ];

    return (
        <View>
            <Text style={styles.eyebrow}>KAMPANYANIN BİTMESİNE</Text>
            <View style={styles.boxes}>
                {parts.map((p) => (
                    <View key={p.l} style={styles.box}>
                        <Text style={styles.boxValue}>{String(p.v).padStart(2, "0")}</Text>
                        <Text style={styles.boxLabel}>{p.l}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.cream },
    content: { paddingBottom: space.xxl },
    hero: { aspectRatio: 4 / 5, justifyContent: "flex-end", overflow: "hidden" },
    heroText: { padding: space.lg },
    badge: { alignSelf: "flex-start", backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: colors.white },
    title: { marginTop: space.md, fontFamily: fonts.serifLight, fontSize: 42, lineHeight: 44, color: colors.cream },
    subtitle: { marginTop: space.sm, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: "rgba(250,247,242,0.85)" },
    body: { paddingHorizontal: space.lg, paddingTop: space.xl, gap: space.xl },
    eyebrow: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 3, color: colors.gold },
    boxes: { flexDirection: "row", gap: space.sm, marginTop: space.md },
    box: { flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingVertical: 12, alignItems: "center" },
    boxValue: { fontFamily: fonts.serifLight, fontSize: 30, lineHeight: 32, color: colors.ink },
    boxLabel: { marginTop: 4, fontFamily: fonts.sansMedium, fontSize: 8.5, letterSpacing: 1.5, color: colors.faint },
    ended: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.muted },
    block: { gap: space.sm },
    paragraph: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.muted },
    dates: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: space.md, gap: 10 },
    datesHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    datesTitle: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 2, color: colors.muted },
    dateRow: { flexDirection: "row", justifyContent: "space-between", gap: space.md },
    dateLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
    dateValue: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink, textAlign: "right", flexShrink: 1 },
    sectionTitle: { fontFamily: fonts.serifLight, fontSize: 32, lineHeight: 36, color: colors.ink },
});