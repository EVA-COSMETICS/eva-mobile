import { Fragment, useMemo, type ReactNode } from "react";
import { Linking, StyleSheet, Text, View, type TextStyle } from "react-native";
import { colors, fonts, space } from "@/theme";

/*
  ZENGİN METİN GÖSTERİCİ
  Admin panelinde yazılan ürün açıklaması (HTML) sunucuda temizlenir ve yalnızca şu etiketler kalır:
  p, br, strong, em, u, s, h2, h3, ul, ol, li, blockquote, a
  Bu bileşen o sınırlı HTML'i ek paket kullanmadan React Native bileşenlerine çevirir.
*/

type Node = string | { tag: string; href?: string; children: Node[] };
type Element = Exclude<Node, string>;

const BLOCK_TAGS = new Set(["p", "h2", "h3", "ul", "ol", "li", "blockquote"]);
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

// HTML → basit ağaç
function parse(html: string): Node[] {
  const root: Element = { tag: "root", children: [] };
  const stack: Element[] = [root];
  const re = /<(\/)?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;

  for (const m of html.matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) {
      top.children.push(decode(m[4]));
      continue;
    }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      // kapanış etiketi: eşleşen açılışa kadar geri çık
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (tag === "br") {
      top.children.push("\n");
      continue;
    }
    const href = /href\s*=\s*"([^"]*)"/i.exec(m[3])?.[1];
    const el: Element = { tag, href: href ? decode(href) : undefined, children: [] };
    top.children.push(el);
    if (!m[3].trim().endsWith("/")) stack.push(el);
  }
  return root.children;
}

const isBlock = (n: Node) => typeof n !== "string" && BLOCK_TAGS.has(n.tag);

/* ------------------------------ Satır içi (kalın, italik, altı çizili, bağlantı) ------------------------------ */

const MARKS: Record<string, TextStyle> = {
  strong: { fontFamily: fonts.sansSemiBold, color: colors.ink },
  b: { fontFamily: fonts.sansSemiBold, color: colors.ink },
  em: { fontStyle: "italic" },
  i: { fontStyle: "italic" },
  u: { textDecorationLine: "underline", textDecorationColor: colors.gold },
  s: { textDecorationLine: "line-through" },
};

function renderInline(nodes: Node[], keyPrefix: string): ReactNode[] {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}.${i}`;
    if (typeof n === "string") return n;
    if (n.tag === "a" && n.href) {
      const href = n.href;
      return (
        <Text key={key} style={styles.link} onPress={() => Linking.openURL(href).catch(() => {})} accessibilityRole="link">
          {renderInline(n.children, key)}
        </Text>
      );
    }
    return (
      <Text key={key} style={MARKS[n.tag]}>
        {renderInline(n.children, key)}
      </Text>
    );
  });
}

/* ------------------------------ Bloklar (paragraf, başlık, liste, alıntı) ------------------------------ */

function renderBlocks(nodes: Node[], keyPrefix: string, textStyle?: TextStyle): ReactNode[] {
  const out: ReactNode[] = [];
  let inline: Node[] = [];

  // Blok dışında kalan düz metni paragraf olarak göster
  const flush = () => {
    const hasText = inline.some((n) => typeof n !== "string" || n.trim() !== "");
    if (hasText) {
      const key = `${keyPrefix}.t${out.length}`;
      out.push(
        <Text key={key} style={[styles.p, textStyle]}>
          {renderInline(inline, key)}
        </Text>
      );
    }
    inline = [];
  };

  nodes.forEach((n, i) => {
    if (!isBlock(n)) {
      inline.push(n);
      return;
    }
    flush();
    const el = n as Element;
    const key = `${keyPrefix}.${i}`;

    switch (el.tag) {
      case "p":
        out.push(
          <Text key={key} style={[styles.p, textStyle]}>
            {renderInline(el.children, key)}
          </Text>
        );
        break;
      case "h2":
        out.push(
          <Text key={key} style={styles.h2}>
            {renderInline(el.children, key)}
          </Text>
        );
        break;
      case "h3":
        out.push(
          <Text key={key} style={styles.h3}>
            {renderInline(el.children, key).map((c, ci) =>
              typeof c === "string" ? c.toLocaleUpperCase("tr") : <Fragment key={ci}>{c}</Fragment>
            )}
          </Text>
        );
        break;
      case "blockquote":
        out.push(
          <View key={key} style={styles.quote}>
            {renderBlocks(el.children, key, styles.quoteText)}
          </View>
        );
        break;
      case "ul":
      case "ol": {
        const items = el.children.filter((c): c is Element => typeof c !== "string" && c.tag === "li");
        out.push(
          <View key={key} style={styles.list}>
            {items.map((li, li_i) => (
              <View key={`${key}.${li_i}`} style={styles.li}>
                <Text style={[styles.marker, el.tag === "ol" && styles.number]}>{el.tag === "ol" ? `${li_i + 1}.` : "•"}</Text>
                <View style={styles.liBody}>{renderBlocks(li.children, `${key}.${li_i}`, styles.liText)}</View>
              </View>
            ))}
          </View>
        );
        break;
      }
      default:
        out.push(...renderBlocks(el.children, key, textStyle));
    }
  });

  flush();
  return out;
}

export default function RichText({ html }: { html: string }) {
  const content = useMemo(() => renderBlocks(parse(html), "rt"), [html]);
  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  p: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 25, color: "rgba(28,25,23,0.75)" },
  h2: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.ink, marginTop: space.sm },
  h3: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 2, color: colors.ink, marginTop: space.sm },
  link: { color: colors.ink, textDecorationLine: "underline", textDecorationColor: colors.gold },
  list: { gap: space.sm },
  li: { flexDirection: "row", gap: space.sm + 2 },
  marker: { width: 14, fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 25, color: colors.gold },
  number: { width: 20, fontSize: 13 },
  liBody: { flex: 1, gap: space.xs },
  liText: { lineHeight: 25 },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: space.md, paddingVertical: space.xs, gap: space.sm },
  quoteText: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 27, fontStyle: "italic", color: colors.ink },
});
