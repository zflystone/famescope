import TopBar from "@/components/feed/TopBar";
import BottomNav from "@/components/feed/BottomNav";
import DigestView from "@/components/digest/DigestView";

export const metadata = { title: "每日简报 · FameScope" };

export default function DigestPage() {
  return (
    <div className="min-h-dvh bg-page">
      <TopBar />
      <main>
        <DigestView />
      </main>
      <BottomNav />
    </div>
  );
}
