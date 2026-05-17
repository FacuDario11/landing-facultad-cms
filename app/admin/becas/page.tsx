import Link from "next/link";
import { changeScholarshipStatusAction, createScholarshipAction, updateScholarshipAction } from "@/app/admin/becas/actions";
import { ScholarshipForm } from "@/components/admin/scholarship-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getAdminScholarships } from "@/services/content-service";
import type { Scholarship } from "@/types/content";

export const dynamic = "force-dynamic";

function statusVariant(status: Scholarship["status"]) {
  if (status === "abierta") return "success" as const;
  if (status === "proxima") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminScholarshipsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const scholarshipItems = await getAdminScholarships();
  const editingScholarship = params.edit ? scholarshipItems.find((item) => item.id === params.edit) : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-inst-ink">Becas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Módulo conectado a Supabase para crear, editar, publicar y cerrar convocatorias de becas.</p>
      </div>
      <div className="grid gap-3">
        {editingScholarship ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-inst-sky p-3">
            <p className="text-sm font-medium text-inst-ink">Editando: {editingScholarship.title}</p>
            <Button asChild variant="outline" size="sm"><Link href="/admin/becas">Cancelar edición</Link></Button>
          </div>
        ) : null}
        <ScholarshipForm key={editingScholarship?.id ?? "create"} action={editingScholarship ? updateScholarshipAction : createScholarshipAction} initialData={editingScholarship} />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {scholarshipItems.length > 0 ? scholarshipItems.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-inst-ink">{item.title}</p>
                  <Badge variant={statusVariant(item.status)} className="capitalize">{item.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.slug}</p>
                <p className="mt-1 text-xs text-muted-foreground">Vence: {formatDate(item.deadline)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><Link href={`/admin/becas?edit=${item.id}`}>Editar</Link></Button>
                {item.status !== "abierta" ? (
                  <form action={changeScholarshipStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="abierta" />
                    <Button type="submit" variant="outline" size="sm">Publicar</Button>
                  </form>
                ) : (
                  <form action={changeScholarshipStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="proxima" />
                    <Button type="submit" variant="outline" size="sm">Pasar a próxima</Button>
                  </form>
                )}
                {item.status !== "cerrada" ? (
                  <form action={changeScholarshipStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="cerrada" />
                    <Button type="submit" variant="outline" size="sm">Cerrar</Button>
                  </form>
                ) : null}
              </div>
            </div>
          )) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No hay becas cargadas todavía. Creá la primera convocatoria desde el formulario superior.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
