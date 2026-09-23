import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Search, SearchX, X } from "lucide-react-native";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import ProductGrid from "@/components/product/ProductGrid";
import { useProducts } from "@/lib/products";
import { colors, fonts, space } from "@/theme";

// Ürün arama: yazmayı bırakınca (0,35 sn) siteden arar
export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const searching = term.length >= 2;
  const { products, loaded, loading, error } = useProducts({ q: term, limit: 40 }, searching);

  return (
    <Screen>
      <ScreenHeader eyebrow="Ara" title="Ne arıyorsunuz?" />
      <View style={styles.inputWrap}>
        <Search color={colors.faint} size={18} strokeWidth={1.5} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ürün adı veya ürün kodu…"
          placeholderTextColor={colors.faint}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          onSubmitEditing={() => setTerm(query.trim())}
        />
        {loading && searching ? (
          <ActivityIndicator size="small" color={colors.gold} />
        ) : query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Temizle">
            <X color={colors.faint} size={18} strokeWidth={1.5} />
          </Pressable>
        ) : null}
      </View>

      {!searching ? (
        <EmptyState icon={Search} title="Aramaya başlayın" text="Aradığınız ürünün adını en az 2 harf olacak şekilde yazın." />
      ) : error && !loaded ? (
        <EmptyState icon={SearchX} title="Arama yapılamadı" text="İnternet bağlantınızı kontrol edip tekrar deneyin." />
      ) : loaded && !loading && products.length === 0 ? (
        <EmptyState icon={SearchX} title="Sonuç bulunamadı" text={`"${term}" için ürün bulamadık. Farklı bir kelime deneyin.`} />
      ) : loaded ? (
        <View style={styles.results}>
          <Text style={styles.count}>{products.length} sonuç</Text>
          <ProductGrid products={products} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingVertical: space.sm,
  },
  input: { flex: 1, fontFamily: fonts.sans, fontSize: 16, color: colors.ink, paddingVertical: space.xs },
  results: { marginTop: space.lg },
  count: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginBottom: space.md },
});
