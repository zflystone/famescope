import TopBar from "@/components/feed/TopBar";
import BottomNav from "@/components/feed/BottomNav";
import DiscoverView from "@/components/discover/DiscoverView";

export const metadata = { title: "发现 · FameScope" };

export default function DiscoverPage() {
  return (
    <div className="min-h-dvh bg-page">
      <TopBar />
      <main>
        <DiscoverView />
      </main>
      <BottomNav />
    </div>
  );
}
