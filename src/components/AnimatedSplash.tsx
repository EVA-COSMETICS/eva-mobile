import { colors } from "@/theme";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

/*
  LOGO BOYUTU
  - LOGO_SCREEN_RATIO: logonun ekran genişliğinin ne kadarını kaplayacağı (0.8 = %80)
  - LOGO_ASPECT: SVG'nin genişlik / yükseklik oranı.
    landing.svg dosyasının ilk satırındaki viewBox="0 0 GENİŞLİK YÜKSEKLİK" değerlerinden bulunur.
    Örn: viewBox="0 0 600 300" → 600 / 300 = 2
*/
const LOGO_SCREEN_RATIO = 0.8;
const LOGO_MAX_WIDTH = 460;
const LOGO_ASPECT = 2;

// Zamanlama (milisaniye)
const REVEAL_MS = 1200; // logo soldan sağa açılır
const LINE_DELAY = 900; // altın çizgi başlar
const LINE_MS = 700;
const HOLD_MS = 800; // her şey göründükten sonra bekleme
const EXIT_MS = 550; // kapanış
const TOTAL_MS = LINE_DELAY + LINE_MS + HOLD_MS + EXIT_MS;

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.min(screenWidth * LOGO_SCREEN_RATIO, LOGO_MAX_WIDTH);
  const logoHeight = logoWidth / LOGO_ASPECT;
  const lineWidth = logoWidth * 0.3;

  // Not: React Compiler açık olduğu için .value yerine .set() / .get() kullanıyoruz
  const reveal = useSharedValue(0); // 0 → 1: logonun açılması
  const line = useSharedValue(0); // 0 → 1: çizginin uzaması
  const exit = useSharedValue(0); // 0 → 1: ekranın kaybolması

  useEffect(() => {
    // Telefonun kendi (sabit) açılış ekranını kapat — bu animasyon onun yerine geçiyor
    SplashScreen.hideAsync();

    reveal.set(withTiming(1, { duration: REVEAL_MS, easing: EASE_OUT }));
    line.set(withDelay(LINE_DELAY, withTiming(1, { duration: LINE_MS, easing: EASE_OUT })));
    exit.set(withDelay(TOTAL_MS - EXIT_MS, withTiming(1, { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) })));

    const timer = setTimeout(onFinish, TOTAL_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Logo: perde açılır gibi soldan sağa + hafif yakınlaşma
  const maskStyle = useAnimatedStyle(() => ({
    width: logoWidth * reveal.get(),
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + reveal.get() * 0.85,
    transform: [{ scale: 1.08 - reveal.get() * 0.08 }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth * line.get(),
    opacity: line.get(),
  }));

  // Kapanış: içerik hafifçe büyür, ekran şeffaflaşır
  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.get(),
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + exit.get() * 0.08 }],
  }));

  const size = { width: logoWidth, height: logoHeight };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={size}>
          <Animated.View style={[styles.mask, { height: logoHeight }, maskStyle]}>
            <Animated.View style={[size, logoStyle]}>
              <Image source={require("@/assets/svg/landing.svg")} style={size} contentFit="contain" />
            </Animated.View>
          </Animated.View>
        </View>
        <Animated.View style={[styles.line, lineStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  content: { alignItems: "center" },
  mask: { overflow: "hidden" },
  line: { height: 1, backgroundColor: colors.gold, marginTop: 28 },
});