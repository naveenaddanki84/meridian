import { AppShell } from "@/components/shell/app-shell";
import { StaffGate } from "@/components/shell/staff-gate";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell defaultPersonaId="marcus">
      <StaffGate>{children}</StaffGate>
    </AppShell>
  );
}
