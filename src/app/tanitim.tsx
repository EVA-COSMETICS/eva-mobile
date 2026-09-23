import { SPLASH_TOTAL_MS } from "@/components/AnimatedSplash";
import { fetchIntroSlides, type IntroSlide } from "@/lib/content";
import { useIntro } from "@/lib/intro";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeOut,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/*
  İLK AÇILIŞ TANITIM EKRANI
  - Görseller ve üzerindeki yazılar admin panelinden gelir (Site İçeriği › Mobil Uygulama — Tanıtım Ekranı)
  - Yazılar (üst başlık, başlık, açıklama) alttaki butonun hemen üstünde görünür; boşsa yalnızca görsel gösterilir
  - Her görsel ekranı tamamen kaplar, yavaşça yakınlaşır ve bir sonrakine yumuşakça geçer
  - Ekranın sağına dokununca ileri, soluna dokununca geri gider
  - "Tanıtımı Geç" ile ana sayfaya geçilir ve tanıtım bir daha gösterilmez
*/
const SLIDE_MS = 4500;
const FADE_MS = 900;

export default function IntroScreen() {
  const { finish } = useIntro();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [slides, setSlides] = useState<IntroSlide[] | null>(null);
  const [index, setIndex] = useState(0);
  // Açılış animasyonu bitene kadar görseller ilerlemesin
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), SPLASH_TOTAL_MS - 400);
    return () => clearTimeout(timer);
  }, []);

  // Görselleri çek ve önceden indir; olmazsa marka ekranı gösterilir
  useEffect(() => {
    fetchIntroSlides()
      .then(async (list) => {
        await Image.prefetch(list.map((s) => s.url)).catch(() => {});
        setSlides(list);
      })
      .catch(() => setSlides([]));
  }, []);

  const count = slides?.length ?? 0;
  const isLast = count === 0 || index === count - 1;
  const current = slides?.[index];
  const hasCaption = !!slides?.some((s) => s.eyebrow || s.title || s.text);

  // Otomatik ilerleme (son görselde durur)
  useEffect(() => {
    if (!started || count < 2 || index >= count - 1) return;
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, count - 1)), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, count, started]);

  const go = (dir: 1 | -1) => setIndex((i) => Math.max(0, Math.min(count - 1, i + dir)));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {slides === null ? null : count === 0 ? (
        <BrandFallback />
      ) : (
        slides.map((s, i) => <SlideImage key={s.id} url={s.url} active={i === index} />)
      )}

      {/* Üst ve alt karartma — yazılar her görselde okunur kalsın */}
      <LinearGradient colors={["rgba(0,0,0,0.45)", "transparent"]} style={[styles.topShade, { height: insets.top + 120 }]} pointerEvents="none" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.75)"]}
        locations={[0, 0.4, 1]}
        style={[styles.bottomShade, hasCaption && styles.bottomShadeTall]}
        pointerEvents="none"
      />

      {/* Dokunma alanları: sol = geri, sağ = ileri */}
      {count > 1 && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.tapRow}>
            <Pressable style={styles.flex} onPress={() => go(-1)} accessibilityLabel="Önceki" />
            <Pressable style={styles.flex} onPress={() => go(1)} accessibilityLabel="Sonraki" />
          </View>
        </View>
      )}

      {/* İlerleme çizgileri */}
      {count > 1 && (
        <View style={[styles.progressRow, { top: insets.top + space.md, width: width - space.lg * 2 }]} pointerEvents="none">
          {slides!.map((s, i) => (
            <ProgressBar key={s.id} state={i < index ? "done" : i === index ? (started ? "active" : "idle") : "idle"} />
          ))}
        </View>
      )}

      {/* Logo */}
      <View style={[styles.logoWrap, { top: insets.top + (count > 1 ? 44 : 24) }]} pointerEvents="none">
        <Image source={require("@/assets/svg/landing.svg")} style={styles.logo} contentFit="contain" tintColor={colors.cream} />
      </View>

      {/* Alt: görselin yazısı + buton */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]} pointerEvents="box-none">
        {current && (current.eyebrow || current.title || current.text) && (
          // key değişince eski yazı kaybolur, yenisi aşağıdan belirir
          <Animated.View
            key={current.id}
            entering={FadeInDown.delay(started ? 250 : SPLASH_TOTAL_MS).duration(800)}
            exiting={FadeOut.duration(300)}
            style={styles.caption}
            pointerEvents="none"
          >
            {current.eyebrow && <Text style={styles.captionEyebrow}>{current.eyebrow.toLocaleUpperCase("tr")}</Text>}
            {current.title && <Text style={styles.captionTitle}>{current.title}</Text>}
            {current.text && <Text style={styles.captionText}>{current.text}</Text>}
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(600).duration(700)}>
          <Pressable
            onPress={finish}
            style={({ pressed }) => [styles.button, isLast ? styles.buttonSolid : styles.buttonOutline, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: isLast ? colors.ink : colors.cream }]}>
              {(isLast ? "Alışverişe Başla" : "Tanıtımı Geç").toLocaleUpperCase("tr")}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// Tek bir tam ekran görsel: aktif olunca belirir ve yavaşça yakınlaşır
