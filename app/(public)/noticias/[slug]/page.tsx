import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getNewsBySlug } from "@/services/content-service";

function prepareNewsHtml(html: string) {
  // Sanitización mínima para el HTML editorial de TipTap. Para producción con embeds
  // o usuarios no confiables, conviene reemplazar por una sanitización allowlist robusta.
  const allowedTags = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "h2", "h3", "blockquote", "a"]);

  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/\s+(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!allowedTags.has(tag)) return "";
      if (match.startsWith("</")) return `</${tag}>`;
      if (tag !== "a") return `<${tag}>`;

      const hrefMatch = String(rawAttrs).match(/\s+href\s*=\s*(['"])(.*?)\1/i);
      const href = hrefMatch?.[2]?.trim() ?? "";
      if (!href || /^javascript:/i.test(href)) return "<a>";
      const safeHref = href.replace(/"/g, "&quot;");
      return `<a href="${safeHref}" rel="noopener noreferrer">`;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      images: [item.imageUrl]
    }
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <article>
      <section className="institutional-band border-b">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">{item.category}</Badge>
            <span className="text-sm text-muted-foreground">{formatDate(item.publishedAt)}</span>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-inst-ink md:text-5xl">{item.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{item.excerpt}</p>
        </div>
      </section>
      <div className="container py-10">
        <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-lg border bg-muted shadow-soft">
          <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="prose-institutional mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: prepareNewsHtml(item.content) }} />
      </div>
    </article>
  );
}
