import EmptyState from "@/components/EmptyState";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { Heart } from "lucide-react-native";

export default function FavoritesScreen() {
  return (
    <Screen>
      <ScreenHeader eyebrow="Listem" title="Favoriler" />
      <EmptyState
        icon={Heart}
        title="Henüz favoriniz yok"
        text="Beğendiğiniz ürünlerdeki kalbe dokunun. Üye olmadan da telefonunuzda saklanır."
      />
    </Screen>
  );
}