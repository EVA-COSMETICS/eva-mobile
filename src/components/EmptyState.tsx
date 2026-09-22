import { colors, fonts, space } from "@/theme";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type Props = { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode };

export default function EmptyState({ icon: Icon, title, text, children }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon color={colors.gold} size={22} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {text && <Text style={styles.text}>{text}</Text>}
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: space.xxl, paddingHorizontal: space.lg },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, textAlign: "center" },
  text: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.sm,
    maxWidth: 300,
  },
  actions: { marginTop: space.lg, alignSelf: "stretch" },
});