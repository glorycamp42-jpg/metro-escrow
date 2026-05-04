import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { AiProvider } from "@/components/ai/AiProvider";
import { AiPanel } from "@/components/ai/AiPanel";
import { RoleProvider } from "@/components/role/RoleProvider";

export default function StaffLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <AiProvider>
        <div className="min-h-screen flex bg-cream-100">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 px-5 md:px-7 py-6 max-w-[1400px] w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
        <AiPanel />
      </AiProvider>
    </RoleProvider>
  );
}
