import { events, faqs, internships, news, resources, scholarships, siteSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ContentStatus, EventItem, Internship, NewsCategory, NewsItem, ResourceItem, Scholarship, SiteSettings } from "@/types/content";

const newsCategories: NewsCategory[] = ["institucional", "becas", "pasantias", "bienestar", "academica", "eventos"];

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string | null;
  category: string;
  image_path: string | null;
  featured: boolean | null;
  status: ContentStatus;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_html: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string;
  modality: "presencial" | "virtual" | "hibrida";
  category: string;
  image_path: string | null;
  status: ContentStatus;
  created_at: string;
};

type ScholarshipRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  requirements: string[] | null;
  documents: string[] | null;
  deadline: string | null;
  external_url: string | null;
  status: Scholarship["status"];
  created_at: string;
};

type InternshipRow = {
  id: string;
  company: string;
  title: string;
  slug: string;
  modality: "presencial" | "remota" | "hibrida";
  career: string;
  requirements: string[] | null;
  deadline: string | null;
  status: ContentStatus;
  created_at: string;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string;
  type: ResourceItem["type"];
  file_path: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

type SiteSettingsRow = {
  id: string;
  institution_name: string;
  email: string;
  address: string;
  office_hours: string;
  logo_path: string | null;
  banner_path: string | null;
  social_links: Record<string, unknown> | null;
};

function normalizeNewsCategory(category: string): NewsCategory {
  return newsCategories.includes(category as NewsCategory) ? (category as NewsCategory) : "institucional";
}

function logSupabaseError(context: string, error: unknown) {
  console.error(`[Supabase] ${context}`, error);
}

function fallbackNewsImage(category: string) {
  if (category === "becas") return "/images/news-becas.svg";
  if (category === "pasantias") return "/images/news-pasantias.svg";
  return "/images/news-ingresantes.svg";
}

function mapNewsRow(row: NewsRow): NewsItem {
  const category = normalizeNewsCategory(row.category);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content_html || "<p>Contenido pendiente de publicación.</p>",
    category,
    imageUrl: row.image_path || fallbackNewsImage(category),
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: row.published_at || row.created_at,
    scheduledAt: row.scheduled_at
  };
}

function mapEventRow(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    date: row.starts_at,
    location: row.location,
    modality: row.modality,
    category: row.category,
    imageUrl: row.image_path ?? undefined,
    content: row.content_html ?? "",
    endsAt: row.ends_at,
    status: row.status
  };
}

function mapScholarshipRow(row: ScholarshipRow): Scholarship {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    requirements: row.requirements ?? [],
    documents: row.documents ?? [],
    deadline: row.deadline ?? row.created_at,
    link: row.external_url || "/contacto",
    status: row.status
  };
}

function mapInternshipRow(row: InternshipRow): Internship {
  return {
    id: row.id,
    company: row.company,
    title: row.title,
    slug: row.slug,
    modality: row.modality,
    career: row.career,
    requirements: row.requirements ?? [],
    deadline: row.deadline ?? row.created_at,
    status: row.status
  };
}

function mapResourceRow(row: ResourceRow): ResourceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    fileUrl: row.file_path === "pending" ? "#" : row.file_path,
    updatedAt: row.updated_at ?? row.created_at,
    status: row.status
  };
}

function mapFaqRow(row: FaqRow) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order,
    published: row.published
  };
}

function mapSiteSettingsRow(row: SiteSettingsRow): SiteSettings {
  const socialLinks = row.social_links ?? {};

  return {
    institutionName: row.institution_name,
    email: row.email,
    address: row.address,
    officeHours: row.office_hours,
    instagram: typeof socialLinks.instagram === "string" ? socialLinks.instagram : "",
    facebook: typeof socialLinks.facebook === "string" ? socialLinks.facebook : "",
    logoPath: row.logo_path,
    bannerPath: row.banner_path
  };
}

function filterDemoNews(params?: { q?: string; category?: string; page?: number; pageSize?: number }) {
  const q = params?.q?.toLowerCase().trim();
  const category = params?.category;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 9;
  const filtered = news
    .filter((item) => item.status === "published")
    .filter((item) => (category && !["todas", "Todos"].includes(category) ? item.category === category : true))
    .filter((item) => (q ? `${item.title} ${item.excerpt}`.toLowerCase().includes(q) : true))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize
  };
}

