"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import type { ContentStatus, NewsCategory } from "@/types/content";

export type NewsFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"title" | "slug" | "excerpt" | "content" | "category" | "status" | "image", string>>;
};

const categories: NewsCategory[] = ["institucional", "becas", "pasantias", "bienestar", "academica", "eventos"];
const statuses: ContentStatus[] = ["draft", "scheduled", "published", "archived"];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function hasMeaningfulHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, userId: null, error: "Supabase no está configurado. No se puede guardar la noticia real todavía." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, userId: null, error: "Necesitás iniciar sesión para administrar noticias." };
  }

  return { supabase, userId: userData.user.id, error: null };
}

function parseNewsForm(formData: FormData, fallbackStatus: ContentStatus) {
  const title = textValue(formData, "title");
  const requestedSlug = textValue(formData, "slug");
  const slug = slugify(requestedSlug || title);
  const excerpt = textValue(formData, "excerpt");
  const content = textValue(formData, "content");
  const category = textValue(formData, "category") as NewsCategory;
  const statusValue = textValue(formData, "status") as ContentStatus;
  const status = statuses.includes(statusValue) ? statusValue : fallbackStatus;
  const featured = formData.get("featured") === "on";
  const errors: NewsFormState["errors"] = {};

  if (!title) errors.title = "El título es obligatorio.";
  if (!slug) errors.slug = "El slug es obligatorio.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "Usá un slug válido, en minúsculas y separado por guiones.";
  if (!excerpt) errors.excerpt = "El resumen es obligatorio.";
  if (!hasMeaningfulHtml(content)) errors.content = "El contenido es obligatorio.";
  if (!categories.includes(category)) errors.category = "Seleccioná una categoría válida.";
  if (!statuses.includes(status)) errors.status = "Seleccioná un estado válido.";

  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) errors.image = "El archivo debe ser una imagen.";
    if (image.size > 2 * 1024 * 1024) errors.image = "La imagen no debe superar los 2 MB.";
  }

  return { title, slug, excerpt, content, category, status, featured, image, errors };
}

async function slugExists(slug: string, exceptId?: string) {
  const supabaseContext = await getAuthenticatedSupabase();
  if (!supabaseContext.supabase) return { exists: false, error: supabaseContext.error };

  let query = supabaseContext.supabase.from("news").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query;
  if (error) return { exists: false, error: error.message };

  return { exists: Boolean(data?.length), error: null };
}

function revalidateNewsPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/noticias");
  if (slug) revalidatePath(`/noticias/${slug}`);
  revalidatePath("/admin/noticias");
}

async function uploadNewsImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  image: FormDataEntryValue | null,
  slug: string
) {
  if (!(image instanceof File) || image.size === 0) return { imagePath: null, error: null };

  const extension = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${slug}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("news").upload(path, image, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) return { imagePath: null, error: error.message };

  const { data } = supabase.storage.from("news").getPublicUrl(path);
  return { imagePath: data.publicUrl, error: null };
}

export async function createNewsAction(_previousState: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const intent = textValue(formData, "intent");
  const fallbackStatus: ContentStatus = intent === "publish" ? "published" : "draft";
  const parsed = parseNewsForm(formData, fallbackStatus);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar la noticia.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe una noticia con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, userId, error: authError } = await getAuthenticatedSupabase();
  if (!supabase || !userId) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const upload = await uploadNewsImage(supabase, parsed.image, parsed.slug);
  if (upload.error) return { ok: false, message: `No se pudo subir la imagen: ${upload.error}`, errors: { image: upload.error } };

  const { error } = await supabase.from("news").insert({
    author_id: userId,
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt,
    content: {},
    content_html: parsed.content,
    category: parsed.category,
    image_path: upload.imagePath,
    featured: parsed.featured,
    status: parsed.status,
    published_at: parsed.status === "published" ? new Date().toISOString() : null,
    scheduled_at: null
  });

  if (error) {
    return { ok: false, message: `Supabase no pudo guardar la noticia: ${error.message}` };
  }

  revalidateNewsPaths(parsed.slug);

  return {
    ok: true,
    message: parsed.status === "published" ? "Noticia publicada correctamente." : "Borrador guardado correctamente."
  };
}

export async function updateNewsAction(_previousState: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const id = textValue(formData, "id");
  const parsed = parseNewsForm(formData, "draft");

  if (!id) return { ok: false, message: "No se encontró la noticia a editar." };
  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisá los campos marcados antes de guardar los cambios.", errors: parsed.errors };
  }

  const duplicate = await slugExists(parsed.slug, id);
  if (duplicate.error) return { ok: false, message: `No se pudo validar el slug: ${duplicate.error}` };
  if (duplicate.exists) return { ok: false, message: "Ya existe otra noticia con ese slug.", errors: { slug: "Elegí un slug único." } };

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesión." };

  const { data: current } = await supabase.from("news").select("published_at,slug,image_path").eq("id", id).single();
  const publishedAt = parsed.status === "published" ? current?.published_at ?? new Date().toISOString() : null;
  const upload = await uploadNewsImage(supabase, parsed.image, parsed.slug);
  if (upload.error) return { ok: false, message: `No se pudo subir la imagen: ${upload.error}`, errors: { image: upload.error } };

  const { error } = await supabase
    .from("news")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content_html: parsed.content,
      category: parsed.category,
      image_path: upload.imagePath ?? current?.image_path ?? null,
      featured: parsed.featured,
      status: parsed.status,
      published_at: publishedAt,
      scheduled_at: null
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Supabase no pudo actualizar la noticia: ${error.message}` };
  }

  revalidateNewsPaths(parsed.slug);
  if (current?.slug && current.slug !== parsed.slug) revalidatePath(`/noticias/${current.slug}`);

  return { ok: true, message: "Noticia actualizada correctamente." };
}

export async function changeNewsStatusAction(formData: FormData) {
  const id = textValue(formData, "id");
  const status = textValue(formData, "status") as ContentStatus;

  if (!id || !statuses.includes(status)) return;

  const { supabase } = await getAuthenticatedSupabase();
  if (!supabase) return;

  const { data: current } = await supabase.from("news").select("slug,published_at").eq("id", id).single();
  await supabase
    .from("news")
    .update({
      status,
      published_at: status === "published" ? current?.published_at ?? new Date().toISOString() : null
    })
    .eq("id", id);

  revalidateNewsPaths(current?.slug);
}
