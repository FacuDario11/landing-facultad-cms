"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import type { ContentStatus, EventItem } from "@/types/content";

type EventModality = EventItem["modality"];

export type EventFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "description" | "startsAt" | "location" | "modality" | "category" | "status" | "image", string>>;
};

const statuses: ContentStatus[] = ["draft", "scheduled", "published", "archived"];
const modalities: EventModality[] = ["presencial", "virtual", "hibrida"];
const categories = ["Ingresantes", "Becas", "Pasantías", "Bienestar", "Académica", "Institucional"];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: "Supabase no está configurado. No se puede guardar el evento real todavía." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitás iniciar sesión para administrar eventos." };
  }

  return { supabase, error: null };
}

function parseEventForm(formData: FormData, fallbackStatus: ContentStatus) {
  const title = textValue(formData, "title");
  const requestedSlug = textValue(formData, "slug");
  const slug = slugify(requestedSlug || title);
  const description = textValue(formData, "description");
  const content = textValue(formData, "content");
  const startsAtValue = textValue(formData, "startsAt");
  const location = textValue(formData, "location");
  const modality = textValue(formData, "modality") as EventModality;
  const category = textValue(formData, "category");
  const statusValue = textValue(formData, "status") as ContentStatus;
  const status = statuses.includes(statusValue) ? statusValue : fallbackStatus;
  const image = formData.get("image");
  const errors: EventFormState["errors"] = {};
  const startsAt = startsAtValue ? new Date(startsAtValue) : null;

  if (!title) errors.title = "El título es obligatorio.";
  if (!slug) errors.slug = "El slug es obligatorio.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "Usá un slug válido, en minúsculas y separado por guiones.";
  if (!description) errors.description = "La descripción es obligatoria.";
  if (!startsAtValue || !startsAt || Number.isNaN(startsAt.getTime())) errors.startsAt = "La fecha del evento es obligatoria.";
  if (!location) errors.location = "El lugar o canal del evento es obligatorio.";
  if (!modalities.includes(modality)) errors.modality = "Seleccioná una modalidad válida.";
  if (!categories.includes(category)) errors.category = "Seleccioná una categoría válida.";
  if (!statuses.includes(status)) errors.status = "Seleccioná un estado válido.";

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) errors.image = "El archivo debe ser una imagen.";
    if (image.size > 2 * 1024 * 1024) errors.image = "La imagen no debe superar los 2 MB.";
  }

  return {
    title,
    slug,
    description,
    content,
    startsAt: startsAt ? startsAt.toISOString() : "",
    location,
    modality,
    category,
    status,
    image,
    errors
  };
}

async function slugExists(slug: string, exceptId?: string) {
  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { exists: false, error: authError };

  let query = supabase.from("events").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query;
  if (error) return { exists: false, error: error.message };

  return { exists: Boolean(data?.length), error: null };
}

async function uploadEventImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  image: FormDataEntryValue | null,
  slug: string
) {
  if (!(image instanceof File) || image.size === 0) return { imagePath: null, error: null };

  const extension = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${slug}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("events").upload(path, image, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) return { imagePath: null, error: error.message };

  const { data } = supabase.storage.from("events").getPublicUrl(path);
  return { imagePath: data.publicUrl, error: null };
}

function revalidateEventPaths() {
  revalidatePath("/");
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
}

export async function createEventAction(_previousState: EventFormState, formData: FormData): Promise<EventFormState> {
  const intent = textValue(formData, "intent");
  const fallbackStatus: ContentStatus = intent === "publish" ? "published" : "draft";
  const parsed = parseEventForm(formData, fallbackStatus);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar el evento.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe un evento con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const upload = await uploadEventImage(supabase, parsed.image, parsed.slug);
  if (upload.error) return { ok: false, message: `No se pudo subir la imagen: ${upload.error}`, errors: { image: upload.error } };

  const { error } = await supabase.from("events").insert({
    title: parsed.title,
    slug: parsed.slug,
    description: parsed.description,
    content_html: parsed.content,
    starts_at: parsed.startsAt,
    ends_at: null,
    location: parsed.location,
    modality: parsed.modality,
    category: parsed.category,
    image_path: upload.imagePath,
    status: parsed.status
  });

  if (error) return { ok: false, message: `Supabase no pudo guardar el evento: ${error.message}` };

  revalidateEventPaths();
  return { ok: true, message: parsed.status === "published" ? "Evento publicado correctamente." : "Borrador de evento guardado correctamente." };
}

export async function updateEventAction(_previousState: EventFormState, formData: FormData): Promise<EventFormState> {
  const id = textValue(formData, "id");
  const parsed = parseEventForm(formData, "draft");

  if (!id) return { ok: false, message: "No se encontró el evento a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug, id);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe otro evento con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { data: current } = await supabase.from("events").select("image_path").eq("id", id).single();
  const upload = await uploadEventImage(supabase, parsed.image, parsed.slug);
  if (upload.error) return { ok: false, message: `No se pudo subir la imagen: ${upload.error}`, errors: { image: upload.error } };

  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      description: parsed.description,
      content_html: parsed.content,
      starts_at: parsed.startsAt,
      ends_at: null,
      location: parsed.location,
      modality: parsed.modality,
      category: parsed.category,
      image_path: upload.imagePath ?? current?.image_path ?? null,
      status: parsed.status
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Supabase no pudo actualizar el evento: ${error.message}` };

  revalidateEventPaths();
  return { ok: true, message: "Evento actualizado correctamente." };
}

export async function changeEventStatusAction(formData: FormData) {
  const id = textValue(formData, "id");
  const status = textValue(formData, "status") as ContentStatus;

  if (!id || !statuses.includes(status)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  await supabase.from("events").update({ status }).eq("id", id);
  revalidateEventPaths();
}