function SlideImage({ url, active }: { url: string; active: boolean }) {
  const opacity = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.set(withTiming(active ? 1 : 0, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) }));
    if (active) {
      scale.set(1);
      scale.set(withTiming(1.1, { duration: SLIDE_MS + FADE_MS * 2, easing: Easing.linear }));
    } else {
      cancelAnimation(scale);
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
    </Animated.View>
  );
}

// Üstteki ince ilerleme çizgisi (Instagram hikâyesi gibi dolar)
function ProgressBar({ state }: { state: "done" | "active" | "idle" }) {
  const fill = useSharedValue(state === "done" ? 1 : 0);

  useEffect(() => {
    cancelAnimation(fill);
    if (state === "active") {
      fill.set(0);
      fill.set(withTiming(1, { duration: SLIDE_MS, easing: Easing.linear }));
    } else {
      fill.set(state === "done" ? 1 : 0);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

// Admin görsel eklemediyse gösterilen sade marka ekranı
function BrandFallback() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback]}>
      <Animated.Text entering={FadeIn.delay(300).duration(900)} style={styles.fallbackEyebrow}>
        320 MHZ
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(500).duration(1100)} style={styles.fallbackTitle}>
        Güzellik, yüksek bir{"\n"}enerjinin yansımasıdır.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  flex: { flex: 1 },
  topShade: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomShade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 260 },
  bottomShadeTall: { height: 460 },
  caption: { marginBottom: space.lg },
  captionEyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3.5, color: colors.gold, marginBottom: space.sm },
  captionTitle: { fontFamily: fonts.serifLight, fontSize: 38, lineHeight: 42, color: colors.cream },
  captionText: { marginTop: space.sm, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: "rgba(250,247,242,0.82)" },
  tapRow: { flex: 1, flexDirection: "row", marginBottom: 140 },
  progressRow: { position: "absolute", left: space.lg, flexDirection: "row", gap: 6 },
  track: { flex: 1, height: 2, backgroundColor: "rgba(250,247,242,0.3)", overflow: "hidden" },
  fill: { height: 2, backgroundColor: colors.cream },
  logoWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  logo: { width: 110, height: 50 },
  bottom: { position: "absolute", left: space.lg, right: space.lg, bottom: 0 },
  button: { height: 54, alignItems: "center", justifyContent: "center" },
  buttonOutline: { borderWidth: 1, borderColor: "rgba(250,247,242,0.8)" },
  buttonSolid: { backgroundColor: colors.cream },
  buttonText: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2.6 },
  fallback: { alignItems: "center", justifyContent: "center", paddingHorizontal: space.xl, backgroundColor: colors.ink },
  fallbackEyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 4, color: colors.gold, marginBottom: space.lg },
  fallbackTitle: { fontFamily: fonts.serifLight, fontSize: 36, lineHeight: 42, color: colors.cream, textAlign: "center" },
});