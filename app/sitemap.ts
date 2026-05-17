import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getNews } from "@/services/content-service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/noticias", "/eventos", "/becas", "/pasantias", "/recursos", "/faq", "/contacto"];
  const newsResult = await getNews({ pageSize: 100 });

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8
    })),
    ...newsResult.items.map((item) => ({
      url: absoluteUrl(`/noticias/${item.slug}`),
      lastModified: new Date(item.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
