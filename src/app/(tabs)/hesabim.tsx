import Button from "@/components/Button";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { useAuth, type Customer } from "@/lib/auth";
import { LEGAL_LINKS } from "@/lib/content";
import { colors, fonts, space } from "@/theme";
import { router } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight, FileText, Globe, Headphones, Info, LogOut, MapPin, Package } from "lucide-react-native";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type MenuItem = { icon: LucideIcon; label: string; value?: string; requiresAuth?: boolean };

const MENU: MenuItem[] = [
  { icon: Package, label: "Siparişlerim", requiresAuth: true },
  { icon: MapPin, label: "Adreslerim", requiresAuth: true },
  { icon: Globe, label: "Dil", value: "Türkçe" },
  { icon: Info, label: "Hakkımızda" },
  { icon: Headphones, label: "İletişim" },
];

export default function AccountScreen() {
  const { status, customer, logout } = useAuth();
  const authed = status === "authed" && customer;

  function openItem(item: MenuItem) {
    // Giriş yapmamış kullanıcı üyelik gerektiren bir yere dokunursa giriş ekranı açılır
    if (item.requiresAuth && !authed) return router.push("/giris");
    if (item.requiresAuth) Alert.alert(item.label, "Bu bölüm çok yakında aktif olacak.");
  }

  function confirmLogout() {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader eyebrow="Hesabım" title={authed ? `Merhaba, ${customer.firstName}` : "Hoş geldiniz"} />

      {status === "loading" ? (
        <View style={[styles.card, styles.loading]}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : authed ? (
        <Animated.View entering={FadeIn.duration(400)}>
          <ProfileCard customer={customer} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
          <Text style={styles.guestText}>
            Üye olmadan gezinebilir, favorilerinizi kaydedebilirsiniz. Sipariş vermek için giriş yapmanız yeterli.
          </Text>
          <View style={styles.buttons}>
            <View style={styles.flex}>
              <Button label="Giriş Yap" onPress={() => router.push("/giris")} />
            </View>
            <View style={styles.flex}>
              <Button label="Üye Ol" variant="outline" onPress={() => router.push({ pathname: "/giris", params: { tab: "kayit" } })} />
            </View>
          </View>
        </Animated.View>
      )}

      <View style={styles.menu}>
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable key={item.label} onPress={() => openItem(item)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
              <Icon color={colors.gold} size={18} strokeWidth={1.5} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              {item.value && <Text style={styles.rowValue}>{item.value}</Text>}
              <ChevronRight color={colors.faint} size={18} strokeWidth={1.5} />
            </Pressable>
          );
        })}
      </View>

      {/* Yasal metinler — içerik web sitesinden gelir */}
      <Text style={styles.sectionTitle}>YASAL</Text>
      <View style={styles.legal}>
        {LEGAL_LINKS.map((l) => (
          <Pressable
            key={l.slug}
            onPress={() => router.push({ pathname: "/yasal/[slug]", params: { slug: l.slug } })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          >
            <FileText color={colors.faint} size={17} strokeWidth={1.5} />
            <Text style={[styles.rowLabel, styles.legalLabel]}>{l.title}</Text>
            <ChevronRight color={colors.faint} size={18} strokeWidth={1.5} />
          </Pressable>
        ))}

        {authed && (
          <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
            <LogOut color={colors.muted} size={18} strokeWidth={1.5} />
            <Text style={[styles.rowLabel, { color: colors.muted }]}>Çıkış Yap</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

function formatPhone(p: string | null) {
  if (!p) return null;
  return `0${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 8)} ${p.slice(8)}`;
}

function ProfileCard({ customer }: { customer: Customer }) {
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toLocaleUpperCase("tr");
  const since = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(customer.createdAt));

  return (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>
            {customer.firstName} {customer.lastName}
          </Text>
          <Text style={styles.email}>{customer.email}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        {formatPhone(customer.phone) && <Text style={styles.metaText}>{formatPhone(customer.phone)}</Text>}
        <Text style={styles.metaText}>{since} tarihinden beri üye</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: space.lg },
  loading: { alignItems: "center", paddingVertical: space.xl },
  guestText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted },
  buttons: { flexDirection: "row", gap: space.sm, marginTop: space.lg },
  flex: { flex: 1 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.serifMedium, fontSize: 20, color: colors.cream, letterSpacing: 1 },
  name: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  email: { marginTop: 2, fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  meta: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  metaText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
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
  sectionTitle: {
    marginTop: space.xl,
    marginBottom: space.sm,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.gold,
  },
  legal: { borderTopWidth: 1, borderTopColor: colors.border },
  legalLabel: { fontSize: 14, color: colors.muted },
});