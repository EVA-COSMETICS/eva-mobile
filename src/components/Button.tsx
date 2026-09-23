import { colors, fonts } from "@/theme";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ label, onPress, variant = "primary", disabled, loading }: Props) {
  const outline = variant === "outline";
  const textColor = outline ? colors.ink : colors.cream;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        outline ? styles.outline : styles.primary,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label.toLocaleUpperCase("tr")}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingVertical: 16, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.ink },
  outline: { borderWidth: 1, borderColor: colors.ink },
  label: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2.4 },
});