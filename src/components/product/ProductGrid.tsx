import { StyleSheet, View } from "react-native";
import type { ProductSummary } from "@/lib/products";
import { space } from "@/theme";
import ProductCard from "./ProductCard";

// İki sütunlu ürün ızgarası (ScrollView içinde kullanılır)
export default function ProductGrid({ products }: { products: ProductSummary[] }) {
  const rows: ProductSummary[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
          {row.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: space.xl },
  row: { flexDirection: "row", gap: space.md - 4 },
});
