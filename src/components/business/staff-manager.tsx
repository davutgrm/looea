"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Clock, CalendarOff, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/business/empty-state";
import { StaffFormDialog, type StaffRow } from "@/components/business/staff-form-dialog";
import { StaffScheduleSheet, type ScheduleBlock } from "@/components/business/staff-schedule-sheet";
import { StaffTimeOffSheet, type TimeOffRow } from "@/components/business/staff-timeoff-sheet";
import { toggleStaffActive } from "@/lib/actions/business";

export type StaffWithDetails = StaffRow & {
  serviceNames: string[];
  schedule: ScheduleBlock[];
  timeOff: TimeOffRow[];
};

export function StaffManager({
  staff,
  serviceOptions,
}: {
  staff: StaffWithDetails[];
  serviceOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [scheduleTargetId, setScheduleTargetId] = useState<string | null>(null);
  const [timeOffTargetId, setTimeOffTargetId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Derive from the live `staff` prop (not a snapshot) so the sheets reflect
  // updates after router.refresh() following a mutation inside them.
  const scheduleTarget = staff.find((s) => s.id === scheduleTargetId) ?? null;
  const timeOffTarget = staff.find((s) => s.id === timeOffTargetId) ?? null;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: StaffRow) {
    setEditing(s);
    setFormOpen(true);
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleStaffActive(id, active);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{staff.length} çalışan</p>
        <Button variant="accent" onClick={openCreate}>
          <Plus /> Yeni Çalışan
        </Button>
      </div>

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Henüz çalışan eklemedin"
          description="Randevularda seçilebilmesi için ekibindeki kişileri ekle."
          action={
            <Button variant="accent" size="sm" onClick={openCreate}>
              <Plus /> İlk çalışanını ekle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar>
                      {s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt={s.name} /> : null}
                      <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                        {s.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      {s.title ? <span className="text-xs text-muted-foreground">{s.title}</span> : null}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                    <Pencil className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {s.serviceNames.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Hizmet atanmadı</span>
                  ) : (
                    s.serviceNames.map((name) => (
                      <Badge key={name} variant="outline">
                        {name}
                      </Badge>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScheduleTargetId(s.id)}
                  >
                    <Clock className="size-3.5" /> Çalışma Saatleri
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setTimeOffTargetId(s.id)}
                  >
                    <CalendarOff className="size-3.5" /> İzinler
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <span className="text-xs text-muted-foreground">Aktif</span>
                  <Switch
                    checked={s.active}
                    onCheckedChange={(v) => handleToggle(s.id, v)}
                    className="data-checked:bg-app-accent"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} staff={editing} serviceOptions={serviceOptions} />

      {scheduleTarget ? (
        <StaffScheduleSheet
          open={!!scheduleTarget}
          onOpenChange={(v) => !v && setScheduleTargetId(null)}
          staffId={scheduleTarget.id}
          staffName={scheduleTarget.name}
          initialSchedule={scheduleTarget.schedule}
        />
      ) : null}

      {timeOffTarget ? (
        <StaffTimeOffSheet
          open={!!timeOffTarget}
          onOpenChange={(v) => !v && setTimeOffTargetId(null)}
          staffId={timeOffTarget.id}
          staffName={timeOffTarget.name}
          timeOff={timeOffTarget.timeOff}
        />
      ) : null}
    </div>
  );
}
