// File: src/shifts/page.tsx
// Commit: initial shifts panel route with placeholder for shift management tools

'use client'

export default function ShiftsPage() {
  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        This is where managers will assign shifts and view shift history. Scheduler panel coming soon.
      </div>
    </main>
  )
}
