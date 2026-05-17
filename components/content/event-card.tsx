import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { EventItem } from "@/types/content";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Card className="overflow-hidden shadow-soft">
      {event.imageUrl ? (
        <div className="relative aspect-[16/9] bg-muted">
          <Image src={event.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : null}
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Badge variant="outline">{event.category}</Badge>
          <Badge variant="secondary" className="capitalize">{event.modality}</Badge>
        </div>
        <h2 className="text-lg font-semibold text-inst-ink">{event.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {formatDate(event.date, "d MMM yyyy, HH:mm")}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</p>
        </div>
      </CardContent>
    </Card>
  );
}
