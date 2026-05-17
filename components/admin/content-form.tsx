"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarClock, ImagePlus, Save } from "lucide-react";
import { TiptapEditor } from "@/components/content/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { ContentStatus, NewsCategory, NewsItem } from "@/types/content";

type ContentFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "excerpt" | "content" | "category" | "status" | "image", string>>;
};

type ContentFormProps = {
  type?: string;
  action?: (previousState: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  initialData?: NewsItem;
};

const initialState: ContentFormState = { ok: false, message: "" };
const categories: NewsCategory[] = ["institucional", "becas", "pasantias", "bienestar", "academica", "eventos"];
const statuses: ContentStatus[] = ["draft", "published", "archived"];

export function ContentForm({ type = "noticia", action, initialData }: ContentFormProps) {
  const [content, setContent] = useState(initialData?.content ?? "<p></p>");
  const [demoMessage, setDemoMessage] = useState("");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const createStatusRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action ?? (async () => initialState), initialState);
  const isRealNewsForm = Boolean(action);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!state.ok || isEditing) return;

    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setContent("<p></p>");
    setDemoMessage("");
    formRef.current?.reset();
    if (createStatusRef.current) createStatusRef.current.value = "draft";
    setResetKey((value) => value + 1);
  }, [isEditing, state.ok]);

  function showDemoFeedback(actionType: "draft" | "publish" | "file") {
    setDemoMessage(
      actionType === "draft"
        ? "Borrador simulado en modo demo. La persistencia real del CMS se implementará en la siguiente fase."
        : actionType === "publish"
          ? "Publicación simulada en modo demo. La conexión real al CMS se implementará en la siguiente fase."
          : "Carga de archivo simulada en modo demo. La subida real a Supabase Storage se implementará en la siguiente fase."
    );
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="grid gap-5">
          <input type="hidden" name="id" value={initialData?.id ?? ""} />
          <input type="hidden" name="content" value={content} />
          {!isEditing ? <input ref={createStatusRef} type="hidden" name="status" defaultValue="draft" /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder={`Título de ${type}`} aria-invalid={Boolean(state.errors?.title)} />
              {state.errors?.title ? <p className="text-sm text-destructive">{state.errors.title}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="titulo-de-publicacion"
                aria-invalid={Boolean(state.errors?.slug)}
              />
              {state.errors?.slug ? <p className="text-sm text-destructive">{state.errors.slug}</p> : null}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea id="excerpt" name="excerpt" defaultValue={initialData?.excerpt ?? ""} placeholder="Resumen breve para listados y SEO." aria-invalid={Boolean(state.errors?.excerpt)} />
            {state.errors?.excerpt ? <p className="text-sm text-destructive">{state.errors.excerpt}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label>Contenido</Label>
            <TiptapEditor key={resetKey} value={content} onChange={setContent} />
            {state.errors?.content ? <p className="text-sm text-destructive">{state.errors.content}</p> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                name="category"
                defaultValue={initialData?.category ?? "institucional"}
                className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-invalid={Boolean(state.errors?.category)}
              >
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              {state.errors?.category ? <p className="text-sm text-destructive">{state.errors.category}</p> : null}
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={initialData?.status ?? "draft"}
                  className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  aria-invalid={Boolean(state.errors?.status)}
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {state.errors?.status ? <p className="text-sm text-destructive">{state.errors.status}</p> : null}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="date">Programar publicación</Label>
              <Input id="date" type="datetime-local" disabled={isRealNewsForm} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Imagen / archivo</Label>
              {isRealNewsForm ? (
                <>
                  <Input id="image" name="image" type="file" accept="image/*" aria-invalid={Boolean(state.errors?.image)} />
                  <p className="text-xs text-muted-foreground">Opcional. Se sube al bucket news de Supabase Storage.</p>
                  {state.errors?.image ? <p className="text-sm text-destructive">{state.errors.image}</p> : null}
                </>
              ) : (
                <Button type="button" variant="outline" className="justify-start" onClick={() => showDemoFeedback("file")}><ImagePlus className="h-4 w-4" /> Adjuntar archivo demo</Button>
              )}
            </div>
          </div>
          {isRealNewsForm ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="featured" defaultChecked={initialData?.featured ?? false} className="h-4 w-4 rounded border-input" />
              Destacar noticia en la home
            </label>
          ) : null}
          {(state.message || demoMessage) ? (
            <p
              className={state.message ? `rounded-md border p-3 text-sm ${state.ok ? "border-primary/20 bg-utn-sky text-utn-ink" : "border-destructive/20 bg-destructive/10 text-destructive"}` : "rounded-md border border-primary/20 bg-utn-sky p-3 text-sm text-utn-ink"}
              role="status"
            >
              {state.message || demoMessage}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            {isRealNewsForm ? (
              isEditing ? (
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
                    <Save className="h-4 w-4" /> Publicar noticia
                  </Button>
                </>
              )
            ) : (
              <>
                <Button variant="outline" type="button" onClick={() => showDemoFeedback("draft")}><CalendarClock className="h-4 w-4" /> Guardar borrador demo</Button>
                <Button type="button" onClick={() => showDemoFeedback("publish")}><Save className="h-4 w-4" /> Simular publicación</Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
