import AnimatedSplash from "@/components/AnimatedSplash";
import { AuthProvider } from "@/lib/auth";
import { IntroProvider, useIntro } from "@/lib/intro";
import { colors } from "@/theme";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

// Fontlar ve tanıtım bilgisi yüklenene kadar telefonun kendi açılış ekranı kalsın
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  if (!loaded && !error) return null;

  return (
    <IntroProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </IntroProvider>
  );
}

function RootStack() {
  const intro = useIntro();
  const [splashDone, setSplashDone] = useState(false);

  // Tanıtımın daha önce görülüp görülmediği okunana kadar bekle
  if (!intro.ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
          gestureEnabled: true, // iOS'ta ekranın solundan kaydırarak geri dönme
        }}
      >
        {/* İlk açılış: tanıtım görülmediyse yalnızca tanıtım ekranı açılabilir */}
        <Stack.Protected guard={!intro.seen}>
          <Stack.Screen name="tanitim" options={{ animation: "fade", gestureEnabled: false }} />
        </Stack.Protected>

        <Stack.Protected guard={intro.seen}>
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="giris" />
          <Stack.Screen name="kategori/[id]" />
          <Stack.Screen name="yasal/[slug]" />
        </Stack.Protected>
      </Stack>
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </>
  );
}