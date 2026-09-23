// Web sitesiyle aynı kurallar — sunucuya gitmeden önce anında uyarı vermek için

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  kvkk: boolean;
};
export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizePhone(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? d : null;
}

export function validateLogin(v: LoginInput) {
  const e: Errors<LoginInput> = {};
  if (!v.email.trim()) e.email = "emailRequired";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "emailInvalid";
  if (!v.password) e.password = "passwordRequired";
  return e;
}

export function validateRegister(v: RegisterInput) {
  const e: Errors<RegisterInput> = {};
  if (v.firstName.trim().length < 2) e.firstName = "firstNameRequired";
  if (v.lastName.trim().length < 2) e.lastName = "lastNameRequired";
  if (!v.email.trim()) e.email = "emailRequired";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "emailInvalid";
  if (v.phone.trim() && !normalizePhone(v.phone)) e.phone = "phoneInvalid";
  if (v.password.length < 8 || !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(v.password) || !/\d/.test(v.password))
    e.password = "passwordWeak";
  if (!v.kvkk) e.kvkk = "kvkkRequired";
  return e;
}

// Hata kodlarının Türkçe karşılıkları (web'deki Auth.errors ile aynı)
export const ERROR_TEXT: Record<string, string> = {
  emailRequired: "E-posta adresinizi girin.",
  emailInvalid: "Geçerli bir e-posta adresi girin.",
  emailTaken: "Bu e-posta adresiyle zaten bir hesap var.",
  passwordRequired: "Şifrenizi girin.",
  passwordWeak: "Şifre en az 8 karakter olmalı, harf ve rakam içermeli.",
  firstNameRequired: "Adınızı girin.",
  lastNameRequired: "Soyadınızı girin.",
  phoneInvalid: "Geçerli bir cep telefonu girin (05XX XXX XX XX).",
  kvkkRequired: "Devam etmek için sözleşmeyi onaylamanız gerekiyor.",
  invalidCredentials: "E-posta veya şifre hatalı.",
  tooManyAttempts: "Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
  network: "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
  config: "Uygulama ayarı eksik: EXPO_PUBLIC_API_URL tanımlı değil.",
  server: "Şu an bağlantı kurulamıyor. Lütfen biraz sonra tekrar deneyin.",
};

export const errorText = (code?: string) => (code ? (ERROR_TEXT[code] ?? ERROR_TEXT.server) : undefined);