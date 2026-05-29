import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { WhatsAppButton } from "@/components/store/whatsapp-button";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
