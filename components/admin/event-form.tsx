"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarClock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { ContentStatus, EventItem } from "@/types/content";

type EventFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "description" | "startsAt" | "location" | "modality" | "category" | "status" | "image", string>>;
};

type EventFormProps = {
  action: (previousState: EventFormState, formData: FormData) => Promise<EventFormState>;
  initialData?: EventItem;
};

const initialState: EventFormState = { ok: false, message: "" };
const statuses: ContentStatus[] = ["draft", "published", "archived"];
const modalities: EventItem["modality"][] = ["presencial", "virtual", "hibrida"];
const categories = ["Ingresantes", "Becas", "Pasantías", "Bienestar", "Académica", "Institucional"];

function toDateTimeInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function EventForm({ action, initialData }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const createStatusRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!state.ok || isEditing) return;

    setTitle("");
    setSlug("");
    setSlugTouched(false);
    formRef.current?.reset();
    if (createStatusRef.current) createStatusRef.current.value = "draft";
  }, [isEditing, state.ok]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="grid gap-5">
          <input type="hidden" name="id" value={initialData?.id ?? ""} />
          {!isEditing ? <input ref={createStatusRef} type="hidden" name="status" defaultValue="draft" /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Título</Label>
              <Input id="event-title" name="title" value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="Título del evento" aria-invalid={Boolean(state.errors?.title)} />
              {state.errors?.title ? <p className="text-sm text-destructive">{state.errors.title}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-slug">Slug</Label>
              <Input
                id="event-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="titulo-del-evento"
                aria-invalid={Boolean(state.errors?.slug)}
              />
              {state.errors?.slug ? <p className="text-sm text-destructive">{state.errors.slug}</p> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-description">Descripción</Label>
            <Textarea id="event-description" name="description" defaultValue={initialData?.description ?? ""} placeholder="Descripción breve para agenda y listados." aria-invalid={Boolean(state.errors?.description)} />
            {state.errors?.description ? <p className="text-sm text-destructive">{state.errors.description}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-content">Contenido ampliado</Label>
            <Textarea id="event-content" name="content" defaultValue={initialData?.content ?? ""} placeholder="Información adicional opcional para el evento." />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="event-starts-at">Fecha y hora</Label>
              <Input id="event-starts-at" name="startsAt" type="datetime-local" defaultValue={toDateTimeInputValue(initialData?.date)} aria-invalid={Boolean(state.errors?.startsAt)} />
              {state.errors?.startsAt ? <p className="text-sm text-destructive">{state.errors.startsAt}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Lugar o canal</Label>
              <Input id="event-location" name="location" defaultValue={initialData?.location ?? ""} placeholder="Aula, oficina o enlace" aria-invalid={Boolean(state.errors?.location)} />
              {state.errors?.location ? <p className="text-sm text-destructive">{state.errors.location}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-category">Categoría</Label>
              <select id="event-category" name="category" defaultValue={initialData?.category ?? "Ingresantes"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.category)}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              {state.errors?.category ? <p className="text-sm text-destructive">{state.errors.category}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="event-modality">Modalidad</Label>
              <select id="event-modality" name="modality" defaultValue={initialData?.modality ?? "presencial"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.modality)}>
                {modalities.map((modality) => <option key={modality} value={modality}>{modality}</option>)}
              </select>
              {state.errors?.modality ? <p className="text-sm text-destructive">{state.errors.modality}</p> : null}
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="event-status">Estado</Label>
                <select id="event-status" name="status" defaultValue={initialData?.status ?? "draft"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.status)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {state.errors?.status ? <p className="text-sm text-destructive">{state.errors.status}</p> : null}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="event-image">Imagen</Label>
              <Input id="event-image" name="image" type="file" accept="image/*" aria-invalid={Boolean(state.errors?.image)} />
              <p className="text-xs text-muted-foreground">Opcional. Se sube al bucket events.</p>
              {state.errors?.image ? <p className="text-sm text-destructive">{state.errors.image}</p> : null}
            </div>
          </div>

          {state.message ? (
            <p className={`rounded-md border p-3 text-sm ${state.ok ? "border-primary/20 bg-inst-sky text-inst-ink" : "border-destructive/20 bg-destructive/10 text-destructive"}`} role="status">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            {isEditing ? (
              <Button type="submit" disabled={pending}><Save className="h-4 w-4" /> Guardar cambios</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  type="submit"
                  name="intent"
                  value="draft"
                  disabled={pending}
                  onClick={() => {
                    if (createStatusRef.current) createStatusRef.current.value = "draft";
                  }}
                >
                  <CalendarClock className="h-4 w-4" /> Guardar borrador
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="publish"
                  disabled={pending}
                  onClick={() => {
                    if (createStatusRef.current) createStatusRef.current.value = "published";
                  }}
                >
                  <Save className="h-4 w-4" /> Publicar evento
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
