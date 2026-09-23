import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/*
  İLK AÇILIŞ TANITIMI
  Tanıtım bir kez gösterilir; işaret AsyncStorage'da tutulur.
  AsyncStorage uygulama silinince temizlendiği için, uygulamayı silip tekrar yükleyen kullanıcı tanıtımı yeniden görür.
*/
const KEY = "eva_intro_seen_v1";

type IntroContextValue = { ready: boolean; seen: boolean; finish: () => void };
const IntroContext = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [seen, setSeen] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(KEY)
            .then((v) => setSeen(v === "1"))
            .catch(() => setSeen(true)) // okunamazsa kullanıcıyı bekletme, doğrudan ana sayfa
            .finally(() => setReady(true));
    }, []);

    const finish = useCallback(() => {
        setSeen(true);
        AsyncStorage.setItem(KEY, "1").catch(() => { });
    }, []);

    const value = useMemo(() => ({ ready, seen, finish }), [ready, seen, finish]);
    return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
    const ctx = useContext(IntroContext);
    if (!ctx) throw new Error("useIntro, IntroProvider içinde kullanılmalı");
    return ctx;
}