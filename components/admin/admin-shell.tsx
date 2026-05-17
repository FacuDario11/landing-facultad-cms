"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarDays, CircleHelp, FileText, GraduationCap, LayoutDashboard, LogOut, Newspaper, Settings, UserCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/becas", label: "Becas", icon: GraduationCap },
  { href: "/admin/pasantias", label: "Pasantías", icon: BriefcaseBusiness },
  { href: "/admin/recursos", label: "Recursos", icon: FileText },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userLabel, setUserLabel] = useState("Administrador demo");

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const supabaseConfigured = isSupabaseConfigured();

    if (!supabaseConfigured) {
      setUserLabel("Administrador demo");
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserLabel(data.user?.email ?? "Administrador demo");
    });
  }, [pathname]);

  async function handleSignOut() {
    const supabaseConfigured = isSupabaseConfigured();

    if (supabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">PE</div>
          <div>
            <p className="text-sm font-bold text-inst-ink">Panel Consejería</p>
            <p className="text-xs text-muted-foreground">Administración CMS</p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary",
                pathname === item.href && "bg-inst-sky text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-inst-ink">
            <BarChart3 className="h-4 w-4 text-primary" />
            Gestión institucional de contenidos
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <UserCircle className="h-4 w-4 text-primary" />
              <span className="max-w-48 truncate">{userLabel}</span>
            </div>
            <Link href="/" className="hidden text-sm font-medium text-primary sm:inline">Ver sitio público</Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-3 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold text-muted-foreground",
                pathname === item.href && "border-primary bg-inst-sky text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
