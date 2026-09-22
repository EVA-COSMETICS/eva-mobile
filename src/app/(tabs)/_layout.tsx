import { colors, fonts } from "@/theme";
import { Tabs } from "expo-router/js-tabs";
import { Heart, House, LayoutGrid, Search, UserRound } from "lucide-react-native";

// Alttaki sekme menüsü
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 0.3 },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <House color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="kategoriler"
        options={{
          title: "Kategoriler",
          tabBarIcon: ({ color }) => <LayoutGrid color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="ara"
        options={{
          title: "Ara",
          tabBarIcon: ({ color }) => <Search color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="favoriler"
        options={{
          title: "Favoriler",
          tabBarIcon: ({ color }) => <Heart color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="hesabim"
        options={{
          title: "Hesabım",
          tabBarIcon: ({ color }) => <UserRound color={color} size={22} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}