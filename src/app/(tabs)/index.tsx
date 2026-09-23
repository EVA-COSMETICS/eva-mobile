import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import Screen from "@/components/Screen";
import Button from "@/components/Button";
import ProductRail from "@/components/product/ProductRail";
import { useProducts } from "@/lib/products";
import { colors, fonts, space } from "@/theme";

// Ana sayfa — çok satanlar siteden (API) canlı gelir
export default function HomeScreen() {
  // Çok satanlar (otomatik ilk 10 + admin seçimi); henüz yoksa öne çıkan ürünler
  const best = useProducts({ bestsellers: true, sort: "bestsellers", limit: 12 });
  const featured = useProducts({ sort: "featured", limit: 12 }, best.loaded && best.products.length === 0);
  const bestList = best.products.length ? best.products : featured.products;
  const loading = best.loading || featured.loading;

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
          <Button label="Ürünleri Keşfet" onPress={() => router.push("/kategoriler")} />
        </View>
      </View>

      {/* Çok satanlar */}
      {(loading || bestList.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>EN ÇOK TERCİH EDİLENLER</Text>
          <Text style={styles.sectionTitle}>{best.products.length ? "Çok Satanlar" : "Öne Çıkanlar"}</Text>
          <View style={styles.rail}>
            {loading && !bestList.length ? <ActivityIndicator color={colors.gold} /> : <ProductRail products={bestList} />}
          </View>
        </View>
      )}
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
  section: { marginTop: space.xxl },
  sectionEyebrow: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 3, color: colors.gold },
  sectionTitle: { marginTop: space.sm, fontFamily: fonts.serifLight, fontSize: 34, lineHeight: 38, color: colors.ink },
  rail: { marginTop: space.lg, marginHorizontal: -space.lg, minHeight: 60, justifyContent: "center" },
});