export async function getFeaturedNews() {
  const result = await getNews({ pageSize: 3 });
  const featured = result.items.filter((item) => item.featured).slice(0, 3);
  return featured.length > 0 ? featured : result.items.slice(0, 3);
}

export async function getNews(params?: { q?: string; category?: string; page?: number; pageSize?: number }) {
  if (!isSupabaseConfigured()) return filterDemoNews(params);

  const q = params?.q?.trim();
  const category = params?.category;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 9;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("news")
      .select("id,title,slug,excerpt,content_html,category,image_path,featured,status,published_at,scheduled_at,created_at", { count: "exact" })
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false, nullsFirst: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (category && !["todas", "Todos"].includes(category)) query = query.eq("category", category);
    if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);

    const { data, error, count } = await query;
    if (error || !data) {
      logSupabaseError("No se pudieron leer noticias publicadas.", error);
      return { items: [], total: 0, page, pageSize };
    }

    return {
      items: data.map((item) => mapNewsRow(item as NewsRow)),
      total: count ?? data.length,
      page,
      pageSize
    };
  } catch (error) {
    logSupabaseError("Excepción leyendo noticias publicadas.", error);
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getNewsBySlug(slug: string) {
  if (!isSupabaseConfigured()) {
    return news.find((item) => item.slug === slug && item.status === "published") ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("id,title,slug,excerpt,content_html,category,image_path,featured,status,published_at,scheduled_at,created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .single();

    if (error || !data) {
      logSupabaseError(`No se pudo leer la noticia "${slug}".`, error);
      return null;
    }
    return mapNewsRow(data as NewsRow);
  } catch (error) {
    logSupabaseError(`Excepción leyendo la noticia "${slug}".`, error);
    return null;
  }
}

export async function getAdminNews() {
  if (!isSupabaseConfigured()) return news;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("id,title,slug,excerpt,content_html,category,image_path,featured,status,published_at,scheduled_at,created_at")
      .order("created_at", { ascending: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer noticias admin.", error);
      return [];
    }
    return data.map((item) => mapNewsRow(item as NewsRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo noticias admin.", error);
    return [];
  }
}

function filterDemoEvents(params?: { category?: string; q?: string }) {
  const now = new Date();
  const category = params?.category;
  const q = params?.q?.toLowerCase().trim();
  const matchesCategory = (eventCategory: string) => {
    if (!category || category === "Todos") return true;

    const normalizedEvent = eventCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedCategory = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return normalizedEvent === normalizedCategory || normalizedEvent.includes(normalizedCategory.slice(0, 6));
  };

  return events
    .filter((event) => new Date(event.date) >= now)
    .filter((event) => matchesCategory(event.category))
    .filter((event) => (q ? `${event.title} ${event.description}`.toLowerCase().includes(q) : true))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function matchesEventCategory(eventCategory: string, category?: string) {
  if (!category || category === "Todos") return true;

  const normalizedEvent = eventCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedCategory = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return normalizedEvent === normalizedCategory || normalizedEvent.includes(normalizedCategory.slice(0, 6));
}

export async function getEvents(params?: { category?: string; q?: string }) {
  if (!isSupabaseConfigured()) return filterDemoEvents(params);

  const now = new Date().toISOString();
  const category = params?.category;
  const q = params?.q?.toLowerCase().trim();

  try {
    const supabase = await createClient();
    let query = supabase
      .from("events")
      .select("id,title,slug,description,content_html,starts_at,ends_at,location,modality,category,image_path,status,created_at")
      .eq("status", "published")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true });

    const { data, error } = await query;
    if (error || !data) {
      logSupabaseError("No se pudieron leer eventos publicados.", error);
      return [];
    }

    return data
      .map((item) => mapEventRow(item as EventRow))
      .filter((event) => matchesEventCategory(event.category, category))
      .filter((event) => (q ? `${event.title} ${event.description}`.toLowerCase().includes(q) : true));
  } catch (error) {
    logSupabaseError("Excepción leyendo eventos publicados.", error);
    return [];
  }
}

export async function getAdminEvents() {
  if (!isSupabaseConfigured()) return events;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("id,title,slug,description,content_html,starts_at,ends_at,location,modality,category,image_path,status,created_at")
      .order("starts_at", { ascending: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer eventos admin.", error);
      return [];
    }
    return data.map((item) => mapEventRow(item as EventRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo eventos admin.", error);
    return [];
  }
}

function filterDemoScholarships() {
  const now = new Date();
  return scholarships
    .filter((item) => item.status !== "cerrada")
    .filter((item) => new Date(item.deadline) >= now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export async function getScholarships() {
  if (!isSupabaseConfigured()) return filterDemoScholarships();

  const now = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scholarships")
      .select("id,title,slug,summary,requirements,documents,deadline,external_url,status,created_at")
      .in("status", ["abierta", "proxima"])
      .or(`deadline.is.null,deadline.gte.${now}`)
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer becas publicadas.", error);
      return [];
    }

    return data.map((item) => mapScholarshipRow(item as ScholarshipRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo becas publicadas.", error);
    return [];
  }
}

export async function getAdminScholarships() {
  if (!isSupabaseConfigured()) return scholarships;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scholarships")
      .select("id,title,slug,summary,requirements,documents,deadline,external_url,status,created_at")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer becas admin.", error);
      return [];
    }
    return data.map((item) => mapScholarshipRow(item as ScholarshipRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo becas admin.", error);
    return [];
  }
}

function filterDemoInternships() {
  const now = new Date();
  return internships
    .filter((item) => new Date(item.deadline) >= now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export async function getInternships() {
  if (!isSupabaseConfigured()) return filterDemoInternships();

  const now = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("internships")
      .select("id,company,title,slug,modality,career,requirements,deadline,status,created_at")
      .eq("status", "published")
      .or(`deadline.is.null,deadline.gte.${now}`)
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer pasantías publicadas.", error);
      return [];
    }

    return data.map((item) => mapInternshipRow(item as InternshipRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo pasantías publicadas.", error);
    return [];
  }
}

export async function getAdminInternships() {
  if (!isSupabaseConfigured()) return internships;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("internships")
      .select("id,company,title,slug,modality,career,requirements,deadline,status,created_at")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer pasantías admin.", error);
      return [];
    }
    return data.map((item) => mapInternshipRow(item as InternshipRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo pasantías admin.", error);
    return [];
  }
}

function filterDemoResources() {
  return resources;
}

export async function getResources() {
  if (!isSupabaseConfigured()) return filterDemoResources();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id,title,description,type,file_path,status,created_at,updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer recursos publicados.", error);
      return [];
    }

    return data.map((item) => mapResourceRow(item as ResourceRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo recursos publicados.", error);
    return [];
  }
}

export async function getAdminResources() {
  if (!isSupabaseConfigured()) return resources;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id,title,description,type,file_path,status,created_at,updated_at")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      logSupabaseError("No se pudieron leer recursos admin.", error);
      return [];
    }
    return data.map((item) => mapResourceRow(item as ResourceRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo recursos admin.", error);
    return [];
  }
}

export async function getFaqs() {
  if (!isSupabaseConfigured()) return faqs;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq")
      .select("id,question,answer,category,sort_order,published,created_at")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      logSupabaseError("No se pudieron leer FAQ publicadas.", error);
      return [];
    }

    return data.map((item) => mapFaqRow(item as FaqRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo FAQ publicadas.", error);
    return [];
  }
}

export async function getAdminFaqs() {
  if (!isSupabaseConfigured()) return faqs;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq")
      .select("id,question,answer,category,sort_order,published,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      logSupabaseError("No se pudieron leer FAQ admin.", error);
      return [];
    }
    return data.map((item) => mapFaqRow(item as FaqRow));
  } catch (error) {
    logSupabaseError("Excepción leyendo FAQ admin.", error);
    return [];
  }
}

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return siteSettings;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("id,institution_name,email,address,office_hours,logo_path,banner_path,social_links")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data) {
      logSupabaseError("No se pudo leer configuración institucional. Se usa fallback seguro.", error);
      return siteSettings;
    }
    return mapSiteSettingsRow(data as SiteSettingsRow);
  } catch (error) {
    logSupabaseError("Excepción leyendo configuración institucional. Se usa fallback seguro.", error);
    return siteSettings;
  }
}
