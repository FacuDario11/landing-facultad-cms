"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarClock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { ContentStatus, Internship } from "@/types/content";

type InternshipFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"company" | "title" | "slug" | "career" | "modality" | "requirements" | "deadline" | "status", string>>;
};

type InternshipFormProps = {
  action: (previousState: InternshipFormState, formData: FormData) => Promise<InternshipFormState>;
  initialData?: Internship;
};

const initialState: InternshipFormState = { ok: false, message: "" };
const statuses: ContentStatus[] = ["draft", "published", "archived"];
const modalities: Internship["modality"][] = ["presencial", "remota", "hibrida"];

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function InternshipForm({ action, initialData }: InternshipFormProps) {
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const createStatusRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!state.ok || isEditing) return;

    setCompany("");
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    formRef.current?.reset();
    if (createStatusRef.current) createStatusRef.current.value = "draft";
  }, [isEditing, state.ok]);

  function updateSlug(nextCompany: string, nextTitle: string) {
    if (!slugTouched) setSlug(slugify(`${nextCompany} ${nextTitle}`));
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="grid gap-5">
          <input type="hidden" name="id" value={initialData?.id ?? ""} />
          {!isEditing ? <input ref={createStatusRef} type="hidden" name="status" defaultValue="draft" /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="internship-company">Empresa</Label>
              <Input
                id="internship-company"
                name="company"
                value={company}
                onChange={(event) => {
                  setCompany(event.target.value);
                  updateSlug(event.target.value, title);
                }}
                placeholder="Empresa u organización"
                aria-invalid={Boolean(state.errors?.company)}
              />
              {state.errors?.company ? <p className="text-sm text-destructive">{state.errors.company}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internship-title">Título</Label>
              <Input
                id="internship-title"
                name="title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  updateSlug(company, event.target.value);
                }}
                placeholder="Título de la pasantía"
                aria-invalid={Boolean(state.errors?.title)}
              />
              {state.errors?.title ? <p className="text-sm text-destructive">{state.errors.title}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="internship-slug">Slug</Label>
              <Input
                id="internship-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="empresa-titulo-pasantia"
                aria-invalid={Boolean(state.errors?.slug)}
              />
              {state.errors?.slug ? <p className="text-sm text-destructive">{state.errors.slug}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internship-career">Carrera / perfil</Label>
              <Input id="internship-career" name="career" defaultValue={initialData?.career ?? ""} placeholder="Ingeniería en Sistemas" aria-invalid={Boolean(state.errors?.career)} />
              {state.errors?.career ? <p className="text-sm text-destructive">{state.errors.career}</p> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="internship-requirements">Requisitos</Label>
            <Textarea id="internship-requirements" name="requirements" defaultValue={initialData?.requirements.join("\n") ?? ""} placeholder="Un requisito por línea" aria-invalid={Boolean(state.errors?.requirements)} />
            {state.errors?.requirements ? <p className="text-sm text-destructive">{state.errors.requirements}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="internship-deadline">Fecha límite</Label>
              <Input id="internship-deadline" name="deadline" type="date" defaultValue={toDateInputValue(initialData?.deadline)} aria-invalid={Boolean(state.errors?.deadline)} />
              {state.errors?.deadline ? <p className="text-sm text-destructive">{state.errors.deadline}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internship-modality">Modalidad</Label>
              <select id="internship-modality" name="modality" defaultValue={initialData?.modality ?? "hibrida"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.modality)}>
                {modalities.map((modality) => <option key={modality} value={modality}>{modality}</option>)}
              </select>
              {state.errors?.modality ? <p className="text-sm text-destructive">{state.errors.modality}</p> : null}
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="internship-status">Estado</Label>
                <select id="internship-status" name="status" defaultValue={initialData?.status ?? "draft"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.status)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {state.errors?.status ? <p className="text-sm text-destructive">{state.errors.status}</p> : null}
              </div>
            ) : null}
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
                  <Save className="h-4 w-4" /> Publicar pasantía
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
