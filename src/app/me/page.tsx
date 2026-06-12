import MeView from "@/components/me/MeView";
import BottomNav from "@/components/feed/BottomNav";

export const metadata = {
  title: "我的 · FameScope",
};

export default function MePage() {
  return (
    <div className="min-h-dvh bg-page">
      <main className="pb-24">
        <MeView />
      </main>
      <BottomNav />
    </div>
  );
}
