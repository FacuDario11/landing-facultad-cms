import Link from "next/link";
import { changeResourceStatusAction, createResourceAction, updateResourceAction } from "@/app/admin/recursos/actions";
import { ResourceForm } from "@/components/admin/resource-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getAdminResources } from "@/services/content-service";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

function statusLabel(status?: ContentStatus) {
  if (status === "published") return "Publicado";
  if (status === "archived") return "Archivado";
  if (status === "scheduled") return "Programado";
  return "Borrador";
}

function statusVariant(status?: ContentStatus) {
  if (status === "published") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminResourcesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const resourceItems = await getAdminResources();
  const editingResource = params.edit ? resourceItems.find((item) => item.id === params.edit) : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-utn-ink">Recursos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Módulo conectado a Supabase para crear, editar, publicar y archivar recursos institucionales.</p>
      </div>
      <div className="grid gap-3">
        {editingResource ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-utn-sky p-3">
            <p className="text-sm font-medium text-utn-ink">Editando: {editingResource.title}</p>
            <Button asChild variant="outline" size="sm"><Link href="/admin/recursos">Cancelar edición</Link></Button>
          </div>
        ) : null}
        <ResourceForm key={editingResource?.id ?? "create"} action={editingResource ? updateResourceAction : createResourceAction} initialData={editingResource} />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {resourceItems.length > 0 ? resourceItems.map((item) => {
            const hasFile = Boolean(item.fileUrl && item.fileUrl !== "#");

            return (
              <div key={item.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-utn-ink">{item.title}</p>
                    <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    <Badge variant="outline" className="capitalize">{item.type}</Badge>
                    <Badge variant={hasFile ? "success" : "secondary"}>{hasFile ? "Con archivo" : "Sin archivo"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Actualizado: {formatDate(item.updatedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasFile ? <Button asChild variant="outline" size="sm"><a href={item.fileUrl} target="_blank" rel="noreferrer">Abrir archivo</a></Button> : null}
                  <Button asChild variant="outline" size="sm"><Link href={`/admin/recursos?edit=${item.id}`}>Editar</Link></Button>
                  {item.status !== "published" ? (
                    <form action={changeResourceStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="published" />
                      <Button type="submit" variant="outline" size="sm">Publicar</Button>
                    </form>
                  ) : (
                    <form action={changeResourceStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="draft" />
                      <Button type="submit" variant="outline" size="sm">Pasar a borrador</Button>
                    </form>
                  )}
                  {item.status !== "archived" ? (
                    <form action={changeResourceStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="archived" />
                      <Button type="submit" variant="outline" size="sm">Archivar</Button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          }) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No hay recursos cargados todavía. Creá el primer documento institucional desde el formulario superior.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
