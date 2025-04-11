"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Inbox,
  Database,
  Settings,
  Activity,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("sensor_events")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes
    const channel = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_events",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r border-border">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-foreground">Trequer</h1>
        </Link>
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
              pathname === "/dashboard" && "bg-accent text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <LayoutDashboard
                className={cn("h-5 w-5 mr-3", "text-foreground")}
              />
              <span className="flex-1">Dashboard</span>
            </div>
          </Link>
          <Link
            href="/dashboard/inbox"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
              pathname === "/dashboard/inbox" && "bg-accent text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <Inbox className={cn("h-5 w-5 mr-3", "text-foreground")} />
              <span className="flex-1">Inbox</span>
              {unreadCount > 0 && (
                <span className="ml-2">
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                </span>
              )}
            </div>
          </Link>
          <Link
            href="/dashboard/data"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
              pathname === "/dashboard/data" && "bg-accent text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <Database className={cn("h-5 w-5 mr-3", "text-foreground")} />
              <span className="flex-1">Data</span>
            </div>
          </Link>
          <Link
            href="/dashboard/diagnostics"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
              pathname === "/dashboard/diagnostics" &&
                "bg-accent text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <Activity className={cn("h-5 w-5 mr-3", "text-foreground")} />
              <span className="flex-1">Diagnostics</span>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent rounded-lg transition",
              pathname === "/dashboard/settings" && "bg-accent text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <Settings className={cn("h-5 w-5 mr-3", "text-foreground")} />
              <span className="flex-1">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
