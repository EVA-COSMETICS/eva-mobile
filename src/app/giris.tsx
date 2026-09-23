import BackHeader from "@/components/BackHeader";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import TextField from "@/components/TextField";
import { API_URL, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText, validateLogin, validateRegister, type Errors, type LoginInput, type RegisterInput } from "@/lib/validation";
import { colors, fonts, space } from "@/theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Lock, Mail, Phone } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    type TextInput,
} from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "giris" | "kayit";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export default function AuthScreen() {
    const params = useLocalSearchParams<{ tab?: string }>();
    const [tab, setTab] = useState<Tab>(params.tab === "kayit" ? "kayit" : "giris");
    const { status } = useAuth();
    const { width } = useWindowDimensions();

    // Giriş / kayıt başarılı olunca bu ekranı kapat, geldiği yere dön
    useEffect(() => {
        if (status === "authed") close();
    }, [status]);

    // Sekme altındaki çizgi kayarak yer değiştirir
    const tabWidth = (width - space.lg * 2) / 2;
    const indicator = useSharedValue(tab === "giris" ? 0 : 1);
    useEffect(() => {
        indicator.set(withTiming(tab === "giris" ? 0 : 1, { duration: 400, easing: EASE }));
    }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
    const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicator.get() * tabWidth }] }));

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {/* Üst çubuk: geri + logo. Logo sabit ölçülü kutuda, taşmaz */}
                <BackHeader
                    center={
                        <View style={styles.logoBox}>
                            <Image source={require("@/assets/svg/landing.svg")} style={styles.logo} contentFit="contain" tintColor={colors.ink} />
                        </View>
                    }
                />

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sekmeler */}
                    <View style={styles.tabs}>
                        {(["giris", "kayit"] as const).map((key) => (
                            <Pressable key={key} onPress={() => setTab(key)} style={styles.tab} accessibilityRole="tab">
                                <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
                                    {(key === "giris" ? "Giriş Yap" : "Üye Ol").toLocaleUpperCase("tr")}
                                </Text>
                            </Pressable>
                        ))}
                        <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]} />
                    </View>

                    <Animated.View key={tab} entering={FadeInDown.duration(450).easing(EASE)}>
                        {tab === "giris" ? <LoginForm onSwitch={() => setTab("kayit")} /> : <RegisterForm onSwitch={() => setTab("giris")} />}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/hesabim");
}

// Sunucudan gelen hatayı ekrandaki alanlara dağıtır
function splitError(err: unknown) {
    if (err instanceof ApiError) {
        return { form: err.fieldErrors ? undefined : errorText(err.code), fields: err.fieldErrors ?? {} };
    }
    return { form: errorText("server"), fields: {} };
}

