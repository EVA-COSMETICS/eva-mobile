import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Minus, PackageX, Plus, RotateCcw, ShieldCheck, Truck, WifiOff } from "lucide-react-native";
import BackHeader from "@/components/BackHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import Badges from "@/components/product/Badges";
import RichText from "@/components/product/RichText";
import ReviewSection from "@/components/product/ReviewSection";
import ProductRail from "@/components/product/ProductRail";
import Stars from "@/components/product/Stars";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fetchProduct, formatPrice, useProducts, type ProductResponse } from "@/lib/products";
import { colors, fonts, space } from "@/theme";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<ProductResponse | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");

  // Giriş yapılınca / yorum gönderilince yeniden yüklenir (yorum yetkisi üyeye göre değişir)
  const load = useCallback(
    (silent = false) => {
      if (!silent) setState("loading");
      fetchProduct(slug, token)
        .then((res) => {
          setData(res);
          setState("ready");
        })
        .catch((err) => setState(err instanceof ApiError && err.status === 404 ? "notFound" : "error"));
    },
    [slug, token]
  );

  useEffect(() => load(data?.product.slug === slug), [load]); // eslint-disable-line react-hooks/exhaustive-deps

  const product = data?.product;
  const related = useProducts({ category: product?.category.id, limit: 7 }, Boolean(product));
  const others = related.products.filter((p) => p.id !== product?.id).slice(0, 6);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={product?.category.name.tr ?? ""} />

      {state === "loading" && !product ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : state === "notFound" ? (
        <EmptyState icon={PackageX} title="Ürün bulunamadı" text="Bu ürün yayından kaldırılmış olabilir.">
          <Button label="Geri Dön" variant="outline" onPress={() => router.back()} />
        </EmptyState>
      ) : state === "error" && !product ? (
        <EmptyState icon={WifiOff} title="Bağlantı kurulamadı" text="İnternet bağlantınızı kontrol edip tekrar deneyin.">
          <Button label="Tekrar Dene" onPress={() => load()} />
        </EmptyState>
      ) : product && data ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Gallery
              images={product.gallery.map((g) => g.detail)}
              tone={product.tone}
              badges={<Badges isBestseller={product.isBestseller} isNew={product.isNew} discountPercent={product.discountPercent} large />}
            />

            <View style={styles.info}>
              <Text style={styles.eyebrow}>{product.category.name.tr.toLocaleUpperCase("tr")}</Text>
              <Text style={styles.name}>{product.name.tr}</Text>

              {product.reviewCount > 0 && (
                <View style={styles.ratingRow}>
                  <Stars value={product.rating} />
                  <Text style={styles.ratingText}>
                    {product.rating.toFixed(1)} · {product.reviewCount} değerlendirme
                  </Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={[styles.price, product.salePrice !== null && { color: colors.gold }]}>
                  {formatPrice(product.salePrice ?? product.price)}
                </Text>
                {product.salePrice !== null && (
                  <>
                    <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
                    <View style={styles.discount}>
                      <Text style={styles.discountText}>-%{product.discountPercent}</Text>
                    </View>
                  </>
                )}
              </View>

              {product.shortDesc.tr ? <Text style={styles.short}>{product.shortDesc.tr}</Text> : null}

              {product.size && (
                <Text style={styles.meta}>
                  <Text style={styles.metaLabel}>HACİM  </Text>
                  {product.size}
                </Text>
              )}

              <BuyBox stock={product.stock} />

              <View style={styles.perks}>
                <Perk icon={Truck} text="750 TL ve üzeri siparişlerde ücretsiz kargo" />
                <Perk icon={RotateCcw} text="14 gün içinde kolay iade (açılmamış ürünlerde)" />
                <Perk icon={ShieldCheck} text="Güvenli ödeme ve orijinal ürün garantisi" />
              </View>
            </View>

            {product.description.tr && (
              <View style={styles.section}>
                <Text style={styles.eyebrow}>ÜRÜN DETAYLARI</Text>
                <Text style={styles.sectionTitle}>Formül & Kullanım</Text>
                <View style={{ marginTop: space.lg }}>
                  <RichText html={product.description.tr} />
                </View>
                {product.sku && <Text style={styles.sku}>Ürün kodu: {product.sku}</Text>}
              </View>
            )}

            <ReviewSection
              slug={product.slug}
              rating={product.rating}
              reviewCount={product.reviewCount}
              reviews={data.reviews}
              distribution={data.distribution}
              viewer={data.viewer}
              token={token}
              onSubmitted={() => load(true)}
            />

            {others.length > 0 && (
              <View style={styles.related}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: space.lg, marginBottom: space.lg }]}>Bunları da sevebilirsiniz</Text>
                <ProductRail products={others} />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}
    </SafeAreaView>
  );
}

