import { timeLeft, type Campaign } from "@/lib/campaigns";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowUpRight, Clock } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

// Ana sayfada yana kaydırılan kampanya kartları (4:3 görsel)
export default function CampaignCarousel({ campaigns }: { campaigns: Campaign[] }) {
    const { width } = useWindowDimensions();
    const single = campaigns.length === 1;
    const cardWidth = single ? width - space.lg * 2 : Math.round(width * 0.82);
    const gap = space.md;
    const [index, setIndex] = useState(0);

    return (
        <View>
            <FlatList
                data={campaigns}
                keyExtractor={(c) => String(c.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + gap}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: space.lg, gap }}
                onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + gap)))}
                renderItem={({ item }) => <CampaignCard campaign={item} width={cardWidth} />}
            />
            {/* Sayfa noktaları */}
            {!single && (
                <View style={styles.dots}>
                    {campaigns.map((c, i) => (
                        <View key={c.id} style={[styles.dot, i === index && styles.dotActive]} />
                    ))}
                </View>
            )}
        </View>
    );
}

function CampaignCard({ campaign: c, width }: { campaign: Campaign; width: number }) {
    const image = c.images.card ?? c.images.banner ?? c.images.mobile;
    const left = timeLeft(c.endsAt);
    const open = () => router.push({ pathname: "/kampanya/[slug]", params: { slug: c.slug } });

    return (
        <Pressable onPress={open} style={({ pressed }) => [{ width }, pressed && { opacity: 0.85 }]}>
            <View style={[styles.image, { backgroundColor: c.tone }]}>
                {image && <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />}
                {c.badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{c.badge.tr.toLocaleUpperCase("tr")}</Text>
                    </View>
                )}
                {left && (
                    <View style={styles.timer}>
                        <Clock size={12} color={colors.gold} strokeWidth={1.8} />
                        <Text style={styles.timerText}>{left}</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={2}>
                        {c.title.tr}
                    </Text>
                    {!!c.subtitle.tr && (
                        <Text style={styles.subtitle} numberOfLines={2}>
                            {c.subtitle.tr}
                        </Text>
                    )}
                </View>
                <View style={styles.arrow}>
                    <ArrowUpRight size={16} color={colors.ink} strokeWidth={1.4} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    image: { aspectRatio: 4 / 3, overflow: "hidden" },
    badge: { position: "absolute", left: 12, top: 12, backgroundColor: colors.ink, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: colors.cream },
    timer: {
        position: "absolute",
        left: 12,
        bottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(250,247,242,0.92)",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    timerText: { fontFamily: fonts.sans, fontSize: 11, color: colors.ink },
    info: { flexDirection: "row", alignItems: "flex-start", gap: space.md, paddingTop: space.md },
    title: { fontFamily: fonts.serifLight, fontSize: 26, lineHeight: 30, color: colors.ink },
    subtitle: { marginTop: 4, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.muted },
    arrow: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(28,25,23,0.2)", alignItems: "center", justifyContent: "center" },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: space.lg },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(28,25,23,0.15)" },
    dotActive: { width: 20, backgroundColor: colors.ink },
});