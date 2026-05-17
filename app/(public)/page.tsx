import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, FileText, GraduationCap, Newspaper } from "lucide-react";
import { EventCard } from "@/components/content/event-card";
import { NewsCard } from "@/components/content/news-card";
import { QuickAccess } from "@/components/content/quick-access";
import { FadeIn } from "@/components/motion/fade-in";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEvents, getFaqs, getFeaturedNews, getInternships, getScholarships } from "@/services/content-service";

const ctas = [
  { href: "/noticias", label: "Ver novedades", icon: Newspaper },
  { href: "/becas", label: "Becas", icon: GraduationCap },
  { href: "/pasantias", label: "Pasantías", icon: BriefcaseBusiness },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/contacto", label: "Contactar al área", icon: FileText }
];

export default async function HomePage() {
  const [featuredNews, eventItems, scholarshipItems, internshipItems, faqItems] = await Promise.all([
    getFeaturedNews(),
    getEvents(),
    getScholarships(),
    getInternships(),
    getFaqs()
  ]);
  const upcomingEvents = eventItems.slice(0, 3);

  return (
    <>
      <section className="institutional-band border-b">
        <div className="container grid gap-10 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
          <FadeIn>
            <Badge variant="secondary" className="mb-4">Facultad / Institución educativa</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-inst-ink md:text-6xl">
              Información académica y acompañamiento estudiantil en un solo lugar
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Un portal institucional pensado para centralizar novedades, eventos, becas, pasantías, recursos y canales de contacto para la comunidad estudiantil.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {ctas.map((cta) => (
                <Button key={cta.href} asChild variant={cta.href === "/noticias" ? "default" : "outline"}>
                  <Link href={cta.href}>
                    <cta.icon className="h-4 w-4" />
                    {cta.label}
                  </Link>
                </Button>
              ))}
            </div>
          </FadeIn>
          <FadeIn className="relative min-h-72 overflow-hidden rounded-lg border bg-card shadow-soft md:min-h-[430px]">
            <Image
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80"
              alt="Edificio universitario moderno"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-inst-ink/78 to-transparent p-5 text-white">
              <p className="text-sm font-semibold">Comunicación clara para estudiantes</p>
              <p className="mt-1 text-sm text-white/85">Un espacio digital para acompañar a estudiantes durante su vida académica.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Actualidad</p>
            <h2 className="mt-2 text-2xl font-bold text-inst-ink md:text-3xl">Noticias destacadas</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/noticias">Ver todas <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredNews.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="border-y bg-slate-50 py-12">
        <div className="container">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Accesos rápidos</p>
            <h2 className="mt-2 text-2xl font-bold text-inst-ink md:text-3xl">Encontrá información institucional</h2>
          </div>
          <QuickAccess />
        </div>
      </section>

      <section className="container grid gap-8 py-12 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Agenda</p>
            <h2 className="mt-2 text-2xl font-bold text-inst-ink md:text-3xl">Próximos eventos</h2>
          </div>
          <div className="grid gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-inst-ink">Sin eventos próximos</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">No hay próximos eventos publicados por el momento.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Oportunidades</p>
            <h2 className="mt-2 text-2xl font-bold text-inst-ink md:text-3xl">Becas, pasantías y convocatorias</h2>
          </div>
          <div className="grid gap-4">
            {[...scholarshipItems, ...internshipItems].slice(0, 4).map((item) => {
              const type = "company" in item ? "Pasantía" : "Beca";

              return (
              <Card key={`${type}-${item.id}`} className="shadow-sm">
                <CardContent className="p-5">
                  <Badge variant={"company" in item ? "outline" : "success"}>{type}</Badge>
                  <h3 className="mt-3 font-semibold text-inst-ink">{"company" in item ? item.title : item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{"company" in item ? item.company : item.summary}</p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t bg-slate-50 py-12">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Consultas frecuentes</p>
            <h2 className="mt-2 text-2xl font-bold text-inst-ink md:text-3xl">FAQ</h2>
            <p className="mt-3 text-muted-foreground">Respuestas rápidas para trámites, becas, pasantías, recursos y acompañamiento estudiantil.</p>
          </div>
          <Accordion type="single" collapsible className="rounded-lg border bg-background px-5">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
