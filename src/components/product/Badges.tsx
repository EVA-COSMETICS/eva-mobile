import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";

type Props = { isBestseller: boolean; isNew: boolean; discountPercent: number; large?: boolean };

// Görselin sol üstündeki rozetler: ÇOK SATAN, YENİ, -%20
export default function Badges({ isBestseller, isNew, discountPercent, large }: Props) {
  const text = [styles.text, large && styles.textLarge];
  return (
    <View style={[styles.wrap, large && styles.wrapLarge]} pointerEvents="none">
      {isBestseller && (
        <View style={[styles.badge, { backgroundColor: colors.ink }]}>
          <Text style={[text, { color: colors.cream }]}>ÇOK SATAN</Text>
        </View>
      )}
      {isNew && !isBestseller && (
        <View style={[styles.badge, { backgroundColor: colors.cream }]}>
          <Text style={[text, { color: colors.ink }]}>YENİ</Text>
        </View>
      )}
      {discountPercent > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.gold }]}>
          <Text style={[text, { color: colors.white }]}>-%{discountPercent}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 8, top: 8, gap: 4, alignItems: "flex-start" },
  wrapLarge: { left: 16, top: 16, gap: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 4 },
  text: { fontFamily: fonts.sansMedium, fontSize: 8.5, letterSpacing: 1.4 },
  textLarge: { fontSize: 10, letterSpacing: 1.8 },
});