/* ------------------------------ GİRİŞ ------------------------------ */

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
    const { login } = useAuth();
    const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
    const [errors, setErrors] = useState<Errors<LoginInput>>({});
    const [formError, setFormError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    function set<K extends keyof LoginInput>(key: K, value: string) {
        setValues((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
        setFormError(undefined);
        setNotice(undefined);
    }

    async function submit() {
        const e = validateLogin(values);
        setErrors(e);
        setFormError(undefined);
        if (Object.keys(e).length) return;

        setLoading(true);
        try {
            await login(values.email.trim(), values.password);
        } catch (err) {
            const { form, fields } = splitError(err);
            setFormError(form);
            setErrors(fields as Errors<LoginInput>);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View>
            <Text style={styles.title}>Tekrar hoş geldiniz</Text>
            <Text style={styles.subtitle}>Siparişlerinizi ve favorilerinizi görmek için giriş yapın.</Text>

            <TextField
                label="E-posta"
                icon={Mail}
                value={values.email}
                onChangeText={(v) => set("email", v)}
                error={errorText(errors.email)}
                placeholder="ornek@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
            />
            <TextField
                ref={passwordRef}
                label="Şifre"
                icon={Lock}
                password
                value={values.password}
                onChangeText={(v) => set("password", v)}
                error={errorText(errors.password)}
                placeholder="••••••••"
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
            />

            <Pressable
                onPress={() => setNotice("Şifre sıfırlama çok yakında aktif olacak. Şimdilik bizimle WhatsApp üzerinden iletişime geçebilirsiniz.")}
                style={styles.forgot}
                hitSlop={8}
            >
                <Text style={styles.forgotText}>Şifremi unuttum</Text>
            </Pressable>

            {notice && <Text style={styles.notice}>{notice}</Text>}
            {formError && <Text style={styles.formError}>{formError}</Text>}

            <Button label="Giriş Yap" onPress={submit} loading={loading} />

            <Text style={styles.switchText}>
                Hesabınız yok mu?{" "}
                <Text style={styles.switchLink} onPress={onSwitch}>
                    Hemen üye olun
                </Text>
            </Text>
        </View>
    );
}

/* ------------------------------ KAYIT ------------------------------ */

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
    const { register } = useAuth();
    const [values, setValues] = useState<RegisterInput>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        kvkk: false,
    });
    const [marketing, setMarketing] = useState(false);
    const [errors, setErrors] = useState<Errors<RegisterInput>>({});
    const [formError, setFormError] = useState<string>();
    const [loading, setLoading] = useState(false);

    const lastRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    function set<K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) {
        setValues((p) => ({ ...p, [key]: value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
        setFormError(undefined);
    }

    async function submit() {
        const e = validateRegister(values);
        setErrors(e);
        setFormError(undefined);
        if (Object.keys(e).length) return;

        setLoading(true);
        try {
            await register({ ...values, email: values.email.trim() }, marketing);
        } catch (err) {
            const { form, fields } = splitError(err);
            setFormError(form);
            setErrors(fields as Errors<RegisterInput>);
        } finally {
            setLoading(false);
        }
    }

    const openLegal = (path: string) => API_URL && WebBrowser.openBrowserAsync(`${API_URL}${path}`);

    return (
        <View>
            <Text style={styles.title}>EVA'ya katılın</Text>
            <Text style={styles.subtitle}>Birkaç saniyede üye olun, alışverişin keyfini çıkarın.</Text>

            <View style={styles.row}>
                <View style={styles.flex}>
                    <TextField
                        label="Ad"
                        value={values.firstName}
                        onChangeText={(v) => set("firstName", v)}
                        error={errorText(errors.firstName)}
                        autoComplete="given-name"
                        textContentType="givenName"
                        returnKeyType="next"
                        onSubmitEditing={() => lastRef.current?.focus()}
                        submitBehavior="submit"
                    />
                </View>
                <View style={styles.flex}>
                    <TextField
                        ref={lastRef}
                        label="Soyad"
                        value={values.lastName}
                        onChangeText={(v) => set("lastName", v)}
                        error={errorText(errors.lastName)}
                        autoComplete="family-name"
                        textContentType="familyName"
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        submitBehavior="submit"
                    />
                </View>
            </View>

            <TextField
                ref={emailRef}
                label="E-posta"
                icon={Mail}
                value={values.email}
                onChangeText={(v) => set("email", v)}
                error={errorText(errors.email)}
                placeholder="ornek@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                submitBehavior="submit"
            />
            <TextField
                ref={phoneRef}
                label="Cep Telefonu"
                optionalLabel="İsteğe bağlı"
                icon={Phone}
                value={values.phone}
                onChangeText={(v) => set("phone", v)}
                error={errorText(errors.phone)}
                hint="Sipariş ve kargo bilgilendirmeleri için."
                placeholder="05XX XXX XX XX"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
            />
            <TextField
                ref={passwordRef}
                label="Şifre"
                icon={Lock}
                password
                value={values.password}
                onChangeText={(v) => set("password", v)}
                error={errorText(errors.password)}
                hint="En az 8 karakter, harf ve rakam içermeli."
                placeholder="••••••••"
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
            />

            <View style={styles.checks}>
                <Checkbox checked={values.kvkk} onChange={(v) => set("kvkk", v)} error={errorText(errors.kvkk)}>
                    <Text style={styles.link} onPress={() => openLegal("/uyelik-sozlesmesi")}>
                        Üyelik Sözleşmesi
                    </Text>
                    'ni ve{" "}
                    <Text style={styles.link} onPress={() => openLegal("/kvkk")}>
                        KVKK Aydınlatma Metni
                    </Text>
                    'ni okudum, kabul ediyorum.
                </Checkbox>
                <Checkbox checked={marketing} onChange={setMarketing}>
                    Kampanya ve yeniliklerden SMS ve e-posta ile haberdar olmak istiyorum.
                </Checkbox>
            </View>

            {formError && <Text style={styles.formError}>{formError}</Text>}

            <Button label="Üye Ol" onPress={submit} loading={loading} />

            <Text style={styles.switchText}>
                Zaten üye misiniz?{" "}
                <Text style={styles.switchLink} onPress={onSwitch}>
                    Giriş yapın
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.cream },
    flex: { flex: 1 },
    logoBox: { width: 110, height: 34, overflow: "hidden", alignItems: "center", justifyContent: "center" },
    logo: { width: 110, height: 34 },
    content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, marginTop: space.lg },
    tab: { flex: 1, alignItems: "center", paddingVertical: space.md },
    tabText: { fontFamily: fonts.sansMedium, fontSize: 11.5, letterSpacing: 2.6, color: colors.faint },
    tabTextActive: { color: colors.ink },
    indicator: { position: "absolute", bottom: -1, left: 0, height: 1.5, backgroundColor: colors.ink },
    title: { marginTop: space.xl, fontFamily: fonts.serifLight, fontSize: 36, lineHeight: 40, color: colors.ink },
    subtitle: {
        marginTop: space.sm,
        marginBottom: space.xl,
        fontFamily: fonts.sans,
        fontSize: 13.5,
        lineHeight: 20,
        color: colors.muted,
    },
    row: { flexDirection: "row", gap: space.md },
    forgot: { alignSelf: "flex-end", marginTop: -6, marginBottom: space.lg },
    forgotText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
    notice: {
        borderWidth: 1,
        borderColor: "rgba(184,151,106,0.4)",
        backgroundColor: "rgba(184,151,106,0.06)",
        padding: 14,
        marginBottom: space.md,
        fontFamily: fonts.sans,
        fontSize: 13,
        lineHeight: 19,
        color: colors.muted,
    },
    formError: {
        borderWidth: 1,
        borderColor: "#fecaca",
        backgroundColor: "#fef2f2",
        padding: 14,
        marginBottom: space.md,
        fontFamily: fonts.sans,
        fontSize: 13,
        lineHeight: 19,
        color: "#b91c1c",
    },
    checks: { marginTop: space.xs, marginBottom: space.md },
    link: { color: colors.ink, textDecorationLine: "underline" },
    switchText: { marginTop: space.xl, textAlign: "center", fontFamily: fonts.sans, fontSize: 13.5, color: colors.muted },
    switchLink: { color: colors.ink, textDecorationLine: "underline" },
});