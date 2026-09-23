import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import type { ProductSummary } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { colors, fonts, space } from "@/theme";
import Badges from "./Badges";

type Props = { product: ProductSummary; style?: ViewStyle };

// Ürün kartı: 4:5 görsel (kesilmeden, beyaz zeminde), rozetler, ad, puan, fiyat
export default function ProductCard({ product: p, style }: Props) {
  const cover = p.images[0];
  return (
    <Pressable
      style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.85 }]}
      onPress={() => router.push({ pathname: "/urun/[slug]", params: { slug: p.slug } })}
      accessibilityRole="button"
      accessibilityLabel={p.name.tr}
    >
      <View style={[styles.imageBox, !cover && { backgroundColor: p.tone }]}>
        {cover && <Image source={{ uri: cover }} style={styles.image} contentFit="contain" transition={300} recyclingKey={cover} />}
        <Badges isBestseller={p.isBestseller} isNew={p.isNew} discountPercent={p.discountPercent} />
        {!p.inStock && (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>TÜKENDİ</Text>
          </View>
        )}
      </View>

      <Text style={styles.category} numberOfLines={1}>
        {p.category.name.tr.toLocaleUpperCase("tr")}
      </Text>
      <Text style={styles.name} numberOfLines={2}>
        {p.name.tr}
      </Text>

      {p.reviewCount > 0 && (
        <View style={styles.rating}>
          <Star size={11} color={colors.gold} fill={colors.gold} />
          <Text style={styles.ratingText}>
            {p.rating.toFixed(1)} <Text style={{ color: colors.faint }}>({p.reviewCount})</Text>
          </Text>
        </View>
      )}

      <View style={styles.priceRow}>
        <Text style={[styles.price, p.salePrice !== null && { color: colors.gold }]}>{formatPrice(p.salePrice ?? p.price)}</Text>
        {p.salePrice !== null && <Text style={styles.oldPrice}>{formatPrice(p.price)}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  imageBox: { aspectRatio: 4 / 5, backgroundColor: colors.white, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  soldOut: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(28,25,23,0.75)", paddingVertical: 6 },
  soldOutText: { textAlign: "center", fontFamily: fonts.sansMedium, fontSize: 9.5, letterSpacing: 2, color: colors.cream },
  category: { marginTop: space.sm + 2, fontFamily: fonts.sansMedium, fontSize: 9, letterSpacing: 1.8, color: colors.gold },
  name: { marginTop: 3, fontFamily: fonts.serif, fontSize: 18, lineHeight: 21, color: colors.ink },
  rating: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  priceRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6, marginTop: 6 },
  price: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  oldPrice: { fontFamily: fonts.sans, fontSize: 12, color: colors.faint, textDecorationLine: "line-through" },
});
