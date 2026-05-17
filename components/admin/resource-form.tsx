"use client";

import { useActionState, useEffect, useRef } from "react";
import { Archive, FileUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResourceFormState } from "@/app/admin/recursos/actions";
import type { ContentStatus, ResourceItem } from "@/types/content";

type ResourceFormProps = {
  action: (previousState: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  initialData?: ResourceItem;
};

const initialState: ResourceFormState = { ok: false, message: "" };
const statuses: ContentStatus[] = ["draft", "published", "archived"];
const resourceTypes: ResourceItem["type"][] = ["pdf", "formulario", "reglamento", "guia"];
const acceptedFiles = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain";

export function ResourceForm({ action, initialData }: ResourceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const createStatusRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);
  const hasFile = Boolean(initialData?.fileUrl && initialData.fileUrl !== "#");

  useEffect(() => {
    if (!state.ok || isEditing) return;

    formRef.current?.reset();
    if (createStatusRef.current) createStatusRef.current.value = "draft";
  }, [isEditing, state.ok]);

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="grid gap-5">
          <input type="hidden" name="id" value={initialData?.id ?? ""} />
          {!isEditing ? <input ref={createStatusRef} type="hidden" name="status" defaultValue="draft" /> : null}

          <div className="grid gap-2">
            <Label htmlFor="resource-title">Titulo</Label>
            <Input id="resource-title" name="title" defaultValue={initialData?.title ?? ""} placeholder="Nombre del recurso institucional" aria-invalid={Boolean(state.errors?.title)} />
            {state.errors?.title ? <p className="text-sm text-destructive">{state.errors.title}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="resource-description">Descripcion</Label>
            <Textarea id="resource-description" name="description" defaultValue={initialData?.description ?? ""} placeholder="Breve descripcion del documento o guia" aria-invalid={Boolean(state.errors?.description)} />
            {state.errors?.description ? <p className="text-sm text-destructive">{state.errors.description}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="resource-type">Tipo</Label>
              <select id="resource-type" name="type" defaultValue={initialData?.type ?? "pdf"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.type)}>
                {resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {state.errors?.type ? <p className="text-sm text-destructive">{state.errors.type}</p> : null}
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="resource-status">Estado</Label>
                <select id="resource-status" name="status" defaultValue={initialData?.status ?? "draft"} className="focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-invalid={Boolean(state.errors?.status)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {state.errors?.status ? <p className="text-sm text-destructive">{state.errors.status}</p> : null}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="resource-file">{isEditing ? "Reemplazar archivo" : "Archivo"}</Label>
              <Input id="resource-file" name="file" type="file" accept={acceptedFiles} aria-invalid={Boolean(state.errors?.file)} />
              {state.errors?.file ? <p className="text-sm text-destructive">{state.errors.file}</p> : null}
            </div>
          </div>

          {isEditing ? (
            <p className="text-xs text-muted-foreground">
              {hasFile ? "El recurso ya tiene un archivo cargado. Si adjuntas otro, se reemplazara la referencia publica." : "Este recurso no tiene archivo real cargado; en la landing se mostrara como disponible proximamente."}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Si no adjuntas archivo, el recurso se guardara sin enlace publico y se mostrara como disponible proximamente.</p>
          )}

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
                    if (createStatusRef.current) createStatusRef.current.value = "draft";
                  }}
                >
                  <Archive className="h-4 w-4" /> Guardar borrador
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
                  <FileUp className="h-4 w-4" /> Publicar recurso
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
