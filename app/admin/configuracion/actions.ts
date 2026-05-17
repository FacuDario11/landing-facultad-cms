"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SettingsFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"institutionName" | "email" | "address" | "officeHours" | "instagram" | "facebook", string>>;
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isValidOptionalUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, error: "Supabase no esta configurado. No se puede guardar la configuracion real todavia." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { supabase: null, error: "Necesitas iniciar sesion para administrar la configuracion institucional." };
  }

  return { supabase, error: null };
}

function parseSettingsForm(formData: FormData) {
  const institutionName = textValue(formData, "institutionName");
  const email = textValue(formData, "email");
  const address = textValue(formData, "address");
  const officeHours = textValue(formData, "officeHours");
  const instagram = textValue(formData, "instagram");
  const facebook = textValue(formData, "facebook");
  const errors: SettingsFormState["errors"] = {};

  if (!institutionName) errors.institutionName = "El nombre institucional es obligatorio.";
  if (!email) errors.email = "El email es obligatorio.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Ingresa un email valido.";
  if (!address) errors.address = "La direccion es obligatoria.";
  if (!officeHours) errors.officeHours = "Los horarios son obligatorios.";
  if (!isValidOptionalUrl(instagram)) errors.instagram = "Ingresa una URL valida.";
  if (!isValidOptionalUrl(facebook)) errors.facebook = "Ingresa una URL valida.";

  return { institutionName, email, address, officeHours, instagram, facebook, errors };
}

function revalidateSettingsPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/admin/configuracion");
}

export async function updateSettingsAction(_previousState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const parsed = parseSettingsForm(formData);

  if (Object.keys(parsed.errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados antes de guardar la configuracion.", errors: parsed.errors };
  }

  const { supabase, error: authError } = await getAuthenticatedSupabase();
  if (!supabase) return { ok: false, message: authError ?? "No se pudo validar la sesion." };

  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    institution_name: parsed.institutionName,
    email: parsed.email,
    address: parsed.address,
    office_hours: parsed.officeHours,
    social_links: {
      instagram: parsed.instagram,
      facebook: parsed.facebook
    }
  });

  if (error) {
    const roleHint = error.code === "42501" ? " Solo un usuario con rol super_admin puede guardar la configuración institucional." : "";
    return { ok: false, message: `Supabase no pudo guardar la configuracion: ${error.message}.${roleHint}` };
  }

  revalidateSettingsPaths();
  return { ok: true, message: "Configuracion institucional actualizada correctamente." };
}
