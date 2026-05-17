import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, CircleHelp, FileText, GraduationCap, HeartHandshake, Mail, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { href: "/becas", label: "Becas", icon: GraduationCap },
  { href: "/pasantias", label: "Pasantías", icon: BriefcaseBusiness },
  { href: "/recursos", label: "Recursos", icon: FileText },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/faq#bienestar", label: "Bienestar", icon: HeartHandshake },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/contacto", label: "Contacto", icon: Mail }
];

export function QuickAccess() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full shadow-sm transition hover:border-primary/40 hover:shadow-soft">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-utn-sky text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-utn-ink">{item.label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
