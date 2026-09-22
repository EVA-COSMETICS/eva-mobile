import Button from "@/components/Button";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { colors, fonts, space } from "@/theme";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight, FileText, Globe, Headphones, Info, MapPin, Package } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

const MENU: { icon: LucideIcon; label: string; value?: string }[] = [
  { icon: Package, label: "Siparişlerim" },
  { icon: MapPin, label: "Adreslerim" },
  { icon: Globe, label: "Dil", value: "Türkçe" },
  { icon: Info, label: "Hakkımızda" },
  { icon: Headphones, label: "İletişim" },
  { icon: FileText, label: "Gizlilik ve KVKK" },
];

export default function AccountScreen() {
  return (
    <Screen>
      <ScreenHeader eyebrow="Hesabım" title="Hoş geldiniz" />

      {/* Ziyaretçi kartı — giriş zorunlu değil */}
      <View style={styles.guestCard}>
        <Text style={styles.guestText}>
          Üye olmadan gezinebilir, favorilerinizi kaydedebilirsiniz. Sipariş vermek için giriş yapmanız yeterli.
        </Text>
        <View style={styles.buttons}>
          <View style={styles.flex}>
            <Button label="Giriş Yap" />
          </View>
          <View style={styles.flex}>
            <Button label="Üye Ol" variant="outline" />
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map(({ icon: Icon, label, value }) => (
          <Pressable key={label} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
            <Icon color={colors.gold} size={18} strokeWidth={1.5} />
            <Text style={styles.rowLabel}>{label}</Text>
            {value && <Text style={styles.rowValue}>{value}</Text>}
            <ChevronRight color={colors.faint} size={18} strokeWidth={1.5} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guestCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: space.lg },
  guestText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted },
  buttons: { flexDirection: "row", gap: space.sm, marginTop: space.lg },
  flex: { flex: 1 },
  menu: { marginTop: space.xl, borderTopWidth: 1, borderTopColor: colors.border },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  rowValue: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
});