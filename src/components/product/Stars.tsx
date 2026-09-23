import { StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";
import { colors } from "@/theme";

type Props = { value: number; size?: number };

// Kısmi dolu yıldızlar (ör. 4,3 → dört dolu, biri %30 dolu)
export default function Stars({ value, size = 14 }: Props) {
  return (
    <View style={styles.row} accessibilityLabel={`5 üzerinden ${value.toFixed(1)} puan`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <View key={i} style={{ width: size, height: size }}>
            <Star size={size} color={colors.gold} strokeWidth={1.3} />
            {fill > 0 && (
              <View style={[StyleSheet.absoluteFill, { width: size * fill, overflow: "hidden" }]}>
                <Star size={size} color={colors.gold} fill={colors.gold} strokeWidth={1.3} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", gap: 2 } });
