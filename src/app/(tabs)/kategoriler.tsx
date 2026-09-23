import Button from "@/components/Button";
import { CategoryBanner } from "@/components/CategoryCard";
import EmptyState from "@/components/EmptyState";
import ScreenHeader from "@/components/ScreenHeader";
import { useCategories } from "@/lib/content";
import { colors, space } from "@/theme";
import { router } from "expo-router";
import { WifiOff } from "lucide-react-native";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const { categories, loading, error, reload } = useCategories();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && categories.length > 0} onRefresh={reload} tintColor={colors.gold} />}
      >
        <ScreenHeader eyebrow="Keşfet" title="Kategoriler" />

        {loading && categories.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : error && categories.length === 0 ? (
          <EmptyState icon={WifiOff} title="Kategoriler yüklenemedi" text="İnternet bağlantınızı kontrol edip tekrar deneyin.">
            <Button label="Tekrar Dene" variant="outline" onPress={reload} />
          </EmptyState>
        ) : (
          categories.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 80).duration(500)}>
              <CategoryBanner category={c} onPress={() => router.push({ pathname: "/kategori/[id]", params: { id: String(c.id) } })} />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  center: { paddingVertical: space.xxl },
});