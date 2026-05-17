"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";

const navItems = [
  { href: "/noticias", label: "Noticias" },
  { href: "/eventos", label: "Eventos" },
  { href: "/becas", label: "Becas" },
  { href: "/pasantias", label: "Pasantías" },
  { href: "/recursos", label: "Recursos" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" }
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">PE</div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-inst-ink">{settings.institutionName}</p>
            <p className="text-xs text-muted-foreground">Facultad / Institución educativa</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir navegación" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn("border-t bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="container grid gap-1 py-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
