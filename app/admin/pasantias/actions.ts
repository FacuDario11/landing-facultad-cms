"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import type { ContentStatus, Internship } from "@/types/content";

type InternshipModality = Internship["modality"];

export type InternshipFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"company" | "title" | "slug" | "career" | "modality" | "requirements" | "deadline" | "status", string>>;
};

const statuses: ContentStatus[] = ["draft", "scheduled", "published", "archived"];
const modalities: InternshipModality[] = ["presencial", "remota", "hibrida"];

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
    return { supabase: null, error: "Supabase no está configurado. No se puede guardar la pasantía real todavía." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitás iniciar sesión para administrar pasantías." };
  }

  return { supabase, error: null };
}

function parseInternshipForm(formData: FormData, fallbackStatus: ContentStatus) {
  const company = textValue(formData, "company");
  const title = textValue(formData, "title");
  const requestedSlug = textValue(formData, "slug");
  const slug = slugify(requestedSlug || `${company} ${title}`);
  const career = textValue(formData, "career");
  const modality = textValue(formData, "modality") as InternshipModality;
  const requirements = listValue(formData, "requirements");
  const deadlineValue = textValue(formData, "deadline");
  const statusValue = textValue(formData, "status") as ContentStatus;
  const status = statuses.includes(statusValue) ? statusValue : fallbackStatus;
  const deadline = deadlineValue ? new Date(deadlineValue) : null;
  const errors: InternshipFormState["errors"] = {};

  if (!company) errors.company = "La empresa es obligatoria.";
  if (!title) errors.title = "El título es obligatorio.";
  if (!slug) errors.slug = "El slug es obligatorio.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "Usá un slug válido, en minúsculas y separado por guiones.";
  if (!career) errors.career = "La carrera o perfil es obligatorio.";
  if (!modalities.includes(modality)) errors.modality = "Seleccioná una modalidad válida.";
  if (requirements.length === 0) errors.requirements = "Cargá al menos un requisito, uno por línea.";
  if (!deadlineValue || !deadline || Number.isNaN(deadline.getTime())) errors.deadline = "La fecha límite es obligatoria.";
  if (!statuses.includes(status)) errors.status = "Seleccioná un estado válido.";

  return {
    company,
    title,
    slug,
    career,
    modality,
    requirements,
    deadline: deadline ? deadline.toISOString() : null,
    status,
    errors
  };
}

async function slugExists(slug: string, exceptId?: string) {
  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { exists: false, error: authError };

  let query = supabase.from("internships").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query;
  if (error) return { exists: false, error: error.message };

  return { exists: Boolean(data?.length), error: null };
}

function revalidateInternshipPaths() {
  revalidatePath("/");
  revalidatePath("/pasantias");
  revalidatePath("/admin/pasantias");
}

export async function createInternshipAction(_previousState: InternshipFormState, formData: FormData): Promise<InternshipFormState> {
  const intent = textValue(formData, "intent");
  const fallbackStatus: ContentStatus = intent === "publish" ? "published" : "draft";
  const parsed = parseInternshipForm(formData, fallbackStatus);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar la pasantía.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe una pasantía con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { error } = await supabase.from("internships").insert({
    company: parsed.company,
    title: parsed.title,
    slug: parsed.slug,
    modality: parsed.modality,
    career: parsed.career,
    requirements: parsed.requirements,
    deadline: parsed.deadline,
    status: parsed.status
  });

  if (error) return { ok: false, message: `Supabase no pudo guardar la pasantía: ${error.message}` };

  revalidateInternshipPaths();
  return { ok: true, message: parsed.status === "published" ? "Pasantía publicada correctamente." : "Borrador de pasantía guardado correctamente." };
}

export async function updateInternshipAction(_previousState: InternshipFormState, formData: FormData): Promise<InternshipFormState> {
  const id = textValue(formData, "id");
  const parsed = parseInternshipForm(formData, "draft");

  if (!id) return { ok: false, message: "No se encontró la pasantía a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug, id);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe otra pasantía con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { error } = await supabase
    .from("internships")
    .update({
      company: parsed.company,
      title: parsed.title,
      slug: parsed.slug,
      modality: parsed.modality,
      career: parsed.career,
      requirements: parsed.requirements,
      deadline: parsed.deadline,
      status: parsed.status
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Supabase no pudo actualizar la pasantía: ${error.message}` };

  revalidateInternshipPaths();
  return { ok: true, message: "Pasantía actualizada correctamente." };
}

export async function changeInternshipStatusAction(formData: FormData) {
  const id = textValue(formData, "id");
  const status = textValue(formData, "status") as ContentStatus;

  if (!id || !statuses.includes(status)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  await supabase.from("internships").update({ status }).eq("id", id);
  revalidateInternshipPaths();
}
