import BackHeader from "@/components/BackHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { fetchLegalPage, LEGAL_LINKS, type LegalPage } from "@/lib/content";
import { colors, fonts, space } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { WifiOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Yasal metinler — içerik web sitesinden gelir, böylece tek yerden güncellenir
export default function LegalScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [page, setPage] = useState<LegalPage | null>(null);
    const [error, setError] = useState(false);
    const title = LEGAL_LINKS.find((l) => l.slug === slug)?.title ?? page?.title.tr ?? "";

    const load = () => {
        setError(false);
        fetchLegalPage(slug)
            .then(setPage)
            .catch(() => setError(true));
    };
    useEffect(load, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

    const updated = page
        ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(page.updatedAt))
        : "";

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <BackHeader title={title} />
            {error ? (
                <EmptyState icon={WifiOff} title="Metin yüklenemedi" text="İnternet bağlantınızı kontrol edip tekrar deneyin.">
                    <Button label="Tekrar Dene" variant="outline" onPress={load} />
                </EmptyState>
            ) : !page ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.gold} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{page.title.tr}</Text>
                    <Text style={styles.updated}>SON GÜNCELLEME: {updated.toLocaleUpperCase("tr")}</Text>
                    <Text style={styles.intro}>{page.intro}</Text>

                    {page.blocks.map((b, i) => (
                        <View key={i} style={styles.block}>
                            {b.heading && <Text style={styles.heading}>{b.heading}</Text>}
                            {b.paragraphs?.map((p, j) => (
                                <Text key={j} style={styles.paragraph}>
                                    {p}
                                </Text>
                            ))}
                            {b.list?.map((item, j) => (
                                <View key={j} style={styles.li}>
                                    <View style={styles.dash} />
                                    <Text style={styles.liText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.cream },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: space.lg, paddingBottom: space.xxl * 2 },
    title: { fontFamily: fonts.serifLight, fontSize: 36, lineHeight: 40, color: colors.ink },
    updated: { marginTop: space.sm, fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 2, color: colors.faint },
    intro: { marginTop: space.lg, fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, color: colors.ink },
    block: { marginTop: space.xl },
    heading: { marginBottom: space.sm, fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, color: colors.ink },
    paragraph: { marginBottom: space.sm, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.muted },
    li: { flexDirection: "row", gap: 12, marginBottom: 8 },
    dash: { width: 10, height: 1, marginTop: 11, backgroundColor: colors.gold },
    liText: { flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.muted },
});