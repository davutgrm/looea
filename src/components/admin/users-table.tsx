"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toggleUserActive, changeUserRole } from "@/lib/actions/admin";
import type { Role } from "@/generated/prisma/client";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  active: boolean;
  createdAtLabel: string;
  business: { id: string; name: string } | null;
  appointmentCount: number;
  reviewCount: number;
};

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Müşteri",
  BUSINESS_OWNER: "İşletme Sahibi",
  ADMIN: "Admin",
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>İşletme</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead>Aktif</TableHead>
            <TableHead className="text-right">Detay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <UserRowItem key={u.id} user={u} isSelf={u.id === currentUserId} />
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState icon={Users} title="Kullanıcı bulunamadı" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UserRowItem({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(user.active);
  const [role, setRole] = useState<Role>(user.role);

  function handleToggleActive(next: boolean) {
    const prev = active;
    setActive(next);
    startTransition(async () => {
      const result = await toggleUserActive(user.id, next);
      if (!result.success) {
        setActive(prev);
        toast.error(result.error);
      } else {
        toast.success(next ? "Kullanıcı aktif edildi" : "Kullanıcı pasif edildi");
      }
    });
  }

  function handleRoleChange(next: string) {
    const prev = role;
    setRole(next as Role);
    startTransition(async () => {
      const result = await changeUserRole(user.id, next as Role);
      if (!result.success) {
        setRole(prev);
        toast.error(result.error);
      } else {
        toast.success("Rol güncellendi");
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select value={role} onValueChange={handleRoleChange} disabled={isPending || isSelf}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {user.business ? (
          <Link
            href={`/admin/isletmeler/${user.business.id}`}
            className="text-sm text-primary hover:underline"
          >
            {user.business.name}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{user.createdAtLabel}</TableCell>
      <TableCell>
        <Switch
          checked={active}
          disabled={isPending || (isSelf && active)}
          onCheckedChange={handleToggleActive}
        />
      </TableCell>
      <TableCell
        className="text-right text-xs text-muted-foreground"
        title={user.phone ? `Telefon: ${user.phone}` : undefined}
      >
        {user.appointmentCount} randevu · {user.reviewCount} yorum
      </TableCell>
    </TableRow>
  );
}
