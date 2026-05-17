import { updateSettingsAction } from "@/app/admin/configuracion/actions";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/services/content-service";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-inst-ink">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configuración institucional conectada a Supabase para datos públicos de contacto y redes.</p>
      </div>
      <SettingsForm action={updateSettingsAction} settings={settings} />
    </div>
  );
}
