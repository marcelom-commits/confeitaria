import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
