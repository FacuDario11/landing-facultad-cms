"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FaqFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"question" | "answer" | "category" | "sortOrder" | "published", string>>;
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: "Supabase no esta configurado. No se puede guardar la FAQ real todavia." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitas iniciar sesion para administrar preguntas frecuentes." };
  }

  return { supabase, error: null };
}

function parseFaqForm(formData: FormData, fallbackPublished: boolean) {
  const question = textValue(formData, "question");
  const answer = textValue(formData, "answer");
  const category = textValue(formData, "category");
  const publishedValue = textValue(formData, "published");
  const published = publishedValue ? publishedValue === "true" : fallbackPublished;
  const sortOrderValue = textValue(formData, "sortOrder");
  const sortOrder = sortOrderValue ? Number(sortOrderValue) : 0;
  const errors: FaqFormState["errors"] = {};

  if (!question) errors.question = "La pregunta es obligatoria.";
  if (!answer) errors.answer = "La respuesta es obligatoria.";
  if (!category) errors.category = "La categoria es obligatoria.";
  if (!["true", "false", ""].includes(publishedValue)) errors.published = "Selecciona un estado valido.";
  if (!Number.isFinite(sortOrder) || sortOrder < 0) errors.sortOrder = "El orden debe ser un numero mayor o igual a cero.";

  return { question, answer, category, sortOrder, published, errors };
}

function revalidateFaqPaths() {
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function createFaqAction(_previousState: FaqFormState, formData: FormData): Promise<FaqFormState> {
  const intent = textValue(formData, "intent");
  const parsed = parseFaqForm(formData, intent === "publish");

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados antes de guardar la FAQ.", errors: parsed.errors };
  }

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesion." };

  const { error } = await supabase.from("faq").insert({
    question: parsed.question,
    answer: parsed.answer,
    category: parsed.category,
    sort_order: parsed.sortOrder,
    published: parsed.published
  });

  if (error) return { ok: false, message: `Supabase no pudo guardar la FAQ: ${error.message}` };

  revalidateFaqPaths();
  return { ok: true, message: parsed.published ? "FAQ publicada correctamente." : "FAQ guardada como inactiva correctamente." };
}

export async function updateFaqAction(_previousState: FaqFormState, formData: FormData): Promise<FaqFormState> {
  const id = textValue(formData, "id");
  const parsed = parseFaqForm(formData, false);

  if (!id) return { ok: false, message: "No se encontro la FAQ a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesion." };

  const { error } = await supabase
    .from("faq")
    .update({
      question: parsed.question,
      answer: parsed.answer,
      category: parsed.category,
      sort_order: parsed.sortOrder,
      published: parsed.published
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Supabase no pudo actualizar la FAQ: ${error.message}` };

  revalidateFaqPaths();
  return { ok: true, message: "FAQ actualizada correctamente." };
}

export async function changeFaqPublishedAction(formData: FormData) {
  const id = textValue(formData, "id");
  const publishedValue = textValue(formData, "published");

  if (!id || !["true", "false"].includes(publishedValue)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  await supabase.from("faq").update({ published: publishedValue === "true" }).eq("id", id);
  revalidateFaqPaths();
}
