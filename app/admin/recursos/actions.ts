"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import type { ContentStatus, ResourceItem } from "@/types/content";

type ResourceType = ResourceItem["type"];

export type ResourceFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "description" | "type" | "status" | "file", string>>;
};

const statuses: ContentStatus[] = ["draft", "scheduled", "published", "archived"];
const resourceTypes: ResourceType[] = ["pdf", "formulario", "reglamento", "guia"];
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain"
];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: "Supabase no está configurado. No se puede guardar el recurso real todavía." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitás iniciar sesión para administrar recursos." };
  }

  return { supabase, error: null };
}

function parseResourceForm(formData: FormData, fallbackStatus: ContentStatus) {
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const type = textValue(formData, "type") as ResourceType;
  const statusValue = textValue(formData, "status") as ContentStatus;
  const status = statuses.includes(statusValue) ? statusValue : fallbackStatus;
  const file = formData.get("file");
  const errors: ResourceFormState["errors"] = {};

  if (!title) errors.title = "El título es obligatorio.";
  if (!description) errors.description = "La descripción es obligatoria.";
  if (!resourceTypes.includes(type)) errors.type = "Seleccioná un tipo válido.";
  if (!statuses.includes(status)) errors.status = "Seleccioná un estado válido.";

  if (file instanceof File && file.size > 0) {
    if (!allowedMimeTypes.includes(file.type)) errors.file = "Subí un PDF o documento compatible.";
    if (file.size > 5 * 1024 * 1024) errors.file = "El archivo no debe superar los 5 MB.";
  }

  return { title, description, type, status, file, errors };
}

async function uploadResourceFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: FormDataEntryValue | null,
  title: string
) {
  if (!(file instanceof File) || file.size === 0) return { filePath: null, error: null };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
  const path = `${slugify(title)}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("resources").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) return { filePath: null, error: error.message };

  const { data } = supabase.storage.from("resources").getPublicUrl(path);
  return { filePath: data.publicUrl, error: null };
}

function revalidateResourcePaths() {
  revalidatePath("/recursos");
  revalidatePath("/admin/recursos");
}

export async function createResourceAction(_previousState: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  const intent = textValue(formData, "intent");
  const fallbackStatus: ContentStatus = intent === "publish" ? "published" : "draft";
  const parsed = parseResourceForm(formData, fallbackStatus);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar el recurso.", errors: parsed.errors };
  }

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const upload = await uploadResourceFile(supabase, parsed.file, parsed.title);
  if (upload.error) return { ok: false, message: `No se pudo subir el archivo: ${upload.error}`, errors: { file: upload.error } };

  const { error } = await supabase.from("resources").insert({
    title: parsed.title,
    description: parsed.description,
    type: parsed.type,
    file_path: upload.filePath ?? "pending",
    status: parsed.status
  });

  if (error) return { ok: false, message: `Supabase no pudo guardar el recurso: ${error.message}` };

  revalidateResourcePaths();
  return { ok: true, message: parsed.status === "published" ? "Recurso publicado correctamente." : "Borrador de recurso guardado correctamente." };
}

export async function updateResourceAction(_previousState: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  const id = textValue(formData, "id");
  const parsed = parseResourceForm(formData, "draft");

  if (!id) return { ok: false, message: "No se encontró el recurso a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { data: current } = await supabase.from("resources").select("file_path").eq("id", id).single();
  const upload = await uploadResourceFile(supabase, parsed.file, parsed.title);
  if (upload.error) return { ok: false, message: `No se pudo subir el archivo: ${upload.error}`, errors: { file: upload.error } };

  const { error } = await supabase
    .from("resources")
    .update({
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      file_path: upload.filePath ?? current?.file_path ?? "pending",
      status: parsed.status
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Supabase no pudo actualizar el recurso: ${error.message}` };

  revalidateResourcePaths();
  return { ok: true, message: "Recurso actualizado correctamente." };
}

export async function changeResourceStatusAction(formData: FormData) {
  const id = textValue(formData, "id");
  const status = textValue(formData, "status") as ContentStatus;

  if (!id || !statuses.includes(status)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  await supabase.from("resources").update({ status }).eq("id", id);
  revalidateResourcePaths();
}
