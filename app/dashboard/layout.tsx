"use client";

import { Sidebar } from "../../components/Sidebar";
import { ErrorBoundary } from "../../components/ui/error-boundary";
import Link from "next/link";
import { Home } from "lucide-react";

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
          {/* Mobile home link - visible only on mobile when sidebar is hidden */}
          <div className="md:hidden p-4 border-b border-border bg-background">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Return to homepage"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}
