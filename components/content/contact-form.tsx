"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const nextErrors: FormErrors = {};
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (name.length < 3) nextErrors.name = "Ingresá tu nombre y apellido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Ingresá un correo válido.";
    if (subject.length < 4) nextErrors.subject = "Indicá brevemente el motivo de la consulta.";
    if (message.length < 10) nextErrors.message = "Escribí una consulta con al menos 10 caracteres.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      event.currentTarget.reset();
      setSuccess(true);
    }
  }

  return (
    <form className="grid gap-4 rounded-lg border bg-card p-5 shadow-soft" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre y apellido</Label>
        <Input id="name" name="name" placeholder="Tu nombre" aria-invalid={Boolean(errors.name)} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" placeholder="tu.correo@ejemplo.edu.ar" aria-invalid={Boolean(errors.email)} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="subject">Motivo</Label>
        <Input id="subject" name="subject" placeholder="Consulta, trámite o acompañamiento" aria-invalid={Boolean(errors.subject)} />
        {errors.subject ? <p className="text-sm text-destructive">{errors.subject}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea id="message" name="message" placeholder="Contanos brevemente qué necesitás consultar." aria-invalid={Boolean(errors.message)} />
        {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
      </div>
      {success ? (
        <p className="rounded-md border border-primary/20 bg-utn-sky p-3 text-sm text-utn-ink" role="status">
          Consulta registrada en modo demo. En la siguiente fase se conectará el envío real por backend o correo institucional.
        </p>
      ) : null}
      <Button type="submit">Enviar consulta demo</Button>
    </form>
  );
}
