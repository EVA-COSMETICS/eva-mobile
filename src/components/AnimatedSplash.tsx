import { colors } from "@/theme";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

// Logonun ekrandaki boyutu — SVG'nin oranına göre değiştirebilirsin
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 110;
const LINE_WIDTH = 64;

// Zamanlama (milisaniye)
const REVEAL_MS = 1100; // logo soldan sağa açılır
const LINE_DELAY = 800; // altın çizgi
const HOLD_MS = 700; // her şey göründükten sonra bekleme
const EXIT_MS = 500; // kapanış

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const reduceMotion = useReducedMotion();

  const reveal = useSharedValue(0); // 0 → 1: logonun açılması
  const line = useSharedValue(0); // 0 → 1: çizginin uzaması
  const exit = useSharedValue(0); // 0 → 1: ekranın kaybolması

  useEffect(() => {
    // Uygulamanın kendi (sabit) açılış ekranını kapat — bu animasyon onun yerine geçiyor
    SplashScreen.hideAsync();

    const total = reduceMotion ? 600 : LINE_DELAY + 700 + HOLD_MS + EXIT_MS;

    if (reduceMotion) {
      reveal.value = 1;
      line.value = 1;
      exit.value = withDelay(300, withTiming(1, { duration: 300 }));
    } else {
      reveal.value = withTiming(1, { duration: REVEAL_MS, easing: EASE_OUT });
      line.value = withDelay(LINE_DELAY, withTiming(1, { duration: 700, easing: EASE_OUT }));
      exit.value = withDelay(total - EXIT_MS, withTiming(1, { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) }));
    }

    const timer = setTimeout(onFinish, total);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Logo: perde açılır gibi soldan sağa + hafif yakınlaşma
  const maskStyle = useAnimatedStyle(() => ({
    width: LOGO_WIDTH * reveal.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + reveal.value * 0.8,
    transform: [{ scale: 1.06 - reveal.value * 0.06 }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: LINE_WIDTH * line.value,
    opacity: line.value,
  }));

  // Kapanış: içerik hafifçe büyür, ekran şeffaflaşır
  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + exit.value * 0.08 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.logoBox}>
          <Animated.View style={[styles.mask, maskStyle]}>
            <Animated.View style={[styles.logoInner, logoStyle]}>
              <Image
                source={require("@/assets/svg/landing.svg")}
                style={styles.logo}
                contentFit="contain"
              />
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
  logoBox: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  mask: { height: LOGO_HEIGHT, overflow: "hidden" },
  logoInner: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  logo: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  line: { height: 1, backgroundColor: colors.gold, marginTop: 20 },
});