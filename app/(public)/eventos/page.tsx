import type { Metadata } from "next";
import { Search } from "lucide-react";
import { EventCard } from "@/components/content/event-card";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/services/content-service";

export const metadata: Metadata = { title: "Eventos" };

const categories = ["Todos", "Ingresantes", "Becas", "Pasantías", "Bienestar", "Académica", "Institucional"];

function categoryHref(category: string, q?: string) {
  const params = new URLSearchParams();
  if (category !== "Todos") params.set("category", category);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/eventos?${query}` : "/eventos";
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams;
  const selectedCategory = params.category ?? "Todos";
  const events = await getEvents({ category: selectedCategory, q: params.q });

  return (
    <>
      <PageHeading eyebrow="Agenda institucional" title="Eventos" description="Charlas, talleres, encuentros y actividades de orientación para la comunidad estudiantil." />
      <section className="container py-10">
        <form className="mb-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto]">
          {selectedCategory !== "Todos" ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={params.q} placeholder="Buscar eventos por nombre..." className="pl-9" />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button key={item} asChild variant={item === selectedCategory ? "default" : "outline"} size="sm">
              <a href={categoryHref(item, params.q)}>{item}</a>
            </Button>
          ))}
        </div>
        {events.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-inst-ink">Sin eventos próximos</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No hay actividades próximas para esta búsqueda o categoría. La agenda se actualizará cuando la institución confirme nuevas fechas.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
