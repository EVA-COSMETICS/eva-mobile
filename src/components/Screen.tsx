import { colors, space } from "@/theme";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { children: React.ReactNode; scroll?: boolean; style?: ViewStyle };

// Her ekranın ortak çerçevesi: çentik/durum çubuğu boşluğu ve kaydırma
export default function Screen({ children, scroll = true, style }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, style]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  fill: { flex: 1 },
});