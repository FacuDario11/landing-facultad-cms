import type { Metadata } from "next";
import { CalendarDays, CheckCircle2, FileText } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getScholarships } from "@/services/content-service";

export const metadata: Metadata = { title: "Becas" };

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships();
  return (
    <>
      <PageHeading eyebrow="Apoyo estudiantil" title="Becas" description="Convocatorias, requisitos, documentación y fechas importantes para programas de apoyo económico y permanencia." />
      <section className="container grid gap-5 py-10">
        {scholarships.length > 0 ? scholarships.map((item) => (
          <Card key={item.id} className="shadow-soft">
            <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <Badge variant={item.status === "abierta" ? "success" : "warning"} className="capitalize">{item.status}</Badge>
                <h2 className="mt-3 text-xl font-semibold text-inst-ink">{item.title}</h2>
                <p className="mt-2 leading-7 text-muted-foreground">{item.summary}</p>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Vence: {formatDate(item.deadline)}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-primary" /> Requisitos</h3>
                  <ul className="grid gap-1 text-sm text-muted-foreground">{item.requirements.map((req) => <li key={req}>{req}</li>)}</ul>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Documentación</h3>
                  <ul className="grid gap-1 text-sm text-muted-foreground">{item.documents.map((doc) => <li key={doc}>{doc}</li>)}</ul>
                </div>
                <Button asChild className="w-fit"><a href={item.link}>Consultar convocatoria</a></Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-inst-ink">Sin becas activas</h2>
              <p className="mt-2 text-sm text-muted-foreground">No hay convocatorias de becas abiertas o próximas por el momento.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
