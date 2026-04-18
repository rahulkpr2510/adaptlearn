import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"

export const metadata = {
  title: "Settings - AdaptLearn",
  description: "Manage your account settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/settings")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="flex-1">
      <div className="page-shell py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>
          
          <SettingsClient 
            user={{
              id: user.id,
              email: user.email ?? '',
              fullName: profile?.full_name ?? '',
            }}
          />
        </div>
      </div>
    </main>
  )
}
