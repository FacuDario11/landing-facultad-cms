"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ missingEnv = false, unauthorized = false }: { missingEnv?: boolean; unauthorized?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function signIn(formData: FormData) {
    setLoading(true);
    setMessage("");
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function resetPassword(formData: FormData) {
    const email = String(formData.get("email"));
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/login` });
    setMessage(error ? error.message : "Enviamos las instrucciones de recuperación al correo indicado.");
  }

  return (
    <Card className="w-full max-w-md shadow-soft">
      <CardContent className="p-6">
        <form action={signIn} className="grid gap-4">
          <div>
            <h1 className="text-2xl font-bold text-inst-ink">Ingreso administrativo</h1>
            <p className="mt-2 text-sm text-muted-foreground">Acceso interno para equipos autorizados de Consejería Estudiantil.</p>
          </div>
          {missingEnv ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              El panel está protegido: faltan variables públicas de Supabase para validar la sesión. Configuralas en Netlify antes de usar el acceso administrativo.
            </p>
          ) : null}
          {unauthorized ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              Tu usuario está autenticado, pero no tiene rol administrativo habilitado para ingresar al panel.
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required placeholder="admin@institucion.edu.ar" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {message ? <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p> : null}
          <Button disabled={loading || missingEnv}>{loading ? "Ingresando..." : "Ingresar"}</Button>
          <Button formAction={resetPassword} variant="link" className="px-0" disabled={missingEnv}>Recuperar contraseña</Button>
        </form>
      </CardContent>
    </Card>
  );
}
