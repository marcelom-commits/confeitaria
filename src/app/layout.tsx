import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://confeitaria-et9l.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Doce Encanto | Confeitaria Artesanal",
    template: "%s | Doce Encanto",
  },
  description:
    "Bolos, doces finos e kits especiais feitos com ingredientes selecionados. Compre online e receba em casa.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Doce Encanto | Confeitaria Artesanal",
    description:
      "Bolos, doces finos e kits especiais feitos com ingredientes selecionados. Compre online e receba em casa.",
    url: siteUrl,
    siteName: "Doce Encanto",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doce Encanto | Confeitaria Artesanal",
    description:
      "Bolos, doces finos e kits especiais feitos com ingredientes selecionados. Compre online e receba em casa.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}