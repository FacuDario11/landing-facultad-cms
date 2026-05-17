import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types/content";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Card className="group overflow-hidden shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image src={item.imageUrl} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">{item.category}</Badge>
          <span className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</span>
        </div>
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-utn-ink">{item.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
        <Link href={`/noticias/${item.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Leer más <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
