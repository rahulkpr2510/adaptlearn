import { createClient } from "@/lib/supabase/server";
import { SiteNavbarClient } from "@/components/site-navbar-client";

export async function SiteNavbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, subscription_tier, points, current_streak')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <SiteNavbarClient 
      user={user ? {
        id: user.id,
        email: user.email ?? '',
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        subscriptionTier: profile?.subscription_tier ?? 'free',
        points: profile?.points ?? 0,
        currentStreak: profile?.current_streak ?? 0,
      } : null}
    />
  );
}
