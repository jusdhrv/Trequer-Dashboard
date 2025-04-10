import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchCount = async () => {
    try {
      const { count: unreadCount, error } = await supabase
        .from('sensor_events')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      setCount(unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel('unread_count_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_events',
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return count;
} 