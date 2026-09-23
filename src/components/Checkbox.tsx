import { colors, fonts } from "@/theme";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode };

export default function Checkbox({ checked, onChange, error, children }: Props) {
    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={() => onChange(!checked)}
                style={styles.row}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                hitSlop={6}
            >
                <View style={[styles.box, checked && styles.boxChecked, !checked && !!error && styles.boxError]}>
                    {checked && <Check color={colors.cream} size={12} strokeWidth={3} />}
                </View>
                <Text style={styles.text}>{children}</Text>
            </Pressable>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: 14 },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    box: {
        width: 18,
        height: 18,
        marginTop: 1,
        borderWidth: 1,
        borderColor: "rgba(28,25,23,0.3)",
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    boxChecked: { backgroundColor: colors.ink, borderColor: colors.ink },
    boxError: { borderColor: "#f87171" },
    text: { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted },
    error: { marginTop: 6, marginLeft: 30, fontFamily: fonts.sans, fontSize: 12, color: "#dc2626" },
});