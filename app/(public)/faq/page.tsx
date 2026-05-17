import type { Metadata } from "next";
import { PageHeading } from "@/components/layout/page-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getFaqs } from "@/services/content-service";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHeading eyebrow="Orientación" title="Preguntas frecuentes" description="Información clara sobre trámites, becas, pasantías, acompañamiento y canales de atención." />
      <section id="bienestar" className="container py-10">
        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="rounded-lg border bg-card px-5 shadow-soft">
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger><span><Badge variant="secondary" className="mr-2">{item.category}</Badge>{item.question}</span></AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground">
            No hay preguntas frecuentes publicadas por el momento.
          </div>
        )}
      </section>
    </>
  );
}
