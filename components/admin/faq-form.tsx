"use client";

import { useActionState, useEffect, useRef } from "react";
import { Archive, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FaqFormState } from "@/app/admin/faq/actions";
import type { FaqItem } from "@/types/content";

type FaqFormProps = {
  action: (previousState: FaqFormState, formData: FormData) => Promise<FaqFormState>;
  initialData?: FaqItem;
};

const initialState: FaqFormState = { ok: false, message: "" };

export function FaqForm({ action, initialData }: FaqFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const createPublishedRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!state.ok || isEditing) return;

    formRef.current?.reset();
    if (createPublishedRef.current) createPublishedRef.current.value = "false";
  }, [isEditing, state.ok]);

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="grid gap-5">
          <input type="hidden" name="id" value={initialData?.id ?? ""} />
          {!isEditing ? <input ref={createPublishedRef} type="hidden" name="published" defaultValue="false" /> : null}

          <div className="grid gap-2">
            <Label htmlFor="faq-question">Pregunta</Label>
            <Input id="faq-question" name="question" defaultValue={initialData?.question ?? ""} placeholder="Pregunta frecuente de estudiantes" aria-invalid={Boolean(state.errors?.question)} />
            {state.errors?.question ? <p className="text-sm text-destructive">{state.errors.question}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="faq-answer">Respuesta</Label>
            <Textarea id="faq-answer" name="answer" defaultValue={initialData?.answer ?? ""} placeholder="Respuesta institucional clara y breve" aria-invalid={Boolean(state.errors?.answer)} />
            {state.errors?.answer ? <p className="text-sm text-destructive">{state.errors.answer}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="faq-category">Categoria</Label>
              <Input id="faq-category" name="category" defaultValue={initialData?.category ?? ""} placeholder="Tramites, becas, bienestar" aria-invalid={Boolean(state.errors?.category)} />
              {state.errors?.category ? <p className="text-sm text-destructive">{state.errors.category}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="faq-sort-order">Orden</Label>
              <Input id="faq-sort-order" name="sortOrder" type="number" min="0" defaultValue={initialData?.sortOrder ?? 0} aria-invalid={Boolean(state.errors?.sortOrder)} />
              {state.errors?.sortOrder ? <p className="text-sm text-destructive">{state.errors.sortOrder}</p> : null}
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="faq-published">Estado</Label>
                <select id="faq-published" name="published" defaultValue={String(initialData?.published ?? true)} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.published)}>
                  <option value="true">Publicada</option>
                  <option value="false">Inactiva</option>
                </select>
                {state.errors?.published ? <p className="text-sm text-destructive">{state.errors.published}</p> : null}
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
                  value="inactive"
                  disabled={pending}
                  onClick={() => {
                    if (createPublishedRef.current) createPublishedRef.current.value = "false";
                  }}
                >
                  <Archive className="h-4 w-4" /> Guardar inactiva
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="publish"
                  disabled={pending}
                  onClick={() => {
                    if (createPublishedRef.current) createPublishedRef.current.value = "true";
                  }}
                >
                  <Save className="h-4 w-4" /> Publicar FAQ
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
