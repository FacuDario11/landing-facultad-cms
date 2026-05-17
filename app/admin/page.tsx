import Link from "next/link";
import { Activity, CalendarDays, FileText, Newspaper, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { news, events, resources } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Noticias", value: news.length, icon: Newspaper },
    { label: "Eventos", value: events.length, icon: CalendarDays },
    { label: "Recursos", value: resources.length, icon: FileText },
    { label: "Usuarios orientativos", value: 3, icon: Users }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-inst-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vista preliminar de publicaciones, actividad y accesos rápidos del panel institucional.</p>
        </div>
        <Button asChild><Link href="/admin/noticias">Preparar publicación</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-inst-ink">{stat.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-inst-sky text-primary"><stat.icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Últimas publicaciones orientativas</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {news.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-inst-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.publishedAt)}</p>
                </div>
                <Badge variant={item.featured ? "success" : "secondary"}>{item.featured ? "Destacada" : "Publicada"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Actividad preliminar</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {["Publicación preparada", "Recurso pendiente de archivo", "Evento cargado como ejemplo"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary"><Activity className="h-4 w-4" /></div>
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
