import Link from "next/link"

export default function AuthError() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="card-surface p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
        <p className="text-ink-soft mb-6">
          Something went wrong during authentication. Please try again.
        </p>
        <Link
          href="/auth/login"
          className="btn-primary inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium"
        >
          Back to Login
        </Link>
      </div>
    </main>
  )
}
