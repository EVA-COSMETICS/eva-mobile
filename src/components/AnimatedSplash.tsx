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
  AÇILIŞ ANİMASYONU
  1) Ekran simsiyah açılır — bu siyahlık aslında dev boyuttaki logomuzdur.
  2) Logo yavaşça küçülerek ekranın ortasına yerleşir, arkasındaki krem zemin ortaya çıkar.
  3) Altına altın çizgi uzar, kısa bir bekleme sonrası ekran kaybolur.

  LOGO BOYUTU
  - LOGO_SCREEN_RATIO: logonun ekran genişliğinin ne kadarını kaplayacağı (0.85 = %85)
  - LOGO_ASPECT: SVG'nin genişlik / yükseklik oranı. landing.svg'nin ilk satırındaki
    viewBox="0 0 GENİŞLİK YÜKSEKLİK" değerlerinden bulunur. Örn: viewBox="0 0 600 300" → 2
*/
const LOGO_SCREEN_RATIO = 0.85;
const LOGO_MAX_WIDTH = 560;
const LOGO_ASPECT = 2;
const START_SCALE = 16; // başlangıçta logo ekranı tamamen kaplayacak kadar büyük

// Zamanlama (milisaniye) — hepsi daha yavaş ve yumuşak
const HOLD_BLACK_MS = 350; // siyah ekranda kısa bekleme
const SETTLE_MS = 2600; // logonun küçülüp yerleşmesi
const LINE_DELAY = HOLD_BLACK_MS + SETTLE_MS - 400;
const LINE_MS = 900;
const HOLD_MS = 900; // her şey göründükten sonra bekleme
const EXIT_MS = 700; // kapanış
export const SPLASH_TOTAL_MS = LINE_DELAY + LINE_MS + HOLD_MS + EXIT_MS;
const TOTAL_MS = SPLASH_TOTAL_MS;

const EASE_SETTLE = Easing.bezier(0.16, 1, 0.3, 1); // başta hızlı, sona doğru çok yavaş
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
    const { width: screenWidth } = useWindowDimensions();
    const logoWidth = Math.min(screenWidth * LOGO_SCREEN_RATIO, LOGO_MAX_WIDTH);
    const logoHeight = logoWidth / LOGO_ASPECT;
    const lineWidth = logoWidth * 0.3;

    // Not: React Compiler açık olduğu için .value yerine .set() / .get() kullanıyoruz
    const settle = useSharedValue(0); // 0 → 1: logonun dev boyuttan yerine oturması
    const black = useSharedValue(1); // 1 → 0: siyah örtünün açılması
    const line = useSharedValue(0);
    const exit = useSharedValue(0);

    useEffect(() => {
        // Telefonun kendi (sabit, siyah) açılış ekranını kapat — bu animasyon onun devamı
        SplashScreen.hideAsync();

        settle.set(withDelay(HOLD_BLACK_MS, withTiming(1, { duration: SETTLE_MS, easing: EASE_SETTLE })));
        black.set(withDelay(HOLD_BLACK_MS, withTiming(0, { duration: SETTLE_MS * 0.6, easing: Easing.in(Easing.quad) })));
        line.set(withDelay(LINE_DELAY, withTiming(1, { duration: LINE_MS, easing: EASE_OUT })));
        exit.set(withDelay(TOTAL_MS - EXIT_MS, withTiming(1, { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) })));

        const timer = setTimeout(onFinish, TOTAL_MS);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: START_SCALE - (START_SCALE - 1) * settle.get() }],
    }));
    const blackStyle = useAnimatedStyle(() => ({ opacity: black.get() }));
    const lineStyle = useAnimatedStyle(() => ({
        width: lineWidth * line.get(),
        opacity: line.get(),
    }));
    const containerStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.get() }));
    const contentStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + exit.get() * 0.06 }] }));

    const size = { width: logoWidth, height: logoHeight };

    return (
        <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]} pointerEvents="none">
            <Animated.View style={[styles.content, contentStyle]}>
                <Animated.View style={[size, logoStyle]}>
                    <Image
                        source={require("@/assets/svg/landing.svg")}
                        style={size}
                        contentFit="contain"
                        tintColor={colors.ink} // SVG'nin rengi ne olursa olsun siyah göster
                    />
                </Animated.View>
                <View style={styles.lineSlot}>
                    <Animated.View style={[styles.line, lineStyle]} />
                </View>
            </Animated.View>

            {/* Başlangıçtaki tam siyah ekran — logo küçülürken açılır */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.black, blackStyle]} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        overflow: "hidden",
    },
    content: { alignItems: "center" },
    lineSlot: { height: 1, marginTop: 32, alignItems: "center" },
    line: { height: 1, backgroundColor: colors.gold },
    black: { backgroundColor: colors.ink },
});