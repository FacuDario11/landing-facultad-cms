import type { Metadata } from "next";
import { Clock, Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/content/contact-form";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/services/content-service";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();
  const items = [
    { icon: Mail, label: "Correo", value: siteSettings.email },
    { icon: MapPin, label: "Dirección", value: siteSettings.address },
    { icon: Clock, label: "Horarios", value: siteSettings.officeHours },
    { icon: Instagram, label: "Instagram", value: siteSettings.instagram },
    { icon: Facebook, label: "Facebook", value: siteSettings.facebook }
  ].filter((item) => item.value);

  return (
    <>
      <PageHeading eyebrow="Atención institucional" title="Contacto" description="Canales oficiales para consultas, orientación, trámites y acompañamiento estudiantil." />
      <section className="container grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.label} className="shadow-sm">
              <CardContent className="flex gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-inst-sky text-primary"><item.icon className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-semibold text-inst-ink">{item.label}</h2>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ContactForm />
      </section>
    </>
  );
}
