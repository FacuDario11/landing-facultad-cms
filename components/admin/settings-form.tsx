"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsFormState } from "@/app/admin/configuracion/actions";
import type { SiteSettings } from "@/types/content";

type SettingsFormProps = {
  action: (previousState: SettingsFormState, formData: FormData) => Promise<SettingsFormState>;
  settings: SiteSettings;
};

const initialState: SettingsFormState = { ok: false, message: "" };

export function SettingsForm({ action, settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="settings-institution-name">Nombre institucional</Label>
            <Input id="settings-institution-name" name="institutionName" defaultValue={settings.institutionName} aria-invalid={Boolean(state.errors?.institutionName)} />
            {state.errors?.institutionName ? <p className="text-sm text-destructive">{state.errors.institutionName}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" name="email" type="email" defaultValue={settings.email} aria-invalid={Boolean(state.errors?.email)} />
              {state.errors?.email ? <p className="text-sm text-destructive">{state.errors.email}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-office-hours">Horarios</Label>
              <Input id="settings-office-hours" name="officeHours" defaultValue={settings.officeHours} aria-invalid={Boolean(state.errors?.officeHours)} />
              {state.errors?.officeHours ? <p className="text-sm text-destructive">{state.errors.officeHours}</p> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-address">Direccion</Label>
            <Input id="settings-address" name="address" defaultValue={settings.address} aria-invalid={Boolean(state.errors?.address)} />
            {state.errors?.address ? <p className="text-sm text-destructive">{state.errors.address}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="settings-instagram">Instagram</Label>
              <Input id="settings-instagram" name="instagram" type="url" defaultValue={settings.instagram} placeholder="https://www.instagram.com/institucion" aria-invalid={Boolean(state.errors?.instagram)} />
              {state.errors?.instagram ? <p className="text-sm text-destructive">{state.errors.instagram}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-facebook">Facebook</Label>
              <Input id="settings-facebook" name="facebook" type="url" defaultValue={settings.facebook} placeholder="https://www.facebook.com/institucion" aria-invalid={Boolean(state.errors?.facebook)} />
              {state.errors?.facebook ? <p className="text-sm text-destructive">{state.errors.facebook}</p> : null}
            </div>
          </div>

          <p className="rounded-md border border-primary/20 bg-utn-sky p-3 text-sm text-utn-ink">
            Estos datos alimentan la landing publica, el contacto y el footer. Logo, banner y textos extendidos quedan pendientes porque el flujo visual todavia no esta definido en esta fase.
          </p>

          {state.message ? (
            <p className={`rounded-md border p-3 text-sm ${state.ok ? "border-primary/20 bg-utn-sky text-utn-ink" : "border-destructive/20 bg-destructive/10 text-destructive"}`} role="status">
              {state.message}
            </p>
          ) : null}

          <Button className="w-fit" type="submit" disabled={pending}><Save className="h-4 w-4" /> Guardar configuracion</Button>
        </form>
      </CardContent>
    </Card>
  );
}
