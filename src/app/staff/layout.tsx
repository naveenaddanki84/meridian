import { AppShell } from "@/components/shell/app-shell";
import { StaffGate } from "@/components/shell/staff-gate";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell defaultPersonaId="mike">
      <StaffGate>{children}</StaffGate>
    </AppShell>
  );
}
