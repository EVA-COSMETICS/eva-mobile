import BackHeader from "@/components/BackHeader";
import { CategoryRow } from "@/components/CategoryCard";
import EmptyState from "@/components/EmptyState";
import { findCategory, useCategories } from "@/lib/content";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { PackageOpen } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Bir kategorinin alt kategorileri (ürünler ürün modülü eklenince burada listelenecek)
export default function CategoryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { categories } = useCategories();
    const category = findCategory(categories, Number(id));
    const banner = category?.banner ?? category?.image;

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <BackHeader title={category?.name.tr ?? ""} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {category && (
                    <>
                        <View style={[styles.banner, { backgroundColor: category.tone }]}>
                            {banner && <Image source={{ uri: banner }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />}
                        </View>
                        <View style={styles.body}>
                            <Text style={styles.eyebrow}>KATEGORİ</Text>
                            <Text style={styles.title}>{category.name.tr}</Text>

                            {category.children.length > 0 ? (
                                <View style={styles.list}>
                                    {category.children.map((c, i) => (
                                        <Animated.View key={c.id} entering={FadeInDown.delay(i * 60).duration(450)}>
                                            <CategoryRow category={c} onPress={() => router.push({ pathname: "/kategori/[id]", params: { id: String(c.id) } })} />
                                        </Animated.View>
                                    ))}
                                </View>
                            ) : (
                                <EmptyState icon={PackageOpen} title="Ürünler çok yakında" text="Bu kategorideki ürünler kısa süre içinde burada olacak." />
                            )}
                        </View>
                    </>
                )}
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
    list: { marginTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border },
});