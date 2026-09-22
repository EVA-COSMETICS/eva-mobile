import { colors, fonts } from "@/theme";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = { label: string; onPress?: () => void; variant?: "primary" | "outline"; disabled?: boolean };

export default function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const outline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        outline ? styles.outline : styles.primary,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[styles.label, { color: outline ? colors.ink : colors.cream }]}>{label.toLocaleUpperCase("tr")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 16, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.ink },
  outline: { borderWidth: 1, borderColor: colors.ink },
  label: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2.4 },
});