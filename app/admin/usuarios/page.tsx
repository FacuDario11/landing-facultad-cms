import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const users = [
  { name: "Administración del portal", email: "admin@facultad.edu.ar", role: "Super Admin" },
  { name: "Editor Institucional", email: "editor@facultad.edu.ar", role: "Editor" },
  { name: "Moderación de contenidos", email: "moderador@facultad.edu.ar", role: "Moderador" }
];

export default function AdminUsersPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-inst-ink">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Roles y permisos: Super Admin, Editor y Moderador.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5">
          {users.map((user) => (
            <div key={user.email} className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div>
                <p className="font-semibold text-inst-ink">{user.name}</p>
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