/* ------------------------------ Galeri ------------------------------ */

function Gallery({ images, tone, badges }: { images: string[]; tone: string; badges: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const height = (width * 5) / 4; // 4:5 dikey

  if (!images.length) return <View style={{ width, height, backgroundColor: tone }}>{badges}</View>;

  return (
    <View style={{ backgroundColor: colors.white }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri) => uri}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={32}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height }} contentFit="contain" transition={300} />
        )}
      />
      {badges}
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((uri, i) => (
            <View key={uri} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

/* ------------------------------ Adet + sepete ekle ------------------------------ */

function BuyBox({ stock }: { stock: number }) {
  const [qty, setQty] = useState(1);
  const max = Math.min(stock, 10);

  if (stock <= 0) {
    return (
      <View style={styles.buy}>
        <Button label="Tükendi" disabled />
        <Text style={styles.stockNote}>Bu ürün şu anda stokta yok.</Text>
      </View>
    );
  }

  return (
    <View style={styles.buy}>
      <View style={styles.buyRow}>
        <View style={styles.qty}>
          <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} hitSlop={8} style={styles.qtyBtn} accessibilityLabel="Azalt">
            <Minus size={16} color={colors.ink} strokeWidth={1.5} />
          </Pressable>
          <Text style={styles.qtyText}>{qty}</Text>
          <Pressable onPress={() => setQty((q) => Math.min(max, q + 1))} hitSlop={8} style={styles.qtyBtn} accessibilityLabel="Artır">
            <Plus size={16} color={colors.ink} strokeWidth={1.5} />
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
          {/* Sepet ve ödeme modülü eklenince burası sepete ekleyecek */}
          <Button label="Sepete Ekle" onPress={() => Alert.alert("Çok yakında", "Mobil sepet ve ödeme bir sonraki adımda eklenecek.")} />
        </View>
      </View>
      {stock <= 5 && <Text style={styles.stockNote}>Son {stock} ürün!</Text>}
    </View>
  );
}

function Perk({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <View style={styles.perk}>
      <Icon size={17} color={colors.gold} strokeWidth={1.4} />
      <Text style={styles.perkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: space.xxl * 1.5 },
  dots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(28,25,23,0.18)" },
  dotActive: { width: 18, backgroundColor: colors.ink },
  info: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxl },
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3, color: colors.gold },
  name: { marginTop: space.sm, fontFamily: fonts.serifLight, fontSize: 36, lineHeight: 40, color: colors.ink },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.sm + 4 },
  ratingText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.sm + 2, marginTop: space.md + 4 },
  price: { fontFamily: fonts.sansMedium, fontSize: 22, color: colors.ink },
  oldPrice: { fontFamily: fonts.sans, fontSize: 15, color: colors.faint, textDecorationLine: "line-through" },
  discount: { backgroundColor: "rgba(184,151,106,0.12)", paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.gold },
  short: { marginTop: space.md + 4, fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 23, color: colors.muted },
  meta: { marginTop: space.md, fontFamily: fonts.sans, fontSize: 14, color: colors.ink },
  metaLabel: { fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 2, color: colors.muted },
  buy: { marginTop: space.lg },
  buyRow: { flexDirection: "row", gap: space.sm + 2 },
  qty: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(28,25,23,0.2)", height: 52 },
  qtyBtn: { width: 40, height: "100%", alignItems: "center", justifyContent: "center" },
  qtyText: { minWidth: 24, textAlign: "center", fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
  stockNote: { marginTop: space.sm, fontFamily: fonts.sans, fontSize: 12.5, color: colors.gold },
  perks: { marginTop: space.xl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: space.md - 2 },
  perk: { flexDirection: "row", alignItems: "center", gap: space.sm + 4 },
  perkText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.muted },
  section: { paddingHorizontal: space.lg, paddingVertical: space.xxl, borderTopWidth: 1, borderTopColor: colors.border },
  sectionTitle: { marginTop: space.sm, fontFamily: fonts.serifLight, fontSize: 34, lineHeight: 38, color: colors.ink },
  sku: { marginTop: space.lg, fontFamily: fonts.sans, fontSize: 11.5, color: colors.faint },
  related: { marginTop: space.xxl, paddingTop: space.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
