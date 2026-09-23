import { colors, fonts, space } from "@/theme";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { title?: string; right?: React.ReactNode; center?: React.ReactNode };

// Alt sayfaların üst çubuğu: solda geri, ortada başlık (veya logo)
export default function BackHeader({ title, right, center }: Props) {
    return (
        <View style={styles.bar}>
            <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
                hitSlop={12}
                style={styles.side}
                accessibilityRole="button"
                accessibilityLabel="Geri"
            >
                <ChevronLeft color={colors.ink} size={26} strokeWidth={1.4} />
            </Pressable>
            <View style={styles.center}>
                {center ?? (
                    <Text style={styles.title} numberOfLines={1}>
                        {title?.toLocaleUpperCase("tr")}
                    </Text>
                )}
            </View>
            <View style={[styles.side, styles.right]}>{right}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: space.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.cream,
    },
    side: { width: 44, justifyContent: "center" },
    right: { alignItems: "flex-end" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", height: "100%" },
    title: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2.4, color: colors.ink },
});