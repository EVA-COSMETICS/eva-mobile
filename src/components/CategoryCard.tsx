import type { Category } from "@/lib/content";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

// Büyük görselli kategori kartı (üst seviye kategoriler)
export function CategoryBanner({ category, onPress }: { category: Category; onPress: () => void }) {
    const image = category.banner ?? category.image;
    // Genişliği ekrandan hesapla: iki yanda eşit (24px) boşluk kalır, oran 3:2 korunur
    const { width: screenWidth } = useWindowDimensions();
    const width = screenWidth - space.lg * 2;
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.banner, { width, height: (width * 2) / 3, backgroundColor: category.tone }, pressed && styles.pressed]}
        >
            {image && <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />}
            <LinearGradient colors={["transparent", "rgba(28,25,23,0.55)"]} style={StyleSheet.absoluteFill} />
            <View style={styles.bannerContent}>
                <View style={styles.flex}>
                    <Text style={[styles.bannerTitle, !image && styles.inkText]}>{category.name.tr}</Text>
                    {category.children.length > 0 && (
                        <Text style={[styles.bannerMeta, !image && styles.inkMuted]}>{category.children.length} alt kategori</Text>
                    )}
                </View>
                <View style={[styles.arrow, !image && styles.arrowInk]}>
                    <ArrowUpRight color={image ? colors.cream : colors.ink} size={16} strokeWidth={1.5} />
                </View>
            </View>
        </Pressable>
    );
}

// Küçük görselli satır (alt kategoriler)
export function CategoryRow({ category, onPress }: { category: Category; onPress: () => void }) {
    const image = category.image ?? category.banner;
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={[styles.thumb, { backgroundColor: category.tone }]}>
                {image && <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />}
            </View>
            <Text style={styles.rowTitle}>{category.name.tr}</Text>
            {category.children.length > 0 && <Text style={styles.rowMeta}>{category.children.length}</Text>}
            <ArrowUpRight color={colors.faint} size={16} strokeWidth={1.5} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    banner: { alignSelf: "center", overflow: "hidden", marginBottom: space.md, justifyContent: "flex-end" },
    bannerContent: { flexDirection: "row", alignItems: "flex-end", padding: space.lg },
    bannerTitle: { fontFamily: fonts.serifLight, fontSize: 32, lineHeight: 36, color: colors.cream },
    bannerMeta: { marginTop: 4, fontFamily: fonts.sans, fontSize: 12, letterSpacing: 0.5, color: "rgba(250,247,242,0.8)" },
    inkText: { color: colors.ink },
    inkMuted: { color: colors.muted },
    arrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(250,247,242,0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
    arrowInk: { borderColor: "rgba(28,25,23,0.3)" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    thumb: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
    rowTitle: { flex: 1, fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
    rowMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.faint },
});