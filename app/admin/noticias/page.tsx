import Link from "next/link";
import { createNewsAction, changeNewsStatusAction, updateNewsAction } from "@/app/admin/noticias/actions";
import { ContentForm } from "@/components/admin/content-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getAdminNews } from "@/services/content-service";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

function statusLabel(status: ContentStatus) {
  if (status === "published") return "Publicada";
  if (status === "archived") return "Archivada";
  if (status === "scheduled") return "Programada";
  return "Borrador";
}

function statusVariant(status: ContentStatus) {
  if (status === "published") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const newsItems = await getAdminNews();
  const editingNews = params.edit ? newsItems.find((item) => item.id === params.edit) : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-utn-ink">Noticias</h1>
        <p className="mt-1 text-sm text-muted-foreground">Módulo piloto conectado a Supabase para crear, editar, publicar y archivar noticias.</p>
      </div>
      <div className="grid gap-3">
        {editingNews ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-utn-sky p-3">
            <p className="text-sm font-medium text-utn-ink">Editando: {editingNews.title}</p>
            <Button asChild variant="outline" size="sm"><Link href="/admin/noticias">Cancelar edición</Link></Button>
          </div>
        ) : null}
        <ContentForm key={editingNews?.id ?? "create"} type="noticia" action={editingNews ? updateNewsAction : createNewsAction} initialData={editingNews} />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {newsItems.length > 0 ? newsItems.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-utn-ink">{item.title}</p>
                  <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                  {item.featured ? <Badge variant="outline">Destacada</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{item.slug}</p>
                <p className="mt-1 text-xs text-muted-foreground">Publicación: {item.publishedAt ? formatDate(item.publishedAt) : "Sin fecha publicada"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><Link href={`/admin/noticias?edit=${item.id}`}>Editar</Link></Button>
                {item.status !== "published" ? (
                  <form action={changeNewsStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="published" />
                    <Button type="submit" variant="outline" size="sm">Publicar</Button>
                  </form>
                ) : (
                  <form action={changeNewsStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="draft" />
                    <Button type="submit" variant="outline" size="sm">Pasar a borrador</Button>
                  </form>
                )}
                {item.status !== "archived" ? (
                  <form action={changeNewsStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="archived" />
                    <Button type="submit" variant="outline" size="sm">Archivar</Button>
                  </form>
                ) : null}
              </div>
            </div>
          )) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No hay noticias cargadas todavía. Creá la primera noticia desde el formulario superior.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
