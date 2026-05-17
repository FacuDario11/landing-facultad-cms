export type UserRole = "super_admin" | "editor" | "moderator";

export type ContentStatus = "draft" | "scheduled" | "published" | "archived";

export type NewsCategory =
  | "institucional"
  | "becas"
  | "pasantias"
  | "bienestar"
  | "academica"
  | "eventos";

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  imageUrl: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
  scheduledAt?: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  modality: "presencial" | "virtual" | "hibrida";
  category: string;
  imageUrl?: string;
  content?: string;
  endsAt?: string | null;
  status?: ContentStatus;
};

export type Scholarship = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  requirements: string[];
  documents: string[];
  deadline: string;
  link: string;
  status: "abierta" | "proxima" | "cerrada";
};

export type Internship = {
  id: string;
  company: string;
  title: string;
  slug: string;
  modality: "presencial" | "remota" | "hibrida";
  requirements: string[];
  deadline: string;
  career: string;
  status?: ContentStatus;
};

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "formulario" | "reglamento" | "guia";
  fileUrl: string;
  updatedAt: string;
  status?: ContentStatus;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  published?: boolean;
};

export type SiteSettings = {
  institutionName: string;
  email: string;
  address: string;
  officeHours: string;
  instagram: string;
  facebook: string;
  logoPath?: string | null;
  bannerPath?: string | null;
};
