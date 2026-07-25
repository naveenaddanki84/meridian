import { AppShell } from "@/components/shell/app-shell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppShell defaultPersonaId="emily">{children}</AppShell>;
}
