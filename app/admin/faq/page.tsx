import Link from "next/link";
import { changeFaqPublishedAction, createFaqAction, updateFaqAction } from "@/app/admin/faq/actions";
import { FaqForm } from "@/components/admin/faq-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminFaqs } from "@/services/content-service";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const faqItems = await getAdminFaqs();
  const editingFaq = params.edit ? faqItems.find((item) => item.id === params.edit) : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-utn-ink">FAQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">Modulo conectado a Supabase para crear, editar y publicar preguntas frecuentes institucionales.</p>
      </div>
      <div className="grid gap-3">
        {editingFaq ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-utn-sky p-3">
            <p className="text-sm font-medium text-utn-ink">Editando: {editingFaq.question}</p>
            <Button asChild variant="outline" size="sm"><Link href="/admin/faq">Cancelar edicion</Link></Button>
          </div>
        ) : null}
        <FaqForm key={editingFaq?.id ?? "create"} action={editingFaq ? updateFaqAction : createFaqAction} initialData={editingFaq} />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {faqItems.length > 0 ? faqItems.map((item) => {
            const published = item.published ?? true;

            return (
              <div key={item.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-utn-ink">{item.question}</p>
                    <Badge variant={published ? "success" : "secondary"}>{published ? "Publicada" : "Inactiva"}</Badge>
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="secondary">Orden {item.sortOrder ?? 0}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={`/admin/faq?edit=${item.id}`}>Editar</Link></Button>
                  <form action={changeFaqPublishedAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="published" value={String(!published)} />
                    <Button type="submit" variant="outline" size="sm">{published ? "Pasar a inactiva" : "Publicar"}</Button>
                  </form>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No hay preguntas frecuentes cargadas todavia. Crea la primera FAQ desde el formulario superior.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
