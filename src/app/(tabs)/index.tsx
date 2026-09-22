import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { colors, fonts, space } from "@/theme";
import { ShoppingBag } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

// Ana sayfa — içerikler bir sonraki adımda siteden (API) gelecek
export default function HomeScreen() {
  return (
    <Screen>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <View style={styles.iconSpace} />
        <Text style={styles.logo}>EVA</Text>
        <View style={styles.iconSpace}>
          <ShoppingBag color={colors.ink} size={22} strokeWidth={1.5} />
        </View>
      </View>

      {/* Hero — şimdilik sabit, sonra admin panelindeki görseller gelecek */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>EVA COSMETICS</Text>
        <Text style={styles.heroTitle}>Cildinizin en iyi hâli</Text>
        <Text style={styles.heroText}>
          Bilimsel formüller ve özenle seçilmiş içeriklerle, her gün kendinizi daha iyi hissettiren bakım.
        </Text>
        <View style={styles.heroButton}>
          <Button label="Ürünleri Keşfet" />
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Yakında burada</Text>
        <Text style={styles.noteText}>
          Kategoriler, öne çıkan ürünler ve kampanyalar bir sonraki adımda siteden canlı olarak gelecek.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: space.md },
  iconSpace: { width: 32, alignItems: "flex-end" },
  logo: { fontFamily: fonts.serif, fontSize: 28, letterSpacing: 10, color: colors.ink, paddingLeft: 10 },
  hero: {
    marginTop: space.md,
    backgroundColor: colors.blush,
    paddingHorizontal: space.lg,
    paddingVertical: space.xxl,
    alignItems: "center",
  },
  heroEyebrow: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 4, color: colors.gold },
  heroTitle: {
    fontFamily: fonts.serifLight,
    fontSize: 44,
    lineHeight: 46,
    color: colors.ink,
    textAlign: "center",
    marginTop: space.md,
  },
  heroText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.md,
  },
  heroButton: { marginTop: space.xl, alignSelf: "stretch" },
  note: { marginTop: space.xl, padding: space.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  noteTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  noteText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: space.xs },
});