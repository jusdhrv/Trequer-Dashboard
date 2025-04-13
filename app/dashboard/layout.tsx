"use client";

import { Sidebar } from "../../components/Sidebar";
import { ErrorBoundary } from "../../components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-full relative">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        </div>
        <main className="md:pl-72">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}
