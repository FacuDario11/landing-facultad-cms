import type { Metadata } from "next";
import { BriefcaseBusiness, CalendarDays } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getInternships } from "@/services/content-service";

export const metadata: Metadata = { title: "Pasantías" };

export default async function InternshipsPage() {
  const internships = await getInternships();
  return (
    <>
      <PageHeading eyebrow="Vinculación laboral" title="Pasantías" description="Oportunidades para estudiantes que buscan primeras experiencias profesionales, prácticas y vinculación con empresas." />
      <section className="container grid gap-5 py-10 md:grid-cols-2">
        {internships.length > 0 ? internships.map((item) => (
          <Card key={item.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline">{item.career}</Badge>
                <Badge variant="secondary" className="capitalize">{item.modality}</Badge>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-inst-ink">{item.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><BriefcaseBusiness className="h-4 w-4 text-primary" /> {item.company}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Vence: {formatDate(item.deadline)}</p>
              <h3 className="mt-4 text-sm font-semibold">Requisitos</h3>
              <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">{item.requirements.map((req) => <li key={req}>{req}</li>)}</ul>
            </CardContent>
          </Card>
        )) : (
          <Card className="shadow-sm md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-inst-ink">Sin pasantías activas</h2>
              <p className="mt-2 text-sm text-muted-foreground">No hay convocatorias de pasantías publicadas y vigentes por el momento.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
