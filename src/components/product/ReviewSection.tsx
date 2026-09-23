import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, Lock, Star } from "lucide-react-native";
import Button from "@/components/Button";
import { ApiError } from "@/lib/api";
import {
  REVIEW_ERRORS,
  fetchMoreReviews,
  formatDate,
  postReview,
  type RatingDistribution,
  type Review,
  type Viewer,
} from "@/lib/products";
import { colors, fonts, space } from "@/theme";
import Stars from "./Stars";

type Props = {
  slug: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  distribution: RatingDistribution;
  viewer: Viewer;
  token: string | null;
  onSubmitted: () => void; // yorum gönderilince ürün yeniden yüklenir
};

const PAGE = 10;

export default function ReviewSection({ slug, rating, reviewCount, reviews: initial, distribution, viewer, token, onSubmitted }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const total = distribution.reduce((s, d) => s + d.count, 0);

  // Ürün yeniden yüklenince ilk sayfayı güncelle
  const [prevInitial, setPrevInitial] = useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setReviews(initial);
  }

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const more = await fetchMoreReviews(slug, reviews.length);
      setReviews((r) => [...r, ...more.filter((m) => !r.some((x) => x.id === m.id))]);
    } catch {
      // sessizce geç; kullanıcı tekrar deneyebilir
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>YORUMLAR</Text>
      <Text style={styles.title}>Müşteri Deneyimleri</Text>

      {/* Özet */}
      <View style={styles.summary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.big}>{reviewCount > 0 ? rating.toFixed(1) : "–"}</Text>
          <Stars value={rating} size={15} />
          <Text style={styles.count}>{reviewCount > 0 ? `${reviewCount} değerlendirme` : "Henüz yorum yok"}</Text>
        </View>
        <View style={styles.bars}>
          {distribution.map((d) => (
            <View key={d.rating} style={styles.barRow}>
              <Text style={styles.barLabel}>{d.rating}</Text>
              <Star size={10} color={colors.gold} fill={colors.gold} />
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${total ? (d.count / total) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.barCount}>{d.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Yorum yazma durumu */}
      <View style={styles.cta}>
        {!viewer.loggedIn ? (
          <Notice text="Yorum yapmak için giriş yapın. Yalnızca ürünü satın alan üyeler değerlendirme yazabilir.">
            <Button label="Giriş Yap" variant="outline" onPress={() => router.push("/giris")} />
          </Notice>
        ) : !viewer.canReview ? (
          <Notice text="Yalnızca bu ürünü satın alıp teslim alan üyeler yorum yapabilir." />
        ) : formOpen ? (
          <ReviewForm
            slug={slug}
            token={token}
            initial={viewer.myReview}
            onCancel={() => setFormOpen(false)}
            onDone={() => {
              setFormOpen(false);
              onSubmitted();
            }}
          />
        ) : (
          <Button label={viewer.myReview ? "Yorumumu Düzenle" : "Yorum Yaz"} onPress={() => setFormOpen(true)} />
        )}
      </View>

      {/* Liste */}
      <View style={styles.list}>
        {reviews.map((r) => (
          <View key={r.id} style={styles.review}>
            <View style={styles.reviewHead}>
              <Stars value={r.rating} size={12} />
              <Text style={styles.date}>{formatDate(r.createdAt)}</Text>
            </View>
            {r.title ? <Text style={styles.reviewTitle}>{r.title}</Text> : null}
            <Text style={styles.body}>{r.body}</Text>
            <View style={styles.author}>
              <Text style={styles.authorName}>
                {r.author}
                {r.isMine ? "  · Sizin yorumunuz" : ""}
              </Text>
              <View style={styles.verified}>
                <BadgeCheck size={12} color={colors.gold} strokeWidth={1.6} />
                <Text style={styles.verifiedText}>Doğrulanmış alışveriş</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {reviews.length < reviewCount && reviews.length >= PAGE && (
        <View style={{ marginTop: space.lg }}>
          <Button label="Daha Fazla Yorum" variant="outline" loading={loadingMore} onPress={loadMore} />
        </View>
      )}
    </View>
  );
}

function Notice({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeRow}>
        <Lock size={16} color={colors.gold} strokeWidth={1.5} />
        <Text style={styles.noticeText}>{text}</Text>
      </View>
      {children && <View style={{ marginTop: space.md }}>{children}</View>}
    </View>
  );
}

/* ------------------------------ Form ------------------------------ */

type FormProps = {
  slug: string;
  token: string | null;
  initial: Viewer["myReview"];
  onCancel: () => void;
  onDone: () => void;
};

function ReviewForm({ slug, token, initial, onCancel, onDone }: FormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (rating < 1) return setError(REVIEW_ERRORS.rating);
    if (body.trim().length < 10) return setError(REVIEW_ERRORS.bodyShort);
    if (!token) return setError(REVIEW_ERRORS.unauthorized);
    setError(null);
    setSending(true);
    try {
      await postReview(slug, token, { rating, title: title.trim(), body: body.trim() });
      onDone();
    } catch (err) {
      const code = err instanceof ApiError ? (err.status === 0 ? "network" : err.code) : "network";
      setError(REVIEW_ERRORS[code] ?? "Yorum gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>PUANINIZ</Text>
      <View style={styles.starPicker}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityLabel={`${n} yıldız`}>
            <Star size={30} color={colors.gold} fill={n <= rating ? colors.gold : "transparent"} strokeWidth={1.2} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>BAŞLIK (İSTEĞE BAĞLI)</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        maxLength={120}
        placeholder="Kısaca özetleyin"
        placeholderTextColor={colors.faint}
        style={styles.input}
      />

      <Text style={styles.label}>YORUMUNUZ</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        maxLength={2000}
        multiline
        textAlignVertical="top"
        placeholder="Ürünü nasıl buldunuz? Cildinizde nasıl bir etki bıraktı?"
        placeholderTextColor={colors.faint}
        style={[styles.input, styles.textarea]}
      />
      <Text style={styles.counter}>{body.length} / 2000</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.formButtons}>
        <Button label={initial ? "Güncelle" : "Gönder"} onPress={submit} loading={sending} />
        <Button label="Vazgeç" variant="outline" onPress={onCancel} disabled={sending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: space.lg, paddingTop: space.xxl, borderTopWidth: 1, borderTopColor: colors.border },
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3, color: colors.gold },
  title: { marginTop: space.sm, fontFamily: fonts.serifLight, fontSize: 34, lineHeight: 38, color: colors.ink },
  summary: { flexDirection: "row", gap: space.lg, marginTop: space.lg, padding: space.md, backgroundColor: colors.white },
  summaryLeft: { alignItems: "center", justifyContent: "center", gap: 4, minWidth: 96 },
  big: { fontFamily: fonts.serifLight, fontSize: 48, lineHeight: 52, color: colors.ink },
  count: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 2, textAlign: "center" },
  bars: { flex: 1, justifyContent: "center", gap: 6 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  barLabel: { width: 8, fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  barTrack: { flex: 1, height: 4, backgroundColor: "rgba(28,25,23,0.08)" },
  barFill: { height: 4, backgroundColor: colors.gold },
  barCount: { width: 22, textAlign: "right", fontFamily: fonts.sans, fontSize: 11, color: colors.faint },
  cta: { marginTop: space.lg },
  notice: { borderWidth: 1, borderColor: colors.border, padding: space.md, backgroundColor: "rgba(184,151,106,0.06)" },
  noticeRow: { flexDirection: "row", gap: space.sm + 2 },
  noticeText: { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted },
  list: { marginTop: space.lg },
  review: { paddingVertical: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { fontFamily: fonts.sans, fontSize: 11, color: colors.faint },
  reviewTitle: { marginTop: space.sm + 2, fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink },
  body: { marginTop: space.xs + 2, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: "rgba(28,25,23,0.72)" },
  author: { marginTop: space.sm + 4, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 6 },
  authorName: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink },
  verified: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontFamily: fonts.sans, fontSize: 11, color: colors.gold },
  form: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: space.md },
  label: { fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 2, color: colors.muted, marginBottom: space.sm },
  starPicker: { flexDirection: "row", gap: 6, marginBottom: space.lg },
  input: {
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.15)",
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    marginBottom: space.md,
  },
  textarea: { minHeight: 130, marginBottom: 4 },
  counter: { alignSelf: "flex-end", fontFamily: fonts.sans, fontSize: 11, color: colors.faint, marginBottom: space.md },
  error: { fontFamily: fonts.sans, fontSize: 12.5, color: "#dc2626", marginBottom: space.md },
  formButtons: { gap: space.sm },
});
