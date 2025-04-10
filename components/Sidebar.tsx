"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Database,
  Settings,
  Activity,
  InboxIcon,
} from "lucide-react";
import { useUnreadCount } from "@/lib/hooks/useUnreadCount";
import { Badge } from "./ui/badge";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-foreground",
  },
  {
    label: "Inbox",
    icon: InboxIcon,
    href: "/dashboard/inbox",
    color: "text-foreground",
    showCount: true,
  },
  {
    label: "Data",
    icon: Database,
    href: "/dashboard/data",
    color: "text-foreground",
  },
  {
    label: "Diagnostics",
    icon: Activity,
    href: "/dashboard/diagnostics",
    color: "text-foreground",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-foreground",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r border-border">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-foreground">Trequer</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
                pathname === route.href
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                <span className="flex-1">{route.label}</span>
                {route.showCount && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
