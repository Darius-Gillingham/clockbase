// File: src/auth/page.tsx
// Commit: initial auth route with placeholder for login or registration routing

'use client'

export default function AuthPage() {
  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Authentication</h1>
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        This will route users to login, register, or reset depending on flow.
      </div>
    </main>
  )
}
