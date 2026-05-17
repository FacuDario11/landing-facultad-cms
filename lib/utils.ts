import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "d 'de' MMMM, yyyy") {
  return format(new Date(date), pattern, { locale: es });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function absoluteUrl(path = "") {
  const netlifyUrl = process.env.URL ? `https://${process.env.URL.replace(/^https?:\/\//, "")}` : "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || netlifyUrl || "http://localhost:3000";

  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL && !netlifyUrl) {
    console.warn("NEXT_PUBLIC_SITE_URL no está configurada; metadata/sitemap usarán localhost como fallback.");
  }

  return `${base}${path}`;
}
