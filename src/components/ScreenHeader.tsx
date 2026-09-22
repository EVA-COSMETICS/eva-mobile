import { colors, fonts, space } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

export default function ScreenHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View style={styles.wrap}>
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow.toLocaleUpperCase("tr")}</Text>}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.lg, paddingBottom: space.lg },
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3, color: colors.gold, marginBottom: space.sm },
  title: { fontFamily: fonts.serifLight, fontSize: 40, lineHeight: 44, color: colors.ink },
});