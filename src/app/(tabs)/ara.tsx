import EmptyState from "@/components/EmptyState";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { colors, fonts, space } from "@/theme";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <Screen>
      <ScreenHeader eyebrow="Ara" title="Ne arıyorsunuz?" />
      <View style={styles.inputWrap}>
        <Search color={colors.faint} size={18} strokeWidth={1.5} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ürün, kategori ara…"
          placeholderTextColor={colors.faint}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>
      <EmptyState
        icon={Search}
        title="Arama yakında"
        text="Ürünler siteye eklendiğinde buradan anında arayabileceksiniz."
      />
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
});