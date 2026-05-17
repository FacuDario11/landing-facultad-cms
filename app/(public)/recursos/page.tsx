import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getResources } from "@/services/content-service";

export const metadata: Metadata = { title: "Recursos" };

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <>
      <PageHeading eyebrow="Documentación" title="Recursos" description="Descargas, formularios, reglamentos y guías útiles para trámites y vida académica." />
      <section className="container grid gap-5 py-10 md:grid-cols-2 lg:grid-cols-3">
        {resources.length > 0 ? resources.map((item) => {
          const hasFile = item.fileUrl && item.fileUrl !== "#";

          return (
            <Card key={item.id} className="shadow-soft">
              <CardContent className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-inst-sky text-primary"><FileText className="h-5 w-5" /></div>
                <Badge variant="secondary" className="mt-4 capitalize">{item.type}</Badge>
                <h2 className="mt-3 text-lg font-semibold text-inst-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <p className="mt-4 text-xs text-muted-foreground">Actualizado: {formatDate(item.updatedAt)}</p>
                {hasFile ? (
                  <Button asChild variant="outline" className="mt-4">
                    <a href={item.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Descargar</a>
                  </Button>
                ) : (
                  <div className="mt-4">
                    <Button variant="outline" disabled><Download className="h-4 w-4" /> Disponible próximamente</Button>
                    <p className="mt-2 text-xs text-muted-foreground">Archivo pendiente de carga institucional.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            No hay recursos publicados por el momento.
          </div>
        )}
      </section>
    </>
  );
}
