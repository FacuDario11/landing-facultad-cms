import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Portal Estudiantil Institucional",
    template: "%s | Portal Estudiantil Institucional"
  },
  description: "Demo institucional para centralizar novedades, eventos, becas, pasantías, recursos y canales de contacto para la comunidad estudiantil.",
  openGraph: {
    title: "Portal Estudiantil Institucional",
    description: "Información académica y acompañamiento estudiantil en un solo lugar.",
    type: "website",
    locale: "es_AR",
    url: absoluteUrl()
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
