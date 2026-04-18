import Link from "next/link"

export default function SignUpSuccess() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="card-surface p-8 max-w-md w-full text-center animate-rise">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-ink-soft mb-6">
          {"We've sent you a confirmation link. Click the link in your email to activate your account."}
        </p>
        <Link
          href="/auth/login"
          className="btn-secondary inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium"
        >
          Back to Login
        </Link>
      </div>
    </main>
  )
}
