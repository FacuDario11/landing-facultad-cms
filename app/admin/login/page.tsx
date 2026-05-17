import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ demo?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="-m-4 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4 lg:-m-8">
      <LoginForm missingEnv={params.demo === "missing-env"} unauthorized={params.error === "unauthorized"} />
    </div>
  );
}
