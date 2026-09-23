import Button from "@/components/Button";
import CampaignCarousel from "@/components/CampaignCarousel";
import ProductGrid from "@/components/product/ProductGrid";
import ProductRail from "@/components/product/ProductRail";
import Screen from "@/components/Screen";
import { useCampaigns } from "@/lib/campaigns";
import { useProducts } from "@/lib/products";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const PAGE = 10; // "Daha fazla göster" her basışta 10 ürün açar
const ALL = "all";

// Ana sayfa — çok satanlar ve tüm ürünler siteden (API) canlı gelir
export default function HomeScreen() {
  // Çok satanlar (otomatik ilk 10 + admin seçimi); henüz yoksa öne çıkan ürünler
  const best = useProducts({ bestsellers: true, sort: "bestsellers", limit: 12 });
  const featured = useProducts({ sort: "featured", limit: 12 }, best.loaded && best.products.length === 0);
  const bestList = best.products.length ? best.products : featured.products;
  const loading = best.loading || featured.loading;

  // Kampanyalar (admin'de "Ana sayfada göster" işaretli olanlar)
  const { campaigns } = useCampaigns(true);

  // Tüm ürünler
  const all = useProducts({ sort: "featured", limit: 60 });
  const [tab, setTab] = useState(ALL);
  const [visible, setVisible] = useState(PAGE);
  const roots = new Map(all.products.map((p) => [p.rootCategory.slug, p.rootCategory.name.tr]));
  const tabs = [{ slug: ALL, label: "Tümü" }, ...[...roots].map(([slug, label]) => ({ slug, label }))];
  const list = tab === ALL ? all.products : all.products.filter((p) => p.rootCategory.slug === tab);
  const shown = list.slice(0, visible);

  const selectTab = (slug: string) => {
    setTab(slug);
    setVisible(PAGE);
  };

  return (
    <Screen>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <View style={styles.iconSpace} />
        <Image
          source={require("@/assets/images/logo/logo-black.png")}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="EVA Cosmetics"
        />
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

      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>FIRSATLAR</Text>
          <Text style={styles.sectionTitle}>Kampanyalar</Text>
          <View style={styles.campaigns}>
            <CampaignCarousel campaigns={campaigns} />
          </View>
        </View>
      )}

      {/* Tüm ürünler */}
      {(all.loading || all.products.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>KOLEKSİYON</Text>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Tüm Ürünler</Text>
            {all.products.length > 0 && <Text style={styles.count}>({all.products.length})</Text>}
          </View>

          {/* Kategori sekmeleri: en az iki ana kategoride ürün varsa */}
          {tabs.length > 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
              {tabs.map((t) => {
                const active = t.slug === tab;
                return (
                  <Pressable key={t.slug} onPress={() => selectTab(t.slug)} style={[styles.tab, active && styles.tabActive]}>
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label.toLocaleUpperCase("tr")}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.grid}>
            {all.loading && !all.products.length ? <ActivityIndicator color={colors.gold} /> : <ProductGrid products={shown} />}
          </View>

          {shown.length < list.length && (
            <View style={styles.more}>
              <Text style={styles.moreText}>
                {list.length} üründen {shown.length} tanesini gördünüz
              </Text>
              <Button label="Daha Fazla Göster" variant="outline" onPress={() => setVisible((v) => v + PAGE)} />
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: space.xs },
  iconSpace: { width: 32, alignItems: "flex-end" },
  logo: { width: 110, height: 66, marginVertical: -space.xs },
  hero: {
    marginTop: space.sm,
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
  campaigns: { marginTop: space.lg, marginHorizontal: -space.lg },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  count: { marginTop: space.sm + 2, fontFamily: fonts.sans, fontSize: 13, color: colors.gold },
  tabsScroll: { marginTop: space.lg, marginHorizontal: -space.lg },
  tabs: { paddingHorizontal: space.lg, gap: space.sm },
  tab: { borderWidth: 1, borderColor: "rgba(28,25,23,0.15)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.5, color: colors.muted },
  tabTextActive: { color: colors.cream },
  grid: { marginTop: space.lg, minHeight: 60, justifyContent: "center" },
  more: { marginTop: space.xl, gap: space.md },
  moreText: { textAlign: "center", fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
});
