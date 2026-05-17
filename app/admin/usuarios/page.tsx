import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const users = [
  { name: "Administración Consejería", email: "admin@frt.utn.edu.ar", role: "Super Admin" },
  { name: "Editor Institucional", email: "editor@frt.utn.edu.ar", role: "Editor" },
  { name: "Moderación", email: "moderador@frt.utn.edu.ar", role: "Moderador" }
];

export default function AdminUsersPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-utn-ink">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Roles y permisos: Super Admin, Editor y Moderador.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {users.map((user) => (
            <div key={user.email} className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div>
                <p className="font-semibold text-utn-ink">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
