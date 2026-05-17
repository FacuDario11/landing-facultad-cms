import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import type { SiteSettings } from "@/types/content";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">UTN</div>
            <div>
              <p className="font-bold text-utn-ink">{settings.institutionName}</p>
              <p className="text-sm text-muted-foreground">Facultad Regional Tucumán</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Plataforma institucional de comunicación, acompañamiento y recursos para estudiantes de tecnicaturas e ingenierías.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-utn-ink">Secciones</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/noticias" className="hover:text-primary">Noticias</Link>
            <Link href="/becas" className="hover:text-primary">Becas</Link>
            <Link href="/pasantias" className="hover:text-primary">Pasantías</Link>
            <Link href="/recursos" className="hover:text-primary">Recursos</Link>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-utn-ink">Contacto</h2>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> {settings.email}</p>
            <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {settings.address}</p>
            <p className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 text-primary" /> {settings.officeHours}</p>
          </div>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="container text-xs text-muted-foreground">{settings.institutionName}. Plataforma institucional.</div>
      </div>
    </footer>
  );
}
