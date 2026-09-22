import EmptyState from "@/components/EmptyState";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { LayoutGrid } from "lucide-react-native";

export default function CategoriesScreen() {
  return (
    <Screen>
      <ScreenHeader eyebrow="Keşfet" title="Kategoriler" />
      <EmptyState
        icon={LayoutGrid}
        title="Kategoriler hazırlanıyor"
        text="Admin panelinde oluşturduğunuz kategoriler bir sonraki adımda burada listelenecek."
      />
    </Screen>
  );
}