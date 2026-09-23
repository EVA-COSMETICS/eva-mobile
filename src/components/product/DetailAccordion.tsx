import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { colors, fonts, space } from "@/theme";
import RichText from "./RichText";

export type DetailItem = { id: string; title: string; html?: string | null; text?: string | null };

// Android'de açılma / kapanma animasyonu için
if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true);

// Ürün detayları: Açıklama / Kullanım / İçindekiler — dokununca açılıp kapanan bölümler
export default function DetailAccordion({ items }: { items: DetailItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, "easeInEaseOut", "opacity"));
    setOpen((cur) => (cur === id ? null : id));
  };

  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <View key={item.id} style={styles.item}>
            <Pressable
              onPress={() => toggle(item.id)}
              style={styles.head}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text style={styles.title}>{item.title.toLocaleUpperCase("tr")}</Text>
              {expanded ? (
                <Minus size={18} color={colors.ink} strokeWidth={1.4} />
              ) : (
                <Plus size={18} color={colors.ink} strokeWidth={1.4} />
              )}
            </Pressable>
            {expanded && (
              <View style={styles.body}>
                {item.html ? <RichText html={item.html} /> : <Text style={styles.plain}>{item.text}</Text>}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.border },
  item: { borderBottomWidth: 1, borderBottomColor: colors.border },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: space.md + 4 },
  title: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2.4, color: colors.ink },
  body: { paddingBottom: space.lg },
  plain: { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 23, color: colors.muted },
});
