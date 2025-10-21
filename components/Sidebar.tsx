"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  Inbox,
  Database,
  Settings,
  Activity,
  Home,
} from "lucide-react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUnreadCount = useCallback(
    async (retryAttempt = 0) => {
      try {
        const { count, error } = await supabase
          .from("sensor_events")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false);

        if (error) throw error;

        if (count !== null) {
          setUnreadCount(count);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);

        if (retryAttempt < MAX_RETRIES) {
          setTimeout(() => {
            fetchUnreadCount(retryAttempt + 1);
          }, RETRY_DELAY * Math.pow(2, retryAttempt)); // Exponential backoff
        } else {
          setRetryCount(retryAttempt);
          toast({
            title: "Error",
            description:
              "Failed to fetch unread messages. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to changes
    const newChannel = supabase
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setChannel(newChannel);
        } else {
          console.error("Failed to subscribe to changes");
          toast({
            title: "Connection Error",
            description: "Failed to subscribe to real-time updates",
            variant: "destructive",
          });
        }
      });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [fetchUnreadCount]);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r border-border">
      <div className="px-3 py-2 flex-1">
        <Link 
          href="/" 
          className="flex items-center pl-3 mb-14 hover:bg-accent rounded-lg transition-colors p-2 -ml-2 group"
          aria-label="Return to homepage"
        >
          <Home className="h-5 w-5 mr-2 text-foreground group-hover:text-primary transition-colors" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">Trequer</h1>
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
