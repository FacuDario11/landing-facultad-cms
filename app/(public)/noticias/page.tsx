import type { Metadata } from "next";
import { Search } from "lucide-react";
import { NewsCard } from "@/components/content/news-card";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNews } from "@/services/content-service";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Noticias institucionales, comunicados, becas, pasantías y novedades de la Consejería Estudiantil UTN FRT."
};

const categories = [
  { label: "Todos", value: "Todos" },
  { label: "Institucional", value: "institucional" },
  { label: "Becas", value: "becas" },
  { label: "Pasantías", value: "pasantias" },
  { label: "Bienestar", value: "bienestar" },
  { label: "Académica", value: "academica" },
  { label: "Eventos", value: "eventos" }
];

function categoryHref(category: string, q?: string) {
  const params = new URLSearchParams();
  if (category !== "Todos") params.set("category", category);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/noticias?${query}` : "/noticias";
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await getNews({ q: params.q, category: params.category, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      <PageHeading eyebrow="Comunicación estudiantil" title="Noticias" description="Comunicados oficiales, novedades académicas, oportunidades y actividades relevantes para la comunidad estudiantil." />
      <section className="container py-10">
        <form className="mb-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={params.q} placeholder="Buscar noticias..." className="pl-9" />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button key={category.value} asChild variant={category.value === (params.category ?? "Todos") ? "default" : "outline"} size="sm">
              <a href={categoryHref(category.value, params.q)}>{category.label}</a>
            </Button>
          ))}
        </div>
        {result.items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-utn-ink">Sin noticias publicadas</h2>
              <p className="mt-2 text-sm text-muted-foreground">No hay noticias publicadas para esta búsqueda o categoría.</p>
            </CardContent>
          </Card>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild variant="outline" disabled={page <= 1}>
            <a href={`/noticias?page=${Math.max(1, page - 1)}`}>Anterior</a>
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <a href={`/noticias?page=${Math.min(totalPages, page + 1)}`}>Siguiente</a>
          </Button>
        </div>
      </section>
    </>
  );
}
