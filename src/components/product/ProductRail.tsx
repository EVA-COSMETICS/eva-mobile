import { ScrollView, StyleSheet, View } from "react-native";
import type { ProductSummary } from "@/lib/products";
import { space } from "@/theme";
import ProductCard from "./ProductCard";

// Yatay kaydırılan ürün şeridi (ana sayfa çok satanlar, benzer ürünler)
export default function ProductRail({ products }: { products: ProductSummary[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      decelerationRate="fast"
      snapToInterval={CARD + GAP}
    >
      {products.map((p) => (
        <View key={p.id} style={{ width: CARD }}>
          <ProductCard product={p} />
        </View>
      ))}
    </ScrollView>
  );
}

const CARD = 168;
const GAP = space.md - 4;

const styles = StyleSheet.create({ content: { paddingHorizontal: space.lg, gap: GAP } });
