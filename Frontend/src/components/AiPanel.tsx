import { useState } from 'react'
import { api } from '../services/api'

type AiResponse = {
  raw: string
}

export function AiPanel() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<AiResponse | null>(null)

  const handleAsk = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!prompt.trim()) return

    try {
      setLoading(true)
      setError(null)
      const result = await api.post('/ai/recommend', { prompt: prompt.trim() })
      const raw =
        typeof result.data === 'string'
          ? result.data
          : JSON.stringify(result.data, null, 2)
      setResponse({ raw })
    } catch {
      setError('Unable to fetch AI response right now.')
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="mb-3 text-lg font-medium text-slate-100">AI Panel</h2>

      <form onSubmit={handleAsk} className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Ask for threat intel recommendations..."
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded border border-violet-700 bg-violet-800/70 px-4 py-2 text-sm hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 rounded border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-violet-400" />
          Generating response...
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {response ? (
        <article className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-violet-300">
            AI Response
          </p>
          <pre className="whitespace-pre-wrap break-words text-sm text-slate-200">
            {response.raw}
          </pre>
        </article>
      ) : null}
    </section>
  )
}
