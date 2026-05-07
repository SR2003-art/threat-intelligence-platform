import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-48 top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-[0_0_0_1px_rgba(15,23,42,0.6),0_20px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
