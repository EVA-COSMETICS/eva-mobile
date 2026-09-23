import { colors, fonts, space } from "@/theme";
import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
    label: string;
    icon?: LucideIcon;
    error?: string;
    hint?: string;
    optionalLabel?: string;
    password?: boolean;
};

// Etiketli, ikonlu, hata mesajlı giriş alanı. password: göster / gizle düğmesi ekler.
const TextField = forwardRef<TextInput, Props>(function TextField(
    { label, icon: Icon, error, hint, optionalLabel, password, style, onFocus, onBlur, ...props },
    ref
) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.wrap}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label.toLocaleUpperCase("tr")}</Text>
                {optionalLabel && <Text style={styles.optional}>{optionalLabel}</Text>}
            </View>
            <View style={[styles.box, focused && styles.boxFocused, !!error && styles.boxError]}>
                {Icon && <Icon color={colors.faint} size={17} strokeWidth={1.5} />}
                <TextInput
                    ref={ref}
                    placeholderTextColor={colors.faint}
                    secureTextEntry={password && !visible}
                    autoCorrect={false}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    style={[styles.input, style]}
                    {...props}
                />
                {password && (
                    <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10} accessibilityLabel={visible ? "Şifreyi gizle" : "Şifreyi göster"}>
                        {visible ? (
                            <EyeOff color={colors.faint} size={18} strokeWidth={1.5} />
                        ) : (
                            <Eye color={colors.faint} size={18} strokeWidth={1.5} />
                        )}
                    </Pressable>
                )}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
});

export default TextField;

const styles = StyleSheet.create({
    wrap: { marginBottom: space.md + 4 },
    labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: space.sm },
    label: { fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 2, color: colors.muted },
    optional: { fontFamily: fonts.sans, fontSize: 11, color: colors.faint },
    box: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "rgba(28,25,23,0.15)",
        backgroundColor: colors.white,
        paddingHorizontal: 14,
        height: 52,
    },
    boxFocused: { borderColor: colors.ink },
    boxError: { borderColor: "#f87171" },
    input: { flex: 1, height: "100%", fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
    error: { marginTop: 6, fontFamily: fonts.sans, fontSize: 12, color: "#dc2626" },
    hint: { marginTop: 6, fontFamily: fonts.sans, fontSize: 12, color: colors.faint },
});