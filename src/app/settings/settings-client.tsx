"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface SettingsClientProps {
  user: {
    id: string
    email: string
    fullName: string
  }
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(user.fullName)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {message && (
            <div className={`p-4 rounded-xl text-sm ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'error-surface text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="input-surface w-full px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-ink-soft mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-surface w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Enter your full name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
        <p className="text-sm text-ink-soft mb-4">
          Permanently delete your account and all associated data.
        </p>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
