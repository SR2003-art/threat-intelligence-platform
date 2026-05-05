import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto w-full max-w-screen-2xl px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {children}
      </div>
    </div>
  )
}
