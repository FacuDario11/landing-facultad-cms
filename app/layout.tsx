import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Consejería Estudiantil UTN FRT",
    template: "%s | Consejería Estudiantil UTN FRT"
  },
  description: "Plataforma institucional de comunicación, noticias, becas, pasantías, eventos y recursos para estudiantes de UTN Facultad Regional Tucumán.",
  openGraph: {
    title: "Consejería Estudiantil UTN FRT",
    description: "Comunicación y acompañamiento estudiantil de la Facultad Regional Tucumán.",
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
