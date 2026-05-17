"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarClock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { Scholarship } from "@/types/content";

type ScholarshipFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "summary" | "requirements" | "documents" | "deadline" | "status", string>>;
};

type ScholarshipFormProps = {
  action: (previousState: ScholarshipFormState, formData: FormData) => Promise<ScholarshipFormState>;
  initialData?: Scholarship;
};

const initialState: ScholarshipFormState = { ok: false, message: "" };
const statuses: Scholarship["status"][] = ["abierta", "proxima", "cerrada"];

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ScholarshipForm({ action, initialData }: ScholarshipFormProps) {
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
    if (createStatusRef.current) createStatusRef.current.value = "proxima";
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
          {!isEditing ? <input ref={createStatusRef} type="hidden" name="status" defaultValue="proxima" /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="scholarship-title">Título</Label>
              <Input id="scholarship-title" name="title" value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="Título de la beca" aria-invalid={Boolean(state.errors?.title)} />
              {state.errors?.title ? <p className="text-sm text-destructive">{state.errors.title}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scholarship-slug">Slug</Label>
              <Input
                id="scholarship-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="titulo-de-la-beca"
                aria-invalid={Boolean(state.errors?.slug)}
              />
              {state.errors?.slug ? <p className="text-sm text-destructive">{state.errors.slug}</p> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scholarship-summary">Resumen</Label>
            <Textarea id="scholarship-summary" name="summary" defaultValue={initialData?.summary ?? ""} placeholder="Resumen breve de la convocatoria." aria-invalid={Boolean(state.errors?.summary)} />
            {state.errors?.summary ? <p className="text-sm text-destructive">{state.errors.summary}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="scholarship-requirements">Requisitos</Label>
              <Textarea id="scholarship-requirements" name="requirements" defaultValue={initialData?.requirements.join("\n") ?? ""} placeholder="Un requisito por línea" aria-invalid={Boolean(state.errors?.requirements)} />
              {state.errors?.requirements ? <p className="text-sm text-destructive">{state.errors.requirements}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scholarship-documents">Documentación</Label>
              <Textarea id="scholarship-documents" name="documents" defaultValue={initialData?.documents.join("\n") ?? ""} placeholder="Un documento por línea" aria-invalid={Boolean(state.errors?.documents)} />
              {state.errors?.documents ? <p className="text-sm text-destructive">{state.errors.documents}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="scholarship-deadline">Fecha límite</Label>
              <Input id="scholarship-deadline" name="deadline" type="date" defaultValue={toDateInputValue(initialData?.deadline)} aria-invalid={Boolean(state.errors?.deadline)} />
              {state.errors?.deadline ? <p className="text-sm text-destructive">{state.errors.deadline}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scholarship-url">Link externo</Label>
              <Input id="scholarship-url" name="externalUrl" defaultValue={initialData?.link && initialData.link !== "/contacto" ? initialData.link : ""} placeholder="https://..." />
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="scholarship-status">Estado</Label>
                <select id="scholarship-status" name="status" defaultValue={initialData?.status ?? "proxima"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.status)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {state.errors?.status ? <p className="text-sm text-destructive">{state.errors.status}</p> : null}
              </div>
            ) : null}
          </div>

          {state.message ? (
            <p className={`rounded-md border p-3 text-sm ${state.ok ? "border-primary/20 bg-utn-sky text-utn-ink" : "border-destructive/20 bg-destructive/10 text-destructive"}`} role="status">
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
                    if (createStatusRef.current) createStatusRef.current.value = "proxima";
                  }}
                >
                  <CalendarClock className="h-4 w-4" /> Guardar como próxima
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="publish"
                  disabled={pending}
                  onClick={() => {
                    if (createStatusRef.current) createStatusRef.current.value = "abierta";
                  }}
                >
                  <Save className="h-4 w-4" /> Publicar beca
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
