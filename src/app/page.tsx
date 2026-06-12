import TopBar from "@/components/feed/TopBar";
import FeedView from "@/components/feed/FeedView";
import BottomNav from "@/components/feed/BottomNav";

export default function FeedHomePage() {
  return (
    <div className="min-h-dvh bg-page">
      <TopBar />
      <main className="pb-24">
        <FeedView />
      </main>
      <BottomNav />
    </div>
  );
}
