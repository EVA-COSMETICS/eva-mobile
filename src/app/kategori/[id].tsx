import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { PackageOpen, WifiOff } from "lucide-react-native";
import BackHeader from "@/components/BackHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import ProductGrid from "@/components/product/ProductGrid";
import { findCategory, useCategories } from "@/lib/content";
import { SORT_OPTIONS, useProducts, type ProductSort } from "@/lib/products";
import { colors, fonts, space } from "@/theme";

// Kategori: banner, alt kategoriler, sıralama ve ürünler (alt kategorilerin ürünleri dahil)
export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories } = useCategories();
  const category = findCategory(categories, Number(id));
  const banner = category?.banner ?? category?.image;
  const [sort, setSort] = useState<ProductSort>("featured");
  const { products, loaded, loading, error, reload } = useProducts({ category: Number(id), sort, limit: 60 });

  const openCategory = (cid: number) => router.push({ pathname: "/kategori/[id]", params: { id: String(cid) } });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={category?.name.tr ?? ""} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {category && (
          <View style={[styles.banner, { backgroundColor: category.tone }]}>
            {banner && <Image source={{ uri: banner }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />}
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.eyebrow}>KATEGORİ</Text>
          <Text style={styles.title}>{category?.name.tr ?? ""}</Text>
        </View>

        {/* Alt kategoriler */}
        {category && category.children.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {category.children.map((c) => (
              <Pressable key={c.id} onPress={() => openCategory(c.id)} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                <Text style={styles.chipText}>{c.name.tr}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Sıralama */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sorts}>
          {SORT_OPTIONS.map((o) => {
            const active = o.value === sort;
            return (
              <Pressable key={o.value} onPress={() => setSort(o.value)} style={[styles.sort, active && styles.sortActive]}>
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.products}>
          {loaded && <Text style={styles.count}>{products.length} ürün</Text>}
          {loading && !loaded ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: space.xxl }} />
          ) : error && !loaded ? (
            <EmptyState icon={WifiOff} title="Ürünler yüklenemedi" text="İnternet bağlantınızı kontrol edip tekrar deneyin.">
              <Button label="Tekrar Dene" onPress={reload} />
            </EmptyState>
          ) : products.length ? (
            <View style={loading && { opacity: 0.5 }}>
              <ProductGrid products={products} />
            </View>
          ) : (
            <EmptyState icon={PackageOpen} title="Ürünler çok yakında" text="Bu kategorideki ürünler kısa süre içinde burada olacak." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: space.xxl },
  banner: { aspectRatio: 3 / 2, overflow: "hidden" },
  body: { paddingHorizontal: space.lg, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3, color: colors.gold },
  title: { marginTop: space.sm, fontFamily: fonts.serifLight, fontSize: 40, lineHeight: 44, color: colors.ink },
  chips: { paddingHorizontal: space.lg, gap: space.sm, paddingTop: space.lg },
  chip: { borderWidth: 1, borderColor: "rgba(28,25,23,0.2)", paddingHorizontal: 14, paddingVertical: 9, backgroundColor: colors.white },
  chipPressed: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink },
  sorts: { paddingHorizontal: space.lg, gap: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  sort: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "transparent" },
  sortActive: { borderBottomColor: colors.ink },
  sortText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.faint },
  sortTextActive: { fontFamily: fonts.sansMedium, color: colors.ink },
  products: { paddingHorizontal: space.lg, paddingTop: space.md },
  count: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginBottom: space.md },
});
