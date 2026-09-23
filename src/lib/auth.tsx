import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, ApiError } from "./api";
import type { RegisterInput } from "./validation";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  marketingConsent: boolean;
  createdAt: string;
};

type AuthResponse = { token: string; expiresAt: string; customer: Customer };

type AuthContextValue = {
  status: "loading" | "guest" | "authed";
  customer: Customer | null;
  token: string | null; // ürün yorumu gibi üye isteklerinde kullanılır
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput, marketing: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

// Oturum anahtarı telefonun şifreli deposunda (iOS Keychain / Android Keystore) saklanır
const TOKEN_KEY = "eva_customer_token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  // Uygulama açılınca kayıtlı oturumu kontrol et
  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
      if (!saved) return setStatus("guest");
      try {
        const { customer } = await api<{ customer: Customer }>("/api/v1/auth/me", { token: saved });
        setToken(saved);
        setCustomer(customer);
        setStatus("authed");
      } catch (err) {
        // Anahtar geçersizse sil; internet yoksa sakla, bir dahaki açılışta tekrar denenir
        if (err instanceof ApiError && err.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        setStatus("guest");
      }
    })();
  }, []);

  const saveSession = useCallback(async ({ token, customer }: AuthResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setToken(token);
    setCustomer(customer);
    setStatus("authed");
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await saveSession(await api<AuthResponse>("/api/v1/auth/login", { method: "POST", body: { email, password } }));
    },
    [saveSession]
  );

  const register = useCallback(
    async (input: RegisterInput, marketing: boolean) => {
      await saveSession(
        await api<AuthResponse>("/api/v1/auth/register", { method: "POST", body: { ...input, marketing } })
      );
    },
    [saveSession]
  );

  const logout = useCallback(async () => {
    const current = token;
    setToken(null);
    setCustomer(null);
    setStatus("guest");
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    if (current) api("/api/v1/auth/logout", { method: "POST", token: current }).catch(() => {});
  }, [token]);

  const value = useMemo(
    () => ({ status, customer, token, login, register, logout }),
    [status, customer, token, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
