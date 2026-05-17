"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import type { Scholarship } from "@/types/content";

type ScholarshipStatus = Scholarship["status"];

export type ScholarshipFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "summary" | "requirements" | "documents" | "deadline" | "status", string>>;
};

const statuses: ScholarshipStatus[] = ["abierta", "proxima", "cerrada"];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function listValue(formData: FormData, key: string) {
  return textValue(formData, key)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: "Supabase no está configurado. No se puede guardar la beca real todavía." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitás iniciar sesión para administrar becas." };
  }

  return { supabase, error: null };
}

function parseScholarshipForm(formData: FormData, fallbackStatus: ScholarshipStatus) {
  const title = textValue(formData, "title");
  const requestedSlug = textValue(formData, "slug");
  const slug = slugify(requestedSlug || title);
  const summary = textValue(formData, "summary");
  const requirements = listValue(formData, "requirements");
  const documents = listValue(formData, "documents");
  const deadlineValue = textValue(formData, "deadline");
  const externalUrl = textValue(formData, "externalUrl");
  const statusValue = textValue(formData, "status") as ScholarshipStatus;
  const status = statuses.includes(statusValue) ? statusValue : fallbackStatus;
  const deadline = deadlineValue ? new Date(deadlineValue) : null;
  const errors: ScholarshipFormState["errors"] = {};

  if (!title) errors.title = "El título es obligatorio.";
  if (!slug) errors.slug = "El slug es obligatorio.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "Usá un slug válido, en minúsculas y separado por guiones.";
  if (!summary) errors.summary = "El resumen es obligatorio.";
  if (requirements.length === 0) errors.requirements = "Cargá al menos un requisito, uno por línea.";
  if (documents.length === 0) errors.documents = "Cargá al menos un documento, uno por línea.";
  if (!deadlineValue || !deadline || Number.isNaN(deadline.getTime())) errors.deadline = "La fecha límite es obligatoria.";
  if (!statuses.includes(status)) errors.status = "Seleccioná un estado válido.";

  return {
    title,
    slug,
    summary,
    requirements,
    documents,
    deadline: deadline ? deadline.toISOString() : null,
    externalUrl,
    status,
    errors
  };
}

async function slugExists(slug: string, exceptId?: string) {
  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { exists: false, error: authError };

  let query = supabase.from("scholarships").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query;
  if (error) return { exists: false, error: error.message };

  return { exists: Boolean(data?.length), error: null };
}

function revalidateScholarshipPaths() {
  revalidatePath("/");
  revalidatePath("/becas");
  revalidatePath("/admin/becas");
}

export async function createScholarshipAction(_previousState: ScholarshipFormState, formData: FormData): Promise<ScholarshipFormState> {
  const intent = textValue(formData, "intent");
  const fallbackStatus: ScholarshipStatus = intent === "publish" ? "abierta" : "proxima";
  const parsed = parseScholarshipForm(formData, fallbackStatus);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar la beca.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe una beca con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { error } = await supabase.from("scholarships").insert({
    title: parsed.title,
    slug: parsed.slug,
    summary: parsed.summary,
    requirements: parsed.requirements,
    documents: parsed.documents,
    deadline: parsed.deadline,
    external_url: parsed.externalUrl || null,
    status: parsed.status
  });

  if (error) return { ok: false, message: `Supabase no pudo guardar la beca: ${error.message}` };

  revalidateScholarshipPaths();
  return { ok: true, message: parsed.status === "abierta" ? "Beca publicada correctamente." : "Beca guardada como próxima/borrador." };
}

export async function updateScholarshipAction(_previousState: ScholarshipFormState, formData: FormData): Promise<ScholarshipFormState> {
  const id = textValue(formData, "id");
  const parsed = parseScholarshipForm(formData, "proxima");

  if (!id) return { ok: false, message: "No se encontró la beca a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug, id);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe otra beca con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { error } = await supabase
    .from("scholarships")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      summary: parsed.summary,
      requirements: parsed.requirements,
      documents: parsed.documents,
      deadline: parsed.deadline,
      external_url: parsed.externalUrl || null,
      status: parsed.status
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Supabase no pudo actualizar la beca: ${error.message}` };

  revalidateScholarshipPaths();
  return { ok: true, message: "Beca actualizada correctamente." };
}

export async function changeScholarshipStatusAction(formData: FormData) {
  const id = textValue(formData, "id");
  const status = textValue(formData, "status") as ScholarshipStatus;

  if (!id || !statuses.includes(status)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  await supabase.from("scholarships").update({ status }).eq("id", id);
  revalidateScholarshipPaths();
}
